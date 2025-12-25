'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function updateTrip(formData) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const tripId = formData.get('trip_id')
    const name = formData.get('name')
    const activityId = formData.get('activity_id') || null
    const startDate = formData.get('start_date') || null
    const endDate = formData.get('end_date') || null
    const notes = formData.get('notes') || null

    if (!tripId) {
        return { error: 'Trip ID is required' }
    }

    if (!name || name.trim() === '') {
        return { error: 'Name is required' }
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

    const { data: trip, error: updateError } = await supabaseAdmin
        .from('trips')
        .update({
            name: name.trim(),
            activity_id: activityId,
            start_date: startDate || null,
            end_date: endDate || null,
            notes: notes?.trim() || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single()

    if (updateError) {
        console.error('Error updating trip:', updateError)
        return { error: 'Failed to update trip' }
    }

    revalidatePath('/trips')
    revalidatePath(`/trips/${tripId}`)
    return { success: true, trip }
}
