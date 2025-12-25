'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function deleteTrip(tripId) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!tripId) {
        return { error: 'Trip ID is required' }
    }

    // Verify user owns this trip
    const { data: existingTrip, error: fetchError } = await supabaseAdmin
        .from('trips')
        .select('id, user_id')
        .eq('id', tripId)
        .single()

    if (fetchError || !existingTrip) {
        return { error: 'Trip not found' }
    }

    if (existingTrip.user_id !== userId) {
        return { error: 'Unauthorized' }
    }

    // Delete trip (trip_items will cascade delete)
    const { error: deleteError } = await supabaseAdmin
        .from('trips')
        .delete()
        .eq('id', tripId)

    if (deleteError) {
        console.error('Error deleting trip:', deleteError)
        return { error: 'Failed to delete trip' }
    }

    revalidatePath('/trips')
    return { success: true }
}
