'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getOnboardingStatus() {
    const { userId } = await auth()
    if (!userId) return null

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('has_added_gear, has_added_trip, has_used_carlo_chat, has_completed_profile')
        .eq('id', userId)
        .single()

    if (error) return null

    return {
        hasAddedGear: data.has_added_gear || false,
        hasAddedTrip: data.has_added_trip || false,
        hasUsedCarlo: data.has_used_carlo_chat || false,
        hasCompletedProfile: data.has_completed_profile || false,
    }
}
