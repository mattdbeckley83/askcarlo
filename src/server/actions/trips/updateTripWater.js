'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

// 1 fl oz = 0.02957 L
const LITERS_PER_FL_OZ = 0.02957

export async function updateTripWater(tripId, waterVolume, waterUnit) {
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

    // Convert fl oz to liters before storing
    let volumeInLiters = parseFloat(waterVolume) || 0
    if (waterUnit === 'fl oz' && volumeInLiters > 0) {
        volumeInLiters = volumeInLiters * LITERS_PER_FL_OZ
    }

    const { data: trip, error: updateError } = await supabaseAdmin
        .from('trips')
        .update({
            water_volume: volumeInLiters,
            water_unit: waterUnit || 'L',
            updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single()

    if (updateError) {
        console.error('Error updating trip water:', updateError)
        return { error: 'Failed to update water' }
    }

    revalidatePath(`/trips/${tripId}`)
    return { success: true, trip }
}
