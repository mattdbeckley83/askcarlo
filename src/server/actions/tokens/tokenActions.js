'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Get the current user's token balance
 * @returns {Promise<{success: boolean, balance: number} | {error: string}>}
 */
export async function getUserTokenBalance() {
    const { userId } = await auth()
    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching token balance:', error)
        return { error: 'Failed to get balance' }
    }

    return { success: true, balance: data.token_balance || 0 }
}

/**
 * Check if user has sufficient tokens (balance > 0)
 * @returns {Promise<{allowed: boolean, balance: number}>}
 */
export async function hasSufficientTokens() {
    const result = await getUserTokenBalance()
    if (result.error) {
        return { allowed: false, balance: 0 }
    }
    return { allowed: result.balance > 0, balance: result.balance }
}

/**
 * Deduct tokens from user's balance
 * @param {number} amount - Number of tokens to deduct
 * @param {string} transactionType - Type of transaction (e.g., 'carlo_chat', 'smart_fill')
 * @param {string} description - Description of the transaction
 * @param {number|null} apiCostCents - Optional API cost in cents (stored as integer)
 * @returns {Promise<{success: boolean, newBalance: number} | {error: string}>}
 */
export async function deductTokens(amount, transactionType, description, apiCostCents = null, inputTokens = null, outputTokens = null) {
    const { userId } = await auth()
    if (!userId) {
        return { error: 'Unauthorized' }
    }

    // Get current balance first
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single()

    if (userError) {
        console.error('Error fetching user for token deduction:', userError)
        return { error: 'Failed to fetch user balance' }
    }

    const currentBalance = userData.token_balance || 0
    const newBalance = Math.max(0, currentBalance - amount)

    // Update balance
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ token_balance: newBalance })
        .eq('id', userId)

    if (updateError) {
        console.error('Error updating token balance:', updateError)
        return { error: 'Failed to update balance' }
    }

    // Record transaction
    const { error: txError } = await supabaseAdmin
        .from('token_transactions')
        .insert({
            user_id: userId,
            amount: -amount, // Negative for deductions
            balance_after: newBalance,
            transaction_type: transactionType,
            description: description,
            metadata: {
                ...(apiCostCents != null && { api_cost_cents: apiCostCents }),
                ...(inputTokens != null && { input_tokens: inputTokens }),
                ...(outputTokens != null && { output_tokens: outputTokens }),
            },
        })

    if (txError) {
        console.error('Error recording token transaction:', txError)
        // Don't fail - balance was already updated
    }

    return { success: true, newBalance }
}

// Billing constants
const CENTS_PER_TOKEN = 1 // 1 token = $0.01 (one cent)
const BILLING_MARKUP  = 5 // We charge 5× the raw Anthropic API cost

/**
 * Calculate tokens from API usage
 * Formula: (API cost in cents × BILLING_MARKUP) / CENTS_PER_TOKEN, rounded up, minimum 1
 *
 * Sonnet 4 pricing:
 * - Input:  $3.00 per 1M tokens = 0.0003 cents per token
 * - Output: $15.00 per 1M tokens = 0.0015 cents per token
 *
 * Note: This is a pure utility function, but must be async since it's in a 'use server' file
 *
 * @param {number} inputTokens - Number of input tokens used
 * @param {number} outputTokens - Number of output tokens used
 * @returns {Promise<{tokens: number, costCents: number}>}
 */
export async function calculateTokensFromCost(inputTokens, outputTokens) {
    // Sonnet 4 pricing: $3/1M input, $15/1M output
    const inputCostCents  = (inputTokens  / 1_000_000) * 300  // $3  = 300 cents per 1M
    const outputCostCents = (outputTokens / 1_000_000) * 1500 // $15 = 1500 cents per 1M
    const totalCostCents  = inputCostCents + outputCostCents

    // Tokens to charge = (API cost × markup) ÷ cents-per-token, rounded up, minimum 1
    const tokens = Math.max(1, Math.ceil((totalCostCents * BILLING_MARKUP) / CENTS_PER_TOKEN))

    return { tokens, costCents: totalCostCents }
}
