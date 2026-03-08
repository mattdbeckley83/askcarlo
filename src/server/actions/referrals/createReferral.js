'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function createReferral(referralCode) {
    try {
        const { userId } = await auth()
        if (!userId || !referralCode) return { error: 'Invalid' }

        const { data: referrer } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('referral_code', referralCode.trim())
            .single()

        if (!referrer) return { error: 'Invalid referral code' }
        if (referrer.id === userId) return { error: 'Cannot refer yourself' }

        const { error } = await supabaseAdmin
            .from('referrals')
            .insert({ referrer_id: referrer.id, referee_id: userId })

        // Unique constraint on referee_id — silently ignore if already referred
        if (error && error.code !== '23505') {
            console.error('Error creating referral:', error)
            return { error: 'Failed to create referral' }
        }

        return { success: true }
    } catch (err) {
        console.error('createReferral error:', err)
        return { error: 'Failed to create referral' }
    }
}
