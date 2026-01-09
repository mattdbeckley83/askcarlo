'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Get the current share status for a trip (requires auth)
 */
export async function getTripShareStatus(tripId) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!tripId) {
        return { error: 'Trip ID is required' }
    }

    // Verify user owns this trip
    const { data: trip, error: tripError } = await supabaseAdmin
        .from('trips')
        .select('id, user_id')
        .eq('id', tripId)
        .single()

    if (tripError || !trip) {
        return { error: 'Trip not found' }
    }

    if (trip.user_id !== userId) {
        return { error: 'Unauthorized' }
    }

    // Get share status
    const { data: share } = await supabaseAdmin
        .from('trip_shares')
        .select('id, share_token, is_active, created_at')
        .eq('trip_id', tripId)
        .single()

    if (!share) {
        return {
            success: true,
            hasShare: false,
            isActive: false,
            shareToken: null,
        }
    }

    return {
        success: true,
        hasShare: true,
        isActive: share.is_active,
        shareToken: share.share_token,
        createdAt: share.created_at,
    }
}
