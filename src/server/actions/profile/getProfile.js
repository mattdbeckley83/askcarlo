'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getProfile() {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    try {
        // Get user info from Clerk
        const clerkUser = await currentUser()

        // Get user data from database
        const { data: dbUser, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError && userError.code !== 'PGRST116') {
            console.error('Error fetching user:', userError)
            return { error: 'Failed to fetch user data' }
        }

        // Get all activities
        const { data: activities, error: activitiesError } = await supabaseAdmin
            .from('activities')
            .select('*')
            .order('name')

        if (activitiesError) {
            console.error('Error fetching activities:', activitiesError)
            return { error: 'Failed to fetch activities' }
        }

        // Get user's selected activities
        const { data: userActivities, error: userActivitiesError } = await supabaseAdmin
            .from('user_activities')
            .select('activity_id')
            .eq('user_id', userId)

        if (userActivitiesError && userActivitiesError.code !== 'PGRST116') {
            console.error('Error fetching user activities:', userActivitiesError)
            // Don't fail - table might not exist yet
        }

        const selectedActivityIds = (userActivities || []).map((ua) => ua.activity_id)

        return {
            success: true,
            user: {
                id: userId,
                email: clerkUser?.emailAddresses?.[0]?.emailAddress || dbUser?.email || '',
                firstName: clerkUser?.firstName || dbUser?.first_name || '',
                lastName: clerkUser?.lastName || dbUser?.last_name || '',
                createdAt: dbUser?.created_at || clerkUser?.createdAt,
            },
            activities: activities || [],
            selectedActivityIds,
        }
    } catch (error) {
        console.error('Error in getProfile:', error)
        return { error: 'An unexpected error occurred' }
    }
}
