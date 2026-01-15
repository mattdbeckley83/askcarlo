import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Dashboard from './_components/Dashboard'

export const metadata = {
    title: 'Home | Carlo',
}

async function getUserData(userId) {
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('first_name, has_added_gear, has_added_trip, has_used_carlo_chat, has_completed_profile, onboarding_completed')
        .eq('id', userId)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error)
        return null
    }

    return user
}

export default async function HomePage() {
    const { userId } = await auth()
    const clerkUser = await currentUser()

    const userData = await getUserData(userId)

    const firstName = clerkUser?.firstName || userData?.first_name || 'there'

    const onboardingStatus = {
        hasAddedGear: userData?.has_added_gear || false,
        hasAddedTrip: userData?.has_added_trip || false,
        hasUsedCarlo: userData?.has_used_carlo_chat || false,
        hasCompletedProfile: userData?.has_completed_profile || false,
        onboardingCompleted: userData?.onboarding_completed || false,
    }

    return (
        <Dashboard
            firstName={firstName}
            onboardingStatus={onboardingStatus}
        />
    )
}
