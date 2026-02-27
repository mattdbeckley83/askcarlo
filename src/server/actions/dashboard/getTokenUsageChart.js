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
        .select('amount, transaction_type, created_at, metadata')
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
        dateMap[key] = { input: 0, output: 0 }
    }

    for (const tx of data || []) {
        const key = new Date(tx.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
        if (!dateMap[key]) dateMap[key] = { input: 0, output: 0 }
        dateMap[key].input += tx.metadata?.input_tokens || 0
        dateMap[key].output += tx.metadata?.output_tokens || 0
    }

    const dates = Object.keys(dateMap)
    const inputSeries = dates.map((d) => dateMap[d].input)
    const outputSeries = dates.map((d) => dateMap[d].output)

    return { success: true, dates, inputSeries, outputSeries }
}
