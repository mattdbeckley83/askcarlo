import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ImportPage from './_components/ImportPage'

export const metadata = {
    title: 'Import from Lighterpack | Carlo',
}

export default async function ImportPageRoute() {
    const { userId } = await auth()

    const [{ data: itemTypes }, { data: categories }] = await Promise.all([
        supabaseAdmin
            .from('item_types')
            .select('id, name')
            .eq('name', 'gear')
            .single(),
        supabaseAdmin
            .from('categories')
            .select('id, name')
            .eq('user_id', userId)
            .order('name'),
    ])

    const gearTypeId = itemTypes?.id ?? null
    const existingCategories = categories ?? []

    return (
        <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Import from Lighterpack
            </h1>
            <ImportPage
                gearTypeId={gearTypeId}
                existingCategories={existingCategories}
            />
        </div>
    )
}
