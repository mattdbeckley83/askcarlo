'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function updateActivities(activityIds) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!Array.isArray(activityIds)) {
        return { error: 'Invalid activity IDs' }
    }

    console.log('[updateActivities] Called with', activityIds.length, 'activities:', activityIds)

    try {
        // Delete all existing user activities
        const { error: deleteError } = await supabaseAdmin
            .from('user_activities')
            .delete()
            .eq('user_id', userId)

        if (deleteError) {
            console.error('Error deleting user activities:', deleteError)
            return { error: 'Failed to update activities' }
        }

        // Insert new selections (if any)
        if (activityIds.length > 0) {
            const insertData = activityIds.map((activityId) => ({
                user_id: userId,
                activity_id: activityId,
            }))

            const { error: insertError } = await supabaseAdmin
                .from('user_activities')
                .insert(insertData)

            if (insertError) {
                console.error('Error inserting user activities:', insertError)
                return { error: 'Failed to update activities' }
            }

            // Update milestone flag if this is user's first time completing profile
            console.log('[updateActivities] Checking has_completed_profile for user:', userId)

            const { data: user, error: userError } = await supabaseAdmin
                .from('users')
                .select('has_completed_profile')
                .eq('id', userId)
                .single()

            console.log('[updateActivities] User data:', user, 'Error:', userError)

            if (user && !user.has_completed_profile) {
                console.log('[updateActivities] Setting has_completed_profile to true')

                const { error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({
                        has_completed_profile: true,
                        profile_completed_at: new Date().toISOString(),
                    })
                    .eq('id', userId)

                if (updateError) {
                    console.error('[updateActivities] Error updating has_completed_profile:', updateError)
                } else {
                    console.log('[updateActivities] Successfully set has_completed_profile to true')
                }
            } else {
                console.log('[updateActivities] Skipped update - user:', !!user, 'has_completed_profile:', user?.has_completed_profile)
            }
        }

        revalidatePath('/profile')
        revalidatePath('/home')
        return { success: true }
    } catch (error) {
        console.error('Error in updateActivities:', error)
        return { error: 'An unexpected error occurred' }
    }
}
