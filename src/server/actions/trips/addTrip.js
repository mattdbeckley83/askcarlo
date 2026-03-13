'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { getResend } from '@/lib/resend'

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
        .select('has_added_trip, onboarding_completed, email, first_name, last_name')
        .eq('id', userId)
        .single()

    let tokensAwarded = 0
    if (user && !user.has_added_trip) {
        await supabaseAdmin
            .from('users')
            .update({
                has_added_trip: true,
                first_trip_added_at: new Date().toISOString(),
            })
            .eq('id', userId)
        tokensAwarded = 25

        if (!user.onboarding_completed) {
            const { data: refreshed } = await supabaseAdmin
                .from('users')
                .select('onboarding_completed')
                .eq('id', userId)
                .single()

            if (refreshed?.onboarding_completed) {
                try {
                    const resend = getResend()
                    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown'
                    const time = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })
                    await resend.emails.send({
                        from: 'matt@askcarlo.ai',
                        to: ['mattdbeckley@gmail.com'],
                        subject: `Onboarding complete: ${name}`,
                        html: `
                            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111827;">
                                <p style="font-size:18px;font-weight:600;margin:0 0 16px;">Onboarding complete 🎉</p>
                                <table style="font-size:14px;line-height:1.8;border-collapse:collapse;width:100%;">
                                    <tr><td style="color:#6b7280;padding-right:16px;">Name</td><td>${name}</td></tr>
                                    <tr><td style="color:#6b7280;padding-right:16px;">Email</td><td>${user.email}</td></tr>
                                    <tr><td style="color:#6b7280;padding-right:16px;">Time</td><td>${time} ET</td></tr>
                                </table>
                            </div>
                        `,
                        text: `Onboarding complete\n\nName: ${name}\nEmail: ${user.email}\nTime: ${time} ET`,
                    })
                } catch (notifyError) {
                    console.error('Error sending onboarding notification:', notifyError)
                }
            }
        }
    }

    revalidatePath('/trips')
    revalidatePath('/home')
    return { success: true, trip, ...(tokensAwarded > 0 && { tokensAwarded }) }
}
