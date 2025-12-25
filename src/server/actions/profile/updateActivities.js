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
        }

        revalidatePath('/profile')
        return { success: true }
    } catch (error) {
        console.error('Error in updateActivities:', error)
        return { error: 'An unexpected error occurred' }
    }
}
