import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getResend } from '@/lib/resend'

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
                console.error('[stripe-webhook] Missing userId or tokensToAdd in session metadata')
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
                    balance_after: newBalance,
                    transaction_type: 'purchase',
                    description: `Purchased ${tokensToAdd} tokens via Stripe (session: ${session.id})`,
                    stripe_payment_id: session.payment_intent || session.id,
                })

            if (txError) {
                console.error('[stripe-webhook] Error recording token transaction:', txError)
            }

            console.log(`[stripe-webhook] Success: credited ${tokensToAdd} tokens to user ${userId}. New balance: ${newBalance}`)

            // Notify Matt of the token purchase
            try {
                const { data: buyer } = await supabaseAdmin
                    .from('users')
                    .select('email, first_name, last_name')
                    .eq('id', userId)
                    .single()

                const resend = getResend()
                const name = [buyer?.first_name, buyer?.last_name].filter(Boolean).join(' ') || 'Unknown'
                const email = buyer?.email || userId
                const dollars = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'unknown'
                const purchaseTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })

                await resend.emails.send({
                    from: 'matt@askcarlo.ai',
                    to: ['mattdbeckley@gmail.com'],
                    subject: `Token purchase: ${tokensToAdd} tokens — ${name}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111827;">
                            <p style="font-size:18px;font-weight:600;margin:0 0 16px;">Token purchase</p>
                            <table style="font-size:14px;line-height:1.8;border-collapse:collapse;width:100%;">
                                <tr><td style="color:#6b7280;padding-right:16px;">Name</td><td>${name}</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">Email</td><td>${email}</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">Tokens</td><td>${tokensToAdd}</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">Amount</td><td>${dollars}</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">Time</td><td>${purchaseTime} ET</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">Session</td><td style="font-family:monospace;font-size:12px;">${session.id}</td></tr>
                            </table>
                        </div>
                    `,
                    text: `Token purchase\n\nName: ${name}\nEmail: ${email}\nTokens: ${tokensToAdd}\nAmount: ${dollars}\nTime: ${purchaseTime} ET\nSession: ${session.id}`,
                })
            } catch (notifyError) {
                console.error('[stripe-webhook] Error sending purchase notification:', notifyError)
            }
        } else {
            console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
        }

        return new Response('Webhook processed', { status: 200 })
    } catch (error) {
        console.error('[stripe-webhook] Error processing webhook:', error)
        return new Response('Webhook processing failed', { status: 500 })
    }
}
