import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import CategoryList from './_components/CategoryList'

export const metadata = {
    title: 'Categories | Carlo',
}

async function getCategoriesWithCounts(userId) {
    const [{ data: categories }, { data: items }] = await Promise.all([
        supabaseAdmin
            .from('categories')
            .select('*')
            .eq('user_id', userId)
            .order('name'),
        supabaseAdmin
            .from('items')
            .select('category_id')
            .eq('user_id', userId),
    ])

    const itemCountByCategory = {}
    items?.forEach((item) => {
        if (item.category_id) {
            itemCountByCategory[item.category_id] =
                (itemCountByCategory[item.category_id] || 0) + 1
        }
    })

    return (categories || []).map((cat) => ({
        ...cat,
        itemCount: itemCountByCategory[cat.id] || 0,
    }))
}

export default async function CategoriesPage() {
    const { userId } = await auth()
    const categories = await getCategoriesWithCounts(userId)

    return (
        <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
            <CategoryList categories={categories} />
        </div>
    )
}
