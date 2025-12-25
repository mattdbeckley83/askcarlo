'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function createConversation(template = null) {
    const { userId } = await auth()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    // Generate a default title based on template
    let defaultTitle = null
    if (template === 'upgrade_gear') {
        defaultTitle = 'Gear Upgrade'
    } else if (template === 'trip_planning') {
        defaultTitle = 'Trip Planning'
    }

    const { data: conversation, error } = await supabaseAdmin
        .from('conversations')
        .insert({
            user_id: userId,
            title: defaultTitle,
            template: template,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating conversation:', error)
        return { error: 'Failed to create conversation' }
    }

    revalidatePath('/carlo')
    return { success: true, conversation }
}
