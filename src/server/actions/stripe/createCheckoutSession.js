'use server'

import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'
import { TOKEN_PACKAGES } from '@/lib/tokenPackages'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function createCheckoutSession(packageId = 'starter') {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Not authenticated' }
    }

    const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId)
    if (!pkg) {
        return { error: 'Invalid package' }
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
                    price_data: {
                        currency: 'usd',
                        unit_amount: pkg.priceUsd * 100,
                        product_data: {
                            name: `Carlo — ${pkg.label}`,
                            description: `${pkg.tokens.toLocaleString()} AI tokens for chatting with Carlo`,
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
                tokensToAdd: String(pkg.tokens),
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
