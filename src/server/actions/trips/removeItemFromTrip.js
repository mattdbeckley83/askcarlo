'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function removeItemFromTrip(tripItemId, tripId) {
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

    // Remove the trip item
    const { error: deleteError } = await supabaseAdmin
        .from('trip_items')
        .delete()
        .eq('id', tripItemId)

    if (deleteError) {
        console.error('Error removing item from trip:', deleteError)
        return { error: 'Failed to remove item from trip' }
    }

    revalidatePath(`/trips/${tripId}`)
    return { success: true }
}
