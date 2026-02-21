'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function renameConversation(conversationId, newTitle) {
    const { userId } = await auth()
    if (!userId) return { error: 'Unauthorized' }

    const trimmed = newTitle?.trim()
    if (!trimmed) return { error: 'Title cannot be empty' }

    const { error } = await supabaseAdmin
        .from('conversations')
        .update({ title: trimmed, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', userId)

    if (error) {
        console.error('Error renaming conversation:', error)
        return { error: 'Failed to rename conversation' }
    }

    return { success: true }
}
