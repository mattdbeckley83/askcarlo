'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getReferrals() {
    const { userId } = await auth()
    if (!userId) return { error: 'Unauthorized' }

    const { data, error } = await supabaseAdmin
        .from('referrals')
        .select(`
            id,
            status,
            referrer_tokens_awarded,
            referee_tokens_awarded,
            activated_at,
            created_at,
            referee:users!referrals_referee_id_fkey(first_name, email)
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching referrals:', error)
        return { error: 'Failed to fetch referrals' }
    }

    return { success: true, referrals: data || [] }
}
