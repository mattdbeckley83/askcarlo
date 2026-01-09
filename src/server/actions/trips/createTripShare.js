'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import crypto from 'crypto'

/**
 * Generate a cryptographically secure 24-character base64url token
 * Uses 18 bytes (144 bits) of entropy for security
 */
function generateShareToken() {
    const bytes = crypto.randomBytes(18)
    return bytes.toString('base64url')
}

export async function createTripShare(tripId) {
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

    // Check if active share already exists
    const { data: existingShare } = await supabaseAdmin
        .from('trip_shares')
        .select('id, share_token')
        .eq('trip_id', tripId)
        .eq('is_active', true)
        .single()

    if (existingShare) {
        return {
            success: true,
            shareToken: existingShare.share_token,
            isNew: false
        }
    }

    // Create new share
    const shareToken = generateShareToken()

    const { data: newShare, error: insertError } = await supabaseAdmin
        .from('trip_shares')
        .insert({
            trip_id: tripId,
            user_id: userId,
            share_token: shareToken,
            is_active: true,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error creating trip share:', insertError)
        return { error: 'Failed to create share link' }
    }

    return {
        success: true,
        shareToken: newShare.share_token,
        isNew: true
    }
}
