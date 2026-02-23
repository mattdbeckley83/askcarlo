'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getReferralCode() {
    const { userId } = await auth()
    if (!userId) return { error: 'Unauthorized' }

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('referral_code')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching referral code:', error)
        return { error: 'Failed to fetch referral code' }
    }

    return { success: true, referralCode: data.referral_code }
}
