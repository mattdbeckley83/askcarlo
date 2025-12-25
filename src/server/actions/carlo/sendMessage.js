'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

const isDev = process.env.NODE_ENV !== 'production'

function carloLog(...args) {
    if (isDev) console.log(...args)
}

function carloGroup(label) {
    if (isDev) console.group(label)
}

function carloGroupEnd() {
    if (isDev) console.groupEnd()
}

async function getSelectedContext(userId, context = {}) {
    const { itemIds = [], tripIds = [], activityIds = [] } = context
    const hasContext = itemIds.length > 0 || tripIds.length > 0 || activityIds.length > 0

    carloGroup('--- CONTEXT SELECTION ---')
    carloLog('Selected item IDs:', itemIds)
    carloLog('Selected trip IDs:', tripIds)
    carloLog('Selected activity IDs:', activityIds)
    carloLog('Has any context:', hasContext)

    if (!hasContext) {
        carloLog('No context selected - skipping data fetch')
        carloGroupEnd()
        return null
    }

    carloGroupEnd()
    carloGroup('--- FETCHED CONTEXT ---')

    let contextParts = []

    // Fetch selected items
    if (itemIds.length > 0) {
        const { data: items } = await supabaseAdmin
            .from('items')
            .select(`
                name,
                brand,
                weight,
                weight_unit,
                description,
                calories,
                categories (name),
                item_types (name)
            `)
            .eq('user_id', userId)
            .in('id', itemIds)
            .order('name')

        carloLog('Items fetched:', items?.length || 0, items)

        if (items && items.length > 0) {
            let itemsContext = 'SELECTED ITEMS:\n'
            items.forEach((item) => {
                const type = item.item_types?.name || 'unknown'
                const category = item.categories?.name || 'uncategorized'
                const weight = item.weight ? `${item.weight} ${item.weight_unit}` : 'no weight'
                const brand = item.brand ? ` (${item.brand})` : ''
                const calories = type === 'food' && item.calories ? `, ${item.calories} cal` : ''
                itemsContext += `- ${item.name}${brand}: ${type}, ${category}, ${weight}${calories}\n`
            })
            contextParts.push(itemsContext)
        }
    }

    // Fetch selected trips with their items
    if (tripIds.length > 0) {
        const { data: trips } = await supabaseAdmin
            .from('trips')
            .select(`
                name,
                start_date,
                end_date,
                notes,
                water_volume,
                water_unit,
                activities (name),
                trip_items (
                    quantity,
                    is_worn,
                    is_consumable,
                    items (
                        name,
                        brand,
                        weight,
                        weight_unit,
                        calories,
                        categories (name),
                        item_types (name)
                    )
                )
            `)
            .eq('user_id', userId)
            .in('id', tripIds)

        carloLog('Trips fetched:', trips?.length || 0, trips)

        if (trips && trips.length > 0) {
            let tripsContext = 'SELECTED TRIPS:\n'
            trips.forEach((trip) => {
                const activity = trip.activities?.name || 'general'
                const dates = trip.start_date
                    ? `${trip.start_date}${trip.end_date ? ' to ' + trip.end_date : ''}`
                    : 'no dates set'
                tripsContext += `\n${trip.name} (${activity}, ${dates}):\n`

                if (trip.notes) {
                    tripsContext += `  Notes: ${trip.notes}\n`
                }

                if (trip.water_volume) {
                    tripsContext += `  Water: ${trip.water_volume} ${trip.water_unit || 'L'}\n`
                }

                if (trip.trip_items && trip.trip_items.length > 0) {
                    tripsContext += '  Items:\n'
                    trip.trip_items.forEach((ti) => {
                        const item = ti.items
                        if (item) {
                            const type = item.item_types?.name || 'unknown'
                            const weight = item.weight ? `${item.weight} ${item.weight_unit}` : 'no weight'
                            const qty = ti.quantity > 1 ? ` x${ti.quantity}` : ''
                            const flags = []
                            if (ti.is_worn) flags.push('worn')
                            if (ti.is_consumable) flags.push('consumable')
                            const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : ''
                            tripsContext += `    - ${item.name}${qty}: ${type}, ${weight}${flagStr}\n`
                        }
                    })
                }
            })
            contextParts.push(tripsContext)
        }
    }

    // Fetch selected activities
    if (activityIds.length > 0) {
        const { data: activities } = await supabaseAdmin
            .from('activities')
            .select('name, description')
            .in('id', activityIds)

        carloLog('Activities fetched:', activities?.length || 0, activities)

        if (activities && activities.length > 0) {
            let activitiesContext = 'ACTIVITY FOCUS:\n'
            activities.forEach((act) => {
                activitiesContext += `- ${act.name}`
                if (act.description) activitiesContext += `: ${act.description}`
                activitiesContext += '\n'
            })
            contextParts.push(activitiesContext)
        }
    }

    carloLog('Final context parts:', contextParts.length)
    carloGroupEnd()
    return contextParts.length > 0 ? contextParts.join('\n') : null
}

