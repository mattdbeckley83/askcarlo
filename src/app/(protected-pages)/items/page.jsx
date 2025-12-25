import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ItemList from './_components/ItemList'

export const metadata = {
    title: 'My Items | Yonderlust',
}

async function getItems(userId) {
    const { data: items, error } = await supabaseAdmin
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching items:', error)
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

export default async function ItemsPage() {
    const { userId } = await auth()

    const [items, categories, itemTypes] = await Promise.all([
        getItems(userId),
        getCategories(userId),
        getItemTypes(),
    ])

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">My Items</h1>
                <p className="text-gray-500 mt-1">
                    Manage your gear, food, and fuel inventory
                </p>
            </div>
            <ItemList items={items} categories={categories} itemTypes={itemTypes} />
        </div>
    )
}
