'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getTokenUsageChart() {
    const { userId } = await auth()
    if (!userId) return { error: 'Unauthorized' }

    const since = new Date()
    since.setDate(since.getDate() - 29)
    since.setHours(0, 0, 0, 0)

    const { data, error } = await supabaseAdmin
        .from('token_transactions')
        .select('amount, transaction_type, created_at')
        .eq('user_id', userId)
        .lt('amount', 0)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching token usage chart data:', error)
        return { error: 'Failed to fetch chart data' }
    }

    // Seed all 30 days so the x-axis is continuous
    const dateMap = {}
    for (let i = 0; i < 30; i++) {
        const d = new Date(since)
        d.setDate(since.getDate() + i)
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        dateMap[key] = { chat: 0, smartFill: 0 }
    }

    for (const tx of data || []) {
        const key = new Date(tx.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
        if (!dateMap[key]) dateMap[key] = { chat: 0, smartFill: 0 }
        const tokens = Math.abs(tx.amount)
        if (tx.transaction_type === 'smart_fill') {
            dateMap[key].smartFill += tokens
        } else {
            dateMap[key].chat += tokens
        }
    }

    const dates = Object.keys(dateMap)
    const chatSeries = dates.map((d) => dateMap[d].chat)
    const smartFillSeries = dates.map((d) => dateMap[d].smartFill)

    return { success: true, dates, chatSeries, smartFillSeries }
}
