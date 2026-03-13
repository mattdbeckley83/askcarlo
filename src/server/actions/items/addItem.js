'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { getCategoryColor } from '@/lib/constants/colors'
import { getResend } from '@/lib/resend'

export async function addItem(formData) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name')
    const itemTypeId = formData.get('item_type_id')
    const brand = formData.get('brand') || null
    const categoryId = formData.get('category_id') || null
    const newCategoryName = formData.get('new_category_name') || null
    const weight = formData.get('weight') ? parseFloat(formData.get('weight')) : null
    const weightUnit = formData.get('weight_unit') || 'oz'
    const description = formData.get('description') || null
    const productUrl = formData.get('product_url') || null
    const calories = formData.get('calories') ? parseInt(formData.get('calories'), 10) : null

    if (!name || name.trim() === '') {
        return { error: 'Name is required' }
    }

    if (!itemTypeId) {
        return { error: 'Type is required' }
    }

    // Handle new category creation if provided
    let finalCategoryId = categoryId
    if (newCategoryName && newCategoryName.trim()) {
        // Count user's existing categories to determine color index
        const { count, error: countError } = await supabaseAdmin
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        if (countError) {
            console.error('Error counting categories:', countError)
            return { error: 'Failed to create category' }
        }

        // Assign color using optimized order for visual distinction
        const assignedColor = getCategoryColor(count || 0)

        const { data: newCategory, error: categoryError } = await supabaseAdmin
            .from('categories')
            .insert({
                user_id: userId,
                name: newCategoryName.trim(),
                color: assignedColor,
            })
            .select()
            .single()

        if (categoryError) {
            console.error('Error creating category:', categoryError)
            return { error: 'Failed to create category' }
        }

        finalCategoryId = newCategory.id
    }

    // Insert the item
    const { data: item, error: insertError } = await supabaseAdmin
        .from('items')
        .insert({
            user_id: userId,
            item_type_id: itemTypeId,
            category_id: finalCategoryId,
            name: name.trim(),
            brand: brand?.trim() || null,
            weight,
            weight_unit: weightUnit,
            description: description?.trim() || null,
            product_url: productUrl?.trim() || null,
            calories,
        })
        .select()
        .single()

    if (insertError) {
        console.error('Error inserting item:', insertError)
        return { error: 'Failed to add item' }
    }

    // Update milestone flag if this is user's first gear item
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('has_added_gear, onboarding_completed, email, first_name, last_name')
        .eq('id', userId)
        .single()

    let tokensAwarded = 0
    if (user && !user.has_added_gear) {
        await supabaseAdmin
            .from('users')
            .update({
                has_added_gear: true,
                first_gear_added_at: new Date().toISOString(),
            })
            .eq('id', userId)
        tokensAwarded = 25

        if (!user.onboarding_completed) {
            const { data: refreshed } = await supabaseAdmin
                .from('users')
                .select('onboarding_completed')
                .eq('id', userId)
                .single()

            if (refreshed?.onboarding_completed) {
                try {
                    const resend = getResend()
                    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown'
                    const time = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })
                    await resend.emails.send({
                        from: 'matt@askcarlo.ai',
                        to: ['mattdbeckley@gmail.com'],
                        subject: `Onboarding complete: ${name}`,
                        html: `
                            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111827;">
                                <p style="font-size:18px;font-weight:600;margin:0 0 16px;">Onboarding complete 🎉</p>
                                <table style="font-size:14px;line-height:1.8;border-collapse:collapse;width:100%;">
                                    <tr><td style="color:#6b7280;padding-right:16px;">Name</td><td>${name}</td></tr>
                                    <tr><td style="color:#6b7280;padding-right:16px;">Email</td><td>${user.email}</td></tr>
                                    <tr><td style="color:#6b7280;padding-right:16px;">Time</td><td>${time} ET</td></tr>
                                </table>
                            </div>
                        `,
                        text: `Onboarding complete\n\nName: ${name}\nEmail: ${user.email}\nTime: ${time} ET`,
                    })
                } catch (notifyError) {
                    console.error('Error sending onboarding notification:', notifyError)
                }
            }
        }
    }

    revalidatePath('/gear')
    revalidatePath('/food')
    revalidatePath('/home')
    return { success: true, item, ...(tokensAwarded > 0 && { tokensAwarded }) }
}
