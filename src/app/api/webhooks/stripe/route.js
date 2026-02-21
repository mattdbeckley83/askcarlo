import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req) {
    const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET is not set')
        return new Response('Webhook secret not configured', { status: 500 })
    }

    const body = await req.text()
    const headerPayload = await headers()
    const signature = headerPayload.get('stripe-signature')

    if (!signature) {
        return new Response('Missing stripe-signature header', { status: 400 })
    }

    const stripe = getStripe()
    let event

    try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object
            console.log(`[stripe-webhook] checkout.session.completed: session=${session.id}, payment_status=${session.payment_status}`)

            // Only process payment (not setup) sessions
            if (session.payment_status !== 'paid') {
                return new Response('Webhook processed', { status: 200 })
            }

            const userId = session.metadata?.userId
            const tokensToAdd = parseInt(session.metadata?.tokensToAdd || '0', 10)

            if (!userId || !tokensToAdd) {
                console.error('[stripe-webhook] Missing userId or tokensToAdd in session metadata', session.metadata)
                return new Response('Missing metadata', { status: 400 })
            }

            console.log(`[stripe-webhook] Crediting ${tokensToAdd} tokens to user ${userId}`)

            // Get current balance
            const { data: user, error: fetchError } = await supabaseAdmin
                .from('users')
                .select('token_balance')
                .eq('id', userId)
                .single()

            if (fetchError || !user) {
                console.error('[stripe-webhook] Error fetching user for token credit:', fetchError)
                return new Response('User not found', { status: 400 })
            }

            const newBalance = (user.token_balance || 0) + tokensToAdd

            // Credit tokens
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({ token_balance: newBalance })
                .eq('id', userId)

            if (updateError) {
                console.error('[stripe-webhook] Error crediting tokens:', updateError)
                throw updateError
            }

            // Record transaction
            const { error: txError } = await supabaseAdmin
                .from('token_transactions')
                .insert({
                    user_id: userId,
                    amount: tokensToAdd,
                    transaction_type: 'purchase',
                    description: `Purchased ${tokensToAdd} tokens via Stripe (session: ${session.id})`,
                })

            if (txError) {
                console.error('[stripe-webhook] Error recording token transaction:', txError)
            }

            console.log(`[stripe-webhook] Success: credited ${tokensToAdd} tokens to user ${userId}. New balance: ${newBalance}`)
        } else {
            console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
        }

        return new Response('Webhook processed', { status: 200 })
    } catch (error) {
        console.error('[stripe-webhook] Error processing webhook:', error)
        return new Response('Webhook processing failed', { status: 500 })
    }
}
