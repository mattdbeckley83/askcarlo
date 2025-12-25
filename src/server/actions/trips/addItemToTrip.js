'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function addItemToTrip(tripId, itemId, quantity = 1) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!tripId || !itemId) {
        return { error: 'Trip ID and Item ID are required' }
    }

    // Verify user owns the trip
    const { data: trip, error: tripError } = await supabaseAdmin
        .from('trips')
        .select('id, user_id')
        .eq('id', tripId)
        .single()

    if (tripError || !trip || trip.user_id !== userId) {
        return { error: 'Trip not found or unauthorized' }
    }

    // Verify user owns the item
    const { data: item, error: itemError } = await supabaseAdmin
        .from('items')
        .select('id, user_id')
        .eq('id', itemId)
        .single()

    if (itemError || !item || item.user_id !== userId) {
        return { error: 'Item not found or unauthorized' }
    }

    // Check if item already exists in trip
    const { data: existing } = await supabaseAdmin
        .from('trip_items')
        .select('id')
        .eq('trip_id', tripId)
        .eq('item_id', itemId)
        .single()

    if (existing) {
        return { error: 'Item already in trip' }
    }

    // Add item to trip
    const { data: tripItem, error: insertError } = await supabaseAdmin
        .from('trip_items')
        .insert({
            trip_id: tripId,
            item_id: itemId,
            quantity: quantity,
            is_worn: false,
            is_consumable: false,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error adding item to trip:', insertError)
        return { error: 'Failed to add item to trip' }
    }

    revalidatePath(`/trips/${tripId}`)
    return { success: true, tripItem }
}
