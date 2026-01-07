import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import TripDetail from './_components/TripDetail'

// Disable caching to ensure fresh data on each request
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
    const { id } = await params
    const { data: trip } = await supabaseAdmin
        .from('trips')
        .select('name')
        .eq('id', id)
        .single()

    return {
        title: trip ? `${trip.name} | Carlo` : 'Trip | Carlo',
    }
}

async function getTrip(tripId, userId) {
    const { data: trip, error } = await supabaseAdmin
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .eq('user_id', userId)
        .single()

    if (error || !trip) {
        return null
    }

    return trip
}

async function getTripItems(tripId) {
    const { data: tripItems, error } = await supabaseAdmin
        .from('trip_items')
        .select(`
            *,
            items (
                id,
                name,
                brand,
                weight,
                weight_unit,
                category_id,
                item_type_id
            )
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching trip items:', error)
        return []
    }

    return tripItems || []
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

async function getCategories(userId) {
    const { data: categories, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name')

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return categories || []
}

async function getItemTypes() {
    const { data: itemTypes, error } = await supabaseAdmin
        .from('item_types')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching item types:', error)
        return []
    }

    return itemTypes || []
}

async function getUserItems(userId) {
    const { data: items, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('name')

    if (error) {
        console.error('Error fetching user items:', error)
        return []
    }

    return items || []
}

export default async function TripDetailPage({ params }) {
    const { id } = await params
    const { userId } = await auth()

    const trip = await getTrip(id, userId)

    if (!trip) {
        notFound()
    }

    const [tripItems, activities, categories, itemTypes, userItems] = await Promise.all([
        getTripItems(id),
        getActivities(),
        getCategories(userId),
        getItemTypes(),
        getUserItems(userId),
    ])

    return (
        <TripDetail
            trip={trip}
            tripItems={tripItems}
            activities={activities}
            categories={categories}
            itemTypes={itemTypes}
            userItems={userItems}
        />
    )
}
