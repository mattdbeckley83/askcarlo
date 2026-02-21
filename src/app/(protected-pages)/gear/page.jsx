import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import GearList from './_components/GearList'

export const metadata = {
    title: 'Gear Closet | Carlo',
}

async function getGearTypeId() {
    const { data: itemType, error } = await supabaseAdmin
        .from('item_types')
        .select('id')
        .eq('name', 'gear')
        .single()

    if (error) {
        console.error('Error fetching gear type:', error)
        return null
    }

    return itemType?.id
}

async function getGearItems(userId, gearTypeId) {
    if (!gearTypeId) return []

    const { data: items, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type_id', gearTypeId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching gear items:', error)
        return []
    }

    return items || []
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

export default async function GearPage() {
    const { userId } = await auth()

    const gearTypeId = await getGearTypeId()
    const [items, categories] = await Promise.all([
        getGearItems(userId, gearTypeId),
        getCategories(userId),
    ])

    return (
        <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
            <GearList
                items={items}
                categories={categories}
                gearTypeId={gearTypeId}
            />
        </div>
    )
}
