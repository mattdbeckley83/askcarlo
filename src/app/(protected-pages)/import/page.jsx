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
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Import from Lighterpack</h1>
                <p className="text-gray-500 mt-1">
                    Bulk-import your gear list from a Lighterpack CSV export
                </p>
            </div>
            <ImportPage
                gearTypeId={gearTypeId}
                existingCategories={existingCategories}
            />
        </div>
    )
}
