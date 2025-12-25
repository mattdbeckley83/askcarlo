'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getUserItems() {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized', items: [] }
    }

    const { data: items, error } = await supabaseAdmin
        .from('items')
        .select(`
            id,
            name,
            brand,
            weight,
            weight_unit,
            categories (name)
        `)
        .eq('user_id', userId)
        .order('name')

    if (error) {
        console.error('Error fetching items:', error)
        return { error: 'Failed to load items', items: [] }
    }

    return { items: items || [] }
}

export async function getUserTrips() {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized', trips: [] }
    }

    const { data: trips, error } = await supabaseAdmin
        .from('trips')
        .select(`
            id,
            name,
            start_date,
            end_date,
            notes,
            activities (name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching trips:', error)
        return { error: 'Failed to load trips', trips: [] }
    }

    return { trips: trips || [] }
}

export async function getTripDetails(tripId) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized', tripItems: [] }
    }

    // Verify user owns this trip
    const { data: trip, error: tripError } = await supabaseAdmin
        .from('trips')
        .select('id')
        .eq('id', tripId)
        .eq('user_id', userId)
        .single()

    if (tripError || !trip) {
        return { error: 'Trip not found', tripItems: [] }
    }

    const { data: tripItems, error } = await supabaseAdmin
        .from('trip_items')
        .select(`
            id,
            quantity,
            is_worn,
            is_consumable,
            items (
                id,
                name,
                brand,
                weight,
                weight_unit,
                categories (id, name)
            )
        `)
        .eq('trip_id', tripId)

    if (error) {
        console.error('Error fetching trip details:', error)
        return { error: 'Failed to load trip details', tripItems: [] }
    }

    return { tripItems: tripItems || [] }
}
