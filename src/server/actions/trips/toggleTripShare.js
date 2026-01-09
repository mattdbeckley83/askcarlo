'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import crypto from 'crypto'

/**
 * Generate a cryptographically secure 24-character base64url token
 */
function generateShareToken() {
    const bytes = crypto.randomBytes(18)
    return bytes.toString('base64url')
}

export async function toggleTripShare(tripId) {
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

    // Check if share exists for this trip
    const { data: existingShare } = await supabaseAdmin
        .from('trip_shares')
        .select('id, share_token, is_active')
        .eq('trip_id', tripId)
        .single()

    if (existingShare) {
        // Toggle the existing share
        const newStatus = !existingShare.is_active

        const { error: updateError } = await supabaseAdmin
            .from('trip_shares')
            .update({ is_active: newStatus })
            .eq('id', existingShare.id)

        if (updateError) {
            console.error('Error toggling trip share:', updateError)
            return { error: 'Failed to update share status' }
        }

        return {
            success: true,
            isActive: newStatus,
            shareToken: existingShare.share_token,
        }
    }

    // No existing share - create a new active one
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
        isActive: true,
        shareToken: newShare.share_token,
    }
}
