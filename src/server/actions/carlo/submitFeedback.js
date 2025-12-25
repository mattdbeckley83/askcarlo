'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function submitFeedback({
    conversationId,
    messageId,
    rating,
    issueType = null,
    comment = null,
    messageContent = null,
    userQuery = null,
}) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    if (!conversationId || !messageId || !rating) {
        return { error: 'Conversation ID, message ID, and rating are required' }
    }

    if (!['helpful', 'not_helpful'].includes(rating)) {
        return { error: 'Invalid rating value' }
    }

    if (issueType && !['inaccurate', 'not_relevant', 'too_generic', 'missing_details', 'other'].includes(issueType)) {
        return { error: 'Invalid issue type' }
    }

    // Verify user owns this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

    if (convError || !conversation) {
        return { error: 'Conversation not found' }
    }

    // Check if feedback already exists for this message
    const { data: existingFeedback } = await supabaseAdmin
        .from('message_feedback')
        .select('id')
        .eq('user_id', userId)
        .eq('message_id', messageId)
        .single()

    if (existingFeedback) {
        // Update existing feedback
        const { error: updateError } = await supabaseAdmin
            .from('message_feedback')
            .update({
                rating,
                issue_type: issueType,
                comment,
                message_content: messageContent,
                user_query: userQuery,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingFeedback.id)

        if (updateError) {
            console.error('Error updating feedback:', updateError)
            return { error: 'Failed to update feedback' }
        }

        return { success: true, updated: true }
    } else {
        // Insert new feedback
        const { error: insertError } = await supabaseAdmin
            .from('message_feedback')
            .insert({
                conversation_id: conversationId,
                message_id: messageId,
                user_id: userId,
                rating,
                issue_type: issueType,
                comment,
                message_content: messageContent,
                user_query: userQuery,
            })

        if (insertError) {
            console.error('Error inserting feedback:', insertError)
            return { error: 'Failed to save feedback' }
        }

        return { success: true, updated: false }
    }
}

export async function getFeedback(conversationId) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized', feedback: {} }
    }

    const { data: feedbackList, error } = await supabaseAdmin
        .from('message_feedback')
        .select('message_id, rating, issue_type, comment')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching feedback:', error)
        return { error: 'Failed to load feedback', feedback: {} }
    }

    // Convert to a map keyed by message_id
    const feedbackMap = {}
    feedbackList?.forEach((f) => {
        feedbackMap[f.message_id] = {
            rating: f.rating,
            issueType: f.issue_type,
            comment: f.comment,
        }
    })

    return { feedback: feedbackMap }
}
