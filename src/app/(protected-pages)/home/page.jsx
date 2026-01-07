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

async function getItemsCount(userId) {
    const { count, error } = await supabaseAdmin
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    if (error) {
        console.error('Error counting items:', error)
        return 0
    }

    return count || 0
}

async function getTripsCount(userId) {
    const { count, error } = await supabaseAdmin
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

    if (error) {
        console.error('Error counting trips:', error)
        return 0
    }

    return count || 0
}

async function getUpcomingTrips(userId) {
    const today = new Date().toISOString().split('T')[0]

    const { data: trips, error } = await supabaseAdmin
        .from('trips')
        .select(`
            id,
            name,
            start_date,
            end_date,
            activities (name)
        `)
        .eq('user_id', userId)
        .gte('start_date', today)
        .order('start_date', { ascending: true })
        .limit(3)

    if (error) {
        console.error('Error fetching upcoming trips:', error)
        return []
    }

    return trips || []
}

export default async function HomePage() {
    const { userId } = await auth()
    const clerkUser = await currentUser()

    const [userData, itemsCount, tripsCount, upcomingTrips] = await Promise.all([
        getUserData(userId),
        getItemsCount(userId),
        getTripsCount(userId),
        getUpcomingTrips(userId),
    ])

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
            itemsCount={itemsCount}
            tripsCount={tripsCount}
            upcomingTrips={upcomingTrips}
            onboardingStatus={onboardingStatus}
        />
    )
}
