'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { getResend } from '@/lib/resend'

export async function updateActivities(activityIds, activityNotes = {}) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!Array.isArray(activityIds)) {
        return { error: 'Invalid activity IDs' }
    }

    let tokensAwarded = 0

    try {
        // Delete all existing user activities
        const { error: deleteError } = await supabaseAdmin
            .from('user_activities')
            .delete()
            .eq('user_id', userId)

        if (deleteError) {
            console.error('Error deleting user activities:', deleteError)
            return { error: 'Failed to update activities' }
        }

        // Insert new selections (if any)
        if (activityIds.length > 0) {
            const insertData = activityIds.map((activityId) => ({
                user_id: userId,
                activity_id: activityId,
                notes: activityNotes[activityId]?.trim() || null,
            }))

            const { error: insertError } = await supabaseAdmin
                .from('user_activities')
                .insert(insertData)

            if (insertError) {
                console.error('Error inserting user activities:', insertError)
                return { error: 'Failed to update activities' }
            }

            // Update milestone flag if this is user's first time completing profile
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('has_completed_profile, onboarding_completed, email, first_name, last_name')
                .eq('id', userId)
                .single()

            if (user && !user.has_completed_profile) {
                await supabaseAdmin
                    .from('users')
                    .update({
                        has_completed_profile: true,
                        profile_completed_at: new Date().toISOString(),
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
        }

        revalidatePath('/profile')
        revalidatePath('/home')
        revalidatePath('/conversations')
        return { success: true, ...(tokensAwarded > 0 && { tokensAwarded }) }
    } catch (error) {
        console.error('Error in updateActivities:', error)
        return { error: 'An unexpected error occurred' }
    }
}
