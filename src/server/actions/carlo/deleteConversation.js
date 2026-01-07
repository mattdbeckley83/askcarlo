'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function deleteConversation(conversationId) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!conversationId) {
        return { error: 'Conversation ID is required' }
    }

    // Verify user owns this conversation
    const { data: conversation, error: fetchError } = await supabaseAdmin
        .from('conversations')
        .select('id, user_id')
        .eq('id', conversationId)
        .single()

    if (fetchError || !conversation) {
        return { error: 'Conversation not found' }
    }

    if (conversation.user_id !== userId) {
        return { error: 'Unauthorized' }
    }

    // Delete conversation (messages will cascade delete)
    const { error: deleteError } = await supabaseAdmin
        .from('conversations')
        .delete()
        .eq('id', conversationId)

    if (deleteError) {
        console.error('Error deleting conversation:', deleteError)
        return { error: 'Failed to delete conversation' }
    }

    revalidatePath('/conversations')
    return { success: true }
}
