'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function updateCategory(formData) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const categoryId = formData.get('category_id')
    const name = formData.get('name')?.trim()
    const color = formData.get('color')

    if (!categoryId) return { error: 'Category ID is required' }
    if (!name) return { error: 'Category name is required' }
    if (!color) return { error: 'Color is required' }

    // Verify user owns this category
    const { data: existing, error: fetchError } = await supabaseAdmin
        .from('categories')
        .select('id, user_id')
        .eq('id', categoryId)
        .single()

    if (fetchError || !existing) {
        return { error: 'Category not found' }
    }

    if (existing.user_id !== userId) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabaseAdmin
        .from('categories')
        .update({ name, color })
        .eq('id', categoryId)

    if (error) {
        console.error('Error updating category:', error)
        return { error: 'Failed to update category' }
    }

    revalidatePath('/categories')
    revalidatePath('/gear')
    revalidatePath('/food')
    revalidatePath('/trips')
    return { success: true }
}
