import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import TripList from './_components/TripList'

export const metadata = {
    title: 'My Trips | Carlo',
}

async function getTrips(userId) {
    const { data: trips, error } = await supabaseAdmin
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching trips:', error)
        return []
    }

    return trips || []
}

async function getActivities() {
    const { data: activities, error } = await supabaseAdmin
        .from('activities')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching activities:', error)
        return []
    }

    return activities || []
}

export default async function TripsPage() {
    const { userId } = await auth()

    const [trips, activities] = await Promise.all([
        getTrips(userId),
        getActivities(),
    ])

    return (
        <div className="px-8 sm:px-12 pt-4 sm:pt-6 pb-10 sm:pb-16">
            <TripList trips={trips} activities={activities} />
        </div>
    )
}
