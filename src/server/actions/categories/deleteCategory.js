'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function deleteCategory(categoryId) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!categoryId) {
        return { error: 'Category ID is required' }
    }

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

    // Block deletion if any items use this category
    const { count: itemCount } = await supabaseAdmin
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId)

    if (itemCount > 0) {
        return { error: `Cannot delete a category that has ${itemCount} item${itemCount > 1 ? 's' : ''} assigned to it` }
    }

    const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', categoryId)

    if (error) {
        console.error('Error deleting category:', error)
        return { error: 'Failed to delete category' }
    }

    revalidatePath('/categories')
    revalidatePath('/gear')
    revalidatePath('/food')
    return { success: true }
}
