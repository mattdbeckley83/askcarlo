'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { getCategoryColor } from '@/lib/constants/colors'

const BATCH_SIZE = 10

export async function importLighterpackCSV(items, gearTypeId) {
    const { userId } = await auth()

    if (!userId) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return { success: false, error: 'No items to import' }
    }

    if (!gearTypeId) {
        return { success: false, error: 'Gear type not found' }
    }

    try {
        // Fetch existing item names for duplicate detection
        const { data: existingItems, error: itemsFetchError } = await supabaseAdmin
            .from('items')
            .select('name')
            .eq('user_id', userId)
            .eq('item_type_id', gearTypeId)

        if (itemsFetchError) {
            console.error('Error fetching existing items:', itemsFetchError)
            return { success: false, error: 'Failed to check for duplicates' }
        }

        const existingNameSet = new Set(
            (existingItems || []).map((i) => i.name.toLowerCase())
        )

        // Split into to-import and skipped
        const toImport = []
        let skipped = 0
        for (const item of items) {
            if (existingNameSet.has(item.name.toLowerCase())) {
                skipped++
            } else {
                toImport.push(item)
            }
        }

        if (toImport.length === 0) {
            return {
                success: true,
                itemsCreated: 0,
                categoriesCreated: 0,
                skipped,
                errors: 0,
            }
        }

        // Fetch user's existing categories
        const { data: existingCategories, error: catFetchError } = await supabaseAdmin
            .from('categories')
            .select('id, name')
            .eq('user_id', userId)

        if (catFetchError) {
            console.error('Error fetching categories:', catFetchError)
            return { success: false, error: 'Failed to fetch categories' }
        }

        // Build category map (lowercase name → id)
        const categoryMap = {}
        for (const cat of existingCategories || []) {
            categoryMap[cat.name.toLowerCase()] = cat.id
        }

        // Find unique new category names in the items to import
        const uniqueNewCategoryNames = [
            ...new Set(
                toImport
                    .filter((item) => item.category && !categoryMap[item.category.toLowerCase()])
                    .map((item) => item.category)
            ),
        ]

        // Create new categories
        let categoryCount = (existingCategories || []).length
        let categoriesCreated = 0

        for (const categoryName of uniqueNewCategoryNames) {
            const color = getCategoryColor(categoryCount)
            const { data: newCat, error: catCreateError } = await supabaseAdmin
                .from('categories')
                .insert({ user_id: userId, name: categoryName, color })
                .select()
                .single()

            if (catCreateError) {
                console.error('Error creating category:', categoryName, catCreateError)
            } else {
                categoryMap[categoryName.toLowerCase()] = newCat.id
                categoryCount++
                categoriesCreated++
            }
        }

        // Batch-insert items
        let itemsCreated = 0
        let errors = 0

        for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
            const batch = toImport.slice(i, i + BATCH_SIZE).map((item) => ({
                user_id: userId,
                item_type_id: gearTypeId,
                category_id: item.category
                    ? categoryMap[item.category.toLowerCase()] || null
                    : null,
                name: item.name,
                weight: item.weight ?? null,
                weight_unit: item.unit || 'oz',
            }))

            const { data: inserted, error: insertError } = await supabaseAdmin
                .from('items')
                .insert(batch)
                .select()

            if (insertError) {
                console.error('Error inserting batch:', insertError)
                errors += batch.length
            } else {
                itemsCreated += inserted.length
            }
        }

        // Milestone: has_added_gear
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('has_added_gear')
            .eq('id', userId)
            .single()

        if (user && !user.has_added_gear) {
            await supabaseAdmin
                .from('users')
                .update({
                    has_added_gear: true,
                    first_gear_added_at: new Date().toISOString(),
                })
                .eq('id', userId)
        }

        revalidatePath('/gear')
        revalidatePath('/home')

        return {
            success: true,
            itemsCreated,
            categoriesCreated,
            skipped,
            errors,
        }
    } catch (err) {
        console.error('Error in importLighterpackCSV:', err)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