function buildSystemPrompt(userContext) {
    const basePrompt = `You are Carlo, an AI backpacking advisor for Yonderlust.

Your expertise includes:
- Gear selection and optimization for different conditions
- Weight reduction strategies (ultralight backpacking principles)
- Trip planning and preparation
- Food and nutrition for backpacking
- Safety and Leave No Trace principles
- Trail recommendations

Be helpful, concise, and practical.`

    if (userContext) {
        return `${basePrompt}

The user has shared the following context for this conversation:

${userContext}

When discussing gear or trips, reference this specific context. Provide personalized recommendations based on what they've shared.

Remember to:
- Be conversational but informative
- Provide specific, actionable advice
- Reference the shared context when relevant
- Ask clarifying questions if needed
- Keep responses focused and not too long`
    }

    return `${basePrompt}

The user has not shared any gear or trip context yet. You can still provide general backpacking advice, but note that you don't have visibility into their specific gear or trips.

If the conversation would benefit from knowing their gear or trip details, you can suggest they add context using the context picker below the chat.

Remember to:
- Be conversational but informative
- Provide general backpacking advice
- Ask clarifying questions to understand their needs
- Keep responses focused and not too long`
}

async function generateTitle(userMessage, assistantMessage) {
    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 50,
            messages: [
                {
                    role: 'user',
                    content: `Generate a very short title (3-5 words max) for this conversation. Just respond with the title, nothing else.

User asked: "${userMessage.substring(0, 200)}"
Assistant replied about: "${assistantMessage.substring(0, 200)}"`
                }
            ],
        })
        return response.content[0].text.trim()
    } catch (error) {
        console.error('Error generating title:', error)
        return 'New Conversation'
    }
}

export async function sendMessage(conversationId, userMessage, context = {}) {
    const startTime = Date.now()
    carloGroup('--- CARLO DEBUG START ---')
    carloLog('Timestamp:', new Date().toISOString())
    carloLog('User message:', userMessage)
    carloLog('Conversation ID:', conversationId)
    carloLog('Context:', context)

    const { userId } = await auth()

    if (!userId) {
        carloLog('Error: Unauthorized')
        carloGroupEnd()
        return { error: 'Unauthorized' }
    }

    carloLog('User ID:', userId)

    if (!conversationId || !userMessage?.trim()) {
        carloLog('Error: Missing required fields')
        carloGroupEnd()
        return { error: 'Conversation ID and message are required' }
    }

    // Verify user owns this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

    if (convError || !conversation) {
        return { error: 'Conversation not found' }
    }

    // Get existing messages for context
    const { data: existingMessages } = await supabaseAdmin
        .from('conversation_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

    // Save user message
    const { error: userMsgError } = await supabaseAdmin
        .from('conversation_messages')
        .insert({
            conversation_id: conversationId,
            role: 'user',
            content: userMessage.trim(),
        })

    if (userMsgError) {
        console.error('Error saving user message:', userMsgError)
        return { error: 'Failed to save message' }
    }

    try {
        // Get selected context for system prompt
        const userContext = await getSelectedContext(userId, context)
        const systemPrompt = buildSystemPrompt(userContext)

        carloGroup('--- SYSTEM PROMPT ---')
        carloLog(systemPrompt)
        carloGroupEnd()

        // Build messages array for Claude
        const messages = [
            ...(existingMessages || []).map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: 'user', content: userMessage.trim() },
        ]

        carloGroup('--- API REQUEST ---')
        carloLog('Model:', 'claude-sonnet-4-20250514')
        carloLog('Max tokens:', 2048)
        carloLog('Messages count:', messages.length)
        carloLog('Messages:', messages)
        carloGroupEnd()

        const apiStartTime = Date.now()

        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: systemPrompt,
            messages: messages,
        })

        const apiLatency = Date.now() - apiStartTime
        const assistantMessage = response.content[0].text

        carloGroup('--- API RESPONSE ---')
        carloLog('Response latency (ms):', apiLatency)
        carloLog('Response content:', assistantMessage)
        carloLog('Usage:', response.usage)
        carloGroupEnd()

        // Save assistant response
        const { error: assistantMsgError } = await supabaseAdmin
            .from('conversation_messages')
            .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: assistantMessage,
            })

        if (assistantMsgError) {
            console.error('Error saving assistant message:', assistantMsgError)
            return { error: 'Failed to save response' }
        }

        // Generate title if this is the first message exchange
        if (!conversation.title && (!existingMessages || existingMessages.length === 0)) {
            const title = await generateTitle(userMessage, assistantMessage)
            await supabaseAdmin
                .from('conversations')
                .update({ title, updated_at: new Date().toISOString() })
                .eq('id', conversationId)
        } else {
            // Update conversation timestamp
            await supabaseAdmin
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId)
        }

        // Update milestone flag if this is user's first Carlo chat
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('has_used_carlo_chat')
            .eq('id', userId)
            .single()

        if (user && !user.has_used_carlo_chat) {
            await supabaseAdmin
                .from('users')
                .update({
                    has_used_carlo_chat: true,
                    first_carlo_chat_at: new Date().toISOString(),
                })
                .eq('id', userId)
        }

        revalidatePath('/carlo')
        revalidatePath('/home')

        const totalTime = Date.now() - startTime
        carloLog('Total request time (ms):', totalTime)
        carloLog('--- CARLO DEBUG END ---')
        carloGroupEnd()

        return { success: true, message: assistantMessage }
    } catch (error) {
        console.error('--- CARLO ERROR ---')
        console.error('Error calling Claude API:', error)
        carloGroupEnd()
        return { error: 'Failed to get response from Carlo. Please try again.' }
    }
}
