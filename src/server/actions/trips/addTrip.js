'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function addTrip(formData) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name')
    const activityId = formData.get('activity_id') || null
    const startDate = formData.get('start_date') || null
    const endDate = formData.get('end_date') || null
    const notes = formData.get('notes') || null

    // Trail metrics
    const distanceMiles = formData.get('distance_miles')
    const totalAscentFt = formData.get('total_ascent_ft')
    const totalDescentFt = formData.get('total_descent_ft')
    const maxElevationFt = formData.get('max_elevation_ft')
    const minElevationFt = formData.get('min_elevation_ft')
    const trailUrl = formData.get('trail_url')

    if (!name || name.trim() === '') {
        return { error: 'Name is required' }
    }

    const { data: trip, error: insertError } = await supabaseAdmin
        .from('trips')
        .insert({
            user_id: userId,
            activity_id: activityId,
            name: name.trim(),
            start_date: startDate || null,
            end_date: endDate || null,
            notes: notes?.trim() || null,
            distance_miles: distanceMiles ? parseFloat(distanceMiles) : null,
            total_ascent_ft: totalAscentFt ? parseInt(totalAscentFt) : null,
            total_descent_ft: totalDescentFt ? parseInt(totalDescentFt) : null,
            max_elevation_ft: maxElevationFt ? parseInt(maxElevationFt) : null,
            min_elevation_ft: minElevationFt ? parseInt(minElevationFt) : null,
            trail_url: trailUrl?.trim() || null,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error inserting trip:', insertError)
        return { error: 'Failed to create trip' }
    }

    // Update milestone flag if this is user's first trip
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('has_added_trip')
        .eq('id', userId)
        .single()

    if (user && !user.has_added_trip) {
        await supabaseAdmin
            .from('users')
            .update({
                has_added_trip: true,
                first_trip_added_at: new Date().toISOString(),
            })
            .eq('id', userId)
    }

    revalidatePath('/trips')
    revalidatePath('/home')
    return { success: true, trip }
}
