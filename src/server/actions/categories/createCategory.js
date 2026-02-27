'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name')?.trim()
    const color = formData.get('color')

    if (!name) return { error: 'Category name is required' }
    if (!color) return { error: 'Color is required' }

    // Check for duplicate name for this user
    const { data: existing } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', name)
        .maybeSingle()

    if (existing) {
        return { error: `A category named "${name}" already exists` }
    }

    const { error } = await supabaseAdmin
        .from('categories')
        .insert({ user_id: userId, name, color })

    if (error) {
        console.error('Error creating category:', error)
        return { error: 'Failed to create category' }
    }

    revalidatePath('/categories')
    revalidatePath('/gear')
    revalidatePath('/food')
    return { success: true }
}
