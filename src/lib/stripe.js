import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-12-18.acacia',
      })
    : null

export function getStripe() {
    if (!stripe) {
        throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    return stripe
}

export const TOKEN_PACK_PRICE_ID = process.env.STRIPE_TOKEN_PACK_PRICE_ID
export const TOKENS_PER_PACK = 500
