'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Get trip data for a share token (public access - no auth required)
 * Returns full trip data if share is valid and active
 */
export async function getTripShare(shareToken) {
    if (!shareToken) {
        return { error: 'Share token is required', errorType: 'invalid' }
    }

    // Find the share record
    const { data: share, error: shareError } = await supabaseAdmin
        .from('trip_shares')
        .select('id, trip_id, is_active')
        .eq('share_token', shareToken)
        .single()

    if (shareError || !share) {
        return { error: 'Invalid share link', errorType: 'invalid' }
    }

    if (!share.is_active) {
        return { error: 'This share link is no longer active', errorType: 'inactive' }
    }

    // Get the trip data
    const { data: trip, error: tripError } = await supabaseAdmin
        .from('trips')
        .select(`
            *,
            activities (
                id,
                name
            )
        `)
        .eq('id', share.trip_id)
        .single()

    if (tripError || !trip) {
        return { error: 'Trip no longer available', errorType: 'deleted' }
    }

    // Get trip items with full item details
    const { data: tripItems, error: itemsError } = await supabaseAdmin
        .from('trip_items')
        .select(`
            *,
            items (
                id,
                name,
                brand,
                weight,
                weight_unit,
                category_id,
                item_type_id
            )
        `)
        .eq('trip_id', share.trip_id)
        .order('created_at', { ascending: true })

    if (itemsError) {
        console.error('Error fetching trip items:', itemsError)
    }

    // Get categories for the trip owner
    const { data: categories, error: categoriesError } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('user_id', trip.user_id)
        .order('name')

    if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
    }

    return {
        success: true,
        trip,
        tripItems: tripItems || [],
        categories: categories || [],
        activity: trip.activities,
    }
}
