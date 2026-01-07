import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ImportUploader from './_components/ImportUploader'

export const metadata = {
    title: 'Import from LighterPack | Carlo',
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

export default async function ImportPage() {
    const { userId } = await auth()

    const [itemTypes, categories] = await Promise.all([
        getItemTypes(),
        getCategories(userId),
    ])

    // Find the "gear" item type
    const gearType = itemTypes.find((t) => t.name.toLowerCase() === 'gear')

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Import from LighterPack</h1>
                <p className="text-gray-500 mt-1">
                    Import your gear list from a LighterPack CSV export
                </p>
            </div>
            <ImportUploader
                gearTypeId={gearType?.id}
                existingCategories={categories}
            />
        </div>
    )
}
