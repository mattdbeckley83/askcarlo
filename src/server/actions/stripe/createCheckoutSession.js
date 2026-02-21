'use server'

import { auth } from '@clerk/nextjs/server'
import { getStripe, TOKEN_PACK_PRICE_ID, TOKENS_PER_PACK } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function createCheckoutSession() {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Not authenticated' }
    }

    if (!TOKEN_PACK_PRICE_ID) {
        return { error: 'Token pack price not configured' }
    }

    try {
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email, stripe_customer_id')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return { error: 'User not found' }
        }

        const stripe = getStripe()
        let customerId = user.stripe_customer_id

        // Create Stripe customer if one doesn't exist yet
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            })
            customerId = customer.id

            await supabaseAdmin
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', userId)
        }

        const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: TOKEN_PACK_PRICE_ID,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
                tokensToAdd: String(TOKENS_PER_PACK),
            },
            success_url: `${baseUrl}/conversations?tokens=success`,
            cancel_url: `${baseUrl}/conversations?tokens=canceled`,
        })

        return { url: session.url }
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return { error: 'Failed to create checkout session' }
    }
}
