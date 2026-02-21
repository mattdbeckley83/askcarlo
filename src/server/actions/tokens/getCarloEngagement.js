'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Get Carlo engagement data for the current user.
 * Returns current token balance, this month's usage by feature type, and all-time totals.
 */
export async function getCarloEngagement() {
    const { userId } = await auth()
    if (!userId) {
        return { error: 'Unauthorized' }
    }

    // Get current balance
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single()

    if (userError) {
        console.error('Error fetching user token balance:', userError)
        return { error: 'Failed to fetch engagement data' }
    }

    // Start of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // This month's deduction transactions
    const { data: monthlyTx, error: monthlyError } = await supabaseAdmin
        .from('token_transactions')
        .select('amount, transaction_type, api_cost_cents, created_at')
        .eq('user_id', userId)
        .lt('amount', 0)
        .gte('created_at', startOfMonth)
        .order('created_at', { ascending: false })

    if (monthlyError) {
        console.error('Error fetching monthly transactions:', monthlyError)
        return { error: 'Failed to fetch engagement data' }
    }

    // All-time deduction transactions (for total stats)
    const { data: allTimeTx, error: allTimeError } = await supabaseAdmin
        .from('token_transactions')
        .select('amount, api_cost_cents')
        .eq('user_id', userId)
        .lt('amount', 0)

    if (allTimeError) {
        console.error('Error fetching all-time transactions:', allTimeError)
        return { error: 'Failed to fetch engagement data' }
    }

    // Monthly totals
    const monthlyTokensUsed = monthlyTx.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const monthlyApiCostCents = monthlyTx.reduce((sum, tx) => sum + (tx.api_cost_cents || 0), 0)

    // Monthly breakdown by feature type
    const monthlyByType = {}
    for (const tx of monthlyTx) {
        const type = tx.transaction_type || 'other'
        if (!monthlyByType[type]) {
            monthlyByType[type] = { tokens: 0, apiCostCents: 0, count: 0 }
        }
        monthlyByType[type].tokens += Math.abs(tx.amount)
        monthlyByType[type].apiCostCents += tx.api_cost_cents || 0
        monthlyByType[type].count += 1
    }

    // All-time totals
    const totalTokensUsed = allTimeTx.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const totalApiCostCents = allTimeTx.reduce((sum, tx) => sum + (tx.api_cost_cents || 0), 0)

    return {
        success: true,
        currentBalance: userData.token_balance || 0,
        monthly: {
            tokensUsed: monthlyTokensUsed,
            apiCostCents: monthlyApiCostCents,
            byType: monthlyByType,
        },
        allTime: {
            tokensUsed: totalTokensUsed,
            apiCostCents: totalApiCostCents,
        },
    }
}
