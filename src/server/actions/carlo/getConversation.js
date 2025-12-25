'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function getConversation(conversationId) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!conversationId) {
        return { error: 'Conversation ID is required' }
    }

    // Fetch conversation
    const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

    if (convError || !conversation) {
        return { error: 'Conversation not found' }
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabaseAdmin
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

    if (msgError) {
        console.error('Error fetching messages:', msgError)
        return { error: 'Failed to fetch messages' }
    }

    return {
        success: true,
        conversation,
        messages: messages || [],
    }
}
