'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getDashboardStats() {
    const { userId } = await auth()
    if (!userId) return { error: 'Unauthorized' }

    const [itemsResult, tripsResult, conversationsResult] = await Promise.all([
        supabaseAdmin
            .from('items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
        supabaseAdmin
            .from('trips')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
        supabaseAdmin
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId),
    ])

    return {
        totalItems: itemsResult.count ?? 0,
        totalTrips: tripsResult.count ?? 0,
        totalConversations: conversationsResult.count ?? 0,
    }
}
