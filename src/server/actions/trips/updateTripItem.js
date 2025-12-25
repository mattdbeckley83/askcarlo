'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function updateTripItem(tripItemId, tripId, updates) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!tripItemId) {
        return { error: 'Trip Item ID is required' }
    }

    // Verify user owns the trip through the trip_item
    const { data: tripItem, error: fetchError } = await supabaseAdmin
        .from('trip_items')
        .select(`
            id,
            trip_id,
            trips (
                user_id
            )
        `)
        .eq('id', tripItemId)
        .single()

    if (fetchError || !tripItem) {
        return { error: 'Trip item not found' }
    }

    if (tripItem.trips?.user_id !== userId) {
        return { error: 'Unauthorized' }
    }

    // Build update object with only allowed fields
    const allowedUpdates = {}
    if (typeof updates.quantity === 'number') {
        allowedUpdates.quantity = Math.max(1, updates.quantity)
    }
    if (typeof updates.is_worn === 'boolean') {
        allowedUpdates.is_worn = updates.is_worn
    }
    if (typeof updates.is_consumable === 'boolean') {
        allowedUpdates.is_consumable = updates.is_consumable
    }

    if (Object.keys(allowedUpdates).length === 0) {
        return { error: 'No valid updates provided' }
    }

    // Update the trip item
    const { data: updatedTripItem, error: updateError } = await supabaseAdmin
        .from('trip_items')
        .update(allowedUpdates)
        .eq('id', tripItemId)
        .select()
        .single()

    if (updateError) {
        console.error('Error updating trip item:', updateError)
        return { error: 'Failed to update trip item' }
    }

    revalidatePath(`/trips/${tripId}`)
    return { success: true, tripItem: updatedTripItem }
}
