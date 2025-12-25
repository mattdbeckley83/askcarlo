import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import TripList from './_components/TripList'

export const metadata = {
    title: 'My Trips | Yonderlust',
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
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">My Trips</h1>
                <p className="text-gray-500 mt-1">
                    Plan and manage your backpacking trips
                </p>
            </div>
            <TripList trips={trips} activities={activities} />
        </div>
    )
}
