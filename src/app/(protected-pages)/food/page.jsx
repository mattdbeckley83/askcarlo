import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import FoodList from './_components/FoodList'

export const metadata = {
    title: 'Food Pantry | Carlo',
}

async function getFoodTypeId() {
    const { data: itemType, error } = await supabaseAdmin
        .from('item_types')
        .select('id')
        .eq('name', 'food')
        .single()

    if (error) {
        console.error('Error fetching food type:', error)
        return null
    }

    return itemType?.id
}

async function getFoodItems(userId, foodTypeId) {
    if (!foodTypeId) return []

    const { data: items, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .eq('item_type_id', foodTypeId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching food items:', error)
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

export default async function FoodPage() {
    const { userId } = await auth()

    const foodTypeId = await getFoodTypeId()
    const [items, categories] = await Promise.all([
        getFoodItems(userId, foodTypeId),
        getCategories(userId),
    ])

    return (
        <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
            <FoodList
                items={items}
                categories={categories}
                foodTypeId={foodTypeId}
            />
        </div>
    )
}
