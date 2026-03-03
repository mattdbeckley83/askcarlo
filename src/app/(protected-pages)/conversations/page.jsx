import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ConversationList from './_components/ConversationList'
import ChatInterface from './_components/ChatInterface'
import TokenSuccessRefresh from './_components/TokenSuccessRefresh'

export const metadata = {
    title: 'Ask Carlo | Carlo',
}

async function getConversations(userId) {
    const { data: conversations, error } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching conversations:', error)
        return []
    }

    return conversations || []
}

async function getFirstMessages(conversationIds) {
    if (!conversationIds.length) return {}

    const { data, error } = await supabaseAdmin
        .from('conversation_messages')
        .select('conversation_id, content')
        .in('conversation_id', conversationIds)
        .eq('role', 'user')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching first messages:', error)
        return {}
    }

    // Keep only the first user message per conversation
    const firstMessages = {}
    for (const msg of data || []) {
        if (!firstMessages[msg.conversation_id]) {
            firstMessages[msg.conversation_id] = msg.content
        }
    }
    return firstMessages
}

async function getItems(userId) {
    const { data: items, error } = await supabaseAdmin
        .from('items')
        .select('id, name, brand, weight, weight_unit, category_id, item_type_id, calories')
        .eq('user_id', userId)
        .order('name')

    if (error) {
        console.error('Error fetching items:', error)
        return []
    }

    return items || []
}

async function getTrips(userId) {
    const { data: trips, error } = await supabaseAdmin
        .from('trips')
        .select('id, name, start_date, end_date, notes, activity_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching trips:', error)
        return []
    }

    return trips || []
}

async function getTripItems(userId) {
    // Get all trip_items for user's trips, grouped by trip
    const { data: tripItems, error } = await supabaseAdmin
        .from('trip_items')
        .select('trip_id, item_id, trips!inner(user_id)')
        .eq('trips.user_id', userId)

    if (error) {
        console.error('Error fetching trip items:', error)
        return {}
    }

    // Group by trip_id
    const grouped = {}
    tripItems?.forEach((ti) => {
        if (!grouped[ti.trip_id]) {
            grouped[ti.trip_id] = []
        }
        grouped[ti.trip_id].push(ti.item_id)
    })

    return grouped
}

async function getCategories(userId) {
    const { data: categories, error } = await supabaseAdmin
        .from('categories')
        .select('id, name, color')
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
        .select('id, name')

    if (error) {
        console.error('Error fetching item types:', error)
        return {}
    }

    // Return as a map: { gear: id, food: id }
    const typeMap = {}
    itemTypes?.forEach((t) => {
        typeMap[t.name] = t.id
    })
    return typeMap
}

async function getUserActivities(userId) {
    const { data: userActivities, error } = await supabaseAdmin
        .from('user_activities')
        .select('activity_id, activities(id, name, description)')
        .eq('user_id', userId)
        .order('activity_id')

    if (error) {
        console.error('Error fetching user activities:', error)
        return []
    }

    return userActivities?.map((ua) => ua.activities).filter(Boolean) || []
}

export default async function CarloPage({ searchParams }) {
    const { userId } = await auth()

    const [conversations, items, trips, tripItems, categories, userActivities, itemTypes] = await Promise.all([
        getConversations(userId),
        getItems(userId),
        getTrips(userId),
        getTripItems(userId),
        getCategories(userId),
        getUserActivities(userId),
        getItemTypes(),
    ])

    const userActivityNames = userActivities.map((a) => a.name)

    const firstMessages = await getFirstMessages(conversations.map((c) => c.id))

    const params = await searchParams
    const activeConversationId = params?.id || null
    const tokensSuccess = params?.tokens === 'success'

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-100 dark:bg-gray-800/60">
            {tokensSuccess && <TokenSuccessRefresh />}
            <div className="flex gap-4 flex-1 min-h-0 px-8 sm:px-12 pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="flex-1 min-w-0 flex flex-col">
                    <ChatInterface
                        conversationId={activeConversationId}
                        items={items}
                        trips={trips}
                        tripItems={tripItems}
                        categories={categories}
                        activities={userActivities}
                        userActivityNames={userActivityNames}
                        itemTypes={itemTypes}
                    />
                </div>
                <div className="w-[22rem] flex-shrink-0 flex flex-col">
                    <ConversationList
                        conversations={conversations}
                        firstMessages={firstMessages}
                        activeConversationId={activeConversationId}
                    />
                </div>
            </div>
        </div>
    )
}
