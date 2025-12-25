'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PiLightning, PiMapTrifold, PiChatCircle } from 'react-icons/pi'
import { getConversation } from '@/server/actions/carlo/getConversation'
import { sendMessage } from '@/server/actions/carlo/sendMessage'
import { createConversation } from '@/server/actions/carlo/createConversation'
import { getFeedback } from '@/server/actions/carlo/submitFeedback'
import UpgradeGearModal from './UpgradeGearModal'
import TripPlanningModal from './TripPlanningModal'
import MessageFeedback from './MessageFeedback'
import ContextFooter from './ContextFooter'

export default function ChatInterface({
    conversationId,
    items = [],
    trips = [],
    tripItems = {},
    categories = [],
    activities = [],
}) {
    const router = useRouter()
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
    const [tripModalOpen, setTripModalOpen] = useState(false)
    const [feedbackData, setFeedbackData] = useState({})
    const [selectedContext, setSelectedContext] = useState({
        itemIds: [],
        tripIds: [],
        activityIds: [],
    })
    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (conversationId) {
            loadConversation(conversationId)
        } else {
            setMessages([])
        }
    }, [conversationId])

    const loadConversation = async (id) => {
        setIsFetching(true)
        const [conversationResult, feedbackResult] = await Promise.all([
            getConversation(id),
            getFeedback(id),
        ])
        setIsFetching(false)

        if (conversationResult.success) {
            setMessages(conversationResult.messages)
        }
        if (feedbackResult.feedback) {
            setFeedbackData(feedbackResult.feedback)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const message = inputValue.trim()
        if (!message || isLoading) return

        setInputValue('')
        setIsLoading(true)

        // If no active conversation, create one first
        let activeConversationId = conversationId
        if (!activeConversationId) {
            const createResult = await createConversation()
            if (createResult.success && createResult.conversation) {
                activeConversationId = createResult.conversation.id
                startTransition(() => {
                    router.push(`/carlo?id=${activeConversationId}`)
                })
            } else {
                setIsLoading(false)
                return
            }
        }

        // Add user message to UI immediately
        const userMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: message,
            created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, userMessage])

        // Send message to API with context
        const result = await sendMessage(activeConversationId, message, selectedContext)

        if (result.success) {
            // Add assistant response
            const assistantMessage = {
                id: `temp-${Date.now()}-assistant`,
                role: 'assistant',
                content: result.message,
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            router.refresh() // Refresh to update conversation title in sidebar
        } else {
            // Show error message
            const errorMessage = {
                id: `temp-${Date.now()}-error`,
                role: 'assistant',
                content: `Error: ${result.error}`,
                created_at: new Date().toISOString(),
                isError: true,
            }
            setMessages((prev) => [...prev, errorMessage])
        }

        setIsLoading(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleTemplateSubmit = async ({ template, prompt }) => {
        setIsLoading(true)

        // Create conversation with template type
        const createResult = await createConversation(template)
        if (!createResult.success || !createResult.conversation) {
            setIsLoading(false)
            return
        }

        const newConversationId = createResult.conversation.id
        startTransition(() => {
            router.push(`/carlo?id=${newConversationId}`)
        })

        // Add user message to UI immediately
        const userMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: prompt,
            created_at: new Date().toISOString(),
        }
        setMessages([userMessage])

        // Send the template prompt with context
        const result = await sendMessage(newConversationId, prompt, selectedContext)

        if (result.success) {
            const assistantMessage = {
                id: `temp-${Date.now()}-assistant`,
                role: 'assistant',
                content: result.message,
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            router.refresh()
        } else {
            const errorMessage = {
                id: `temp-${Date.now()}-error`,
                role: 'assistant',
                content: `Error: ${result.error}`,
                created_at: new Date().toISOString(),
                isError: true,
            }
            setMessages((prev) => [...prev, errorMessage])
        }

        setIsLoading(false)
    }

    if (!conversationId && messages.length === 0) {
        return (
            <>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center max-w-lg">
                            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                <PiChatCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Welcome to Carlo
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                I'm your AI backpacking advisor. Start a conversation or use a template for guided help.
                            </p>

                            {/* Template Buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    onClick={() => setUpgradeModalOpen(true)}
                                    className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors text-left"
                                >
                                    <PiLightning className="w-6 h-6 text-amber-500" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white text-sm">Upgrade Gear</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Get replacement recommendations</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setTripModalOpen(true)}
                                    className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors text-left"
                                >
                                    <PiMapTrifold className="w-6 h-6 text-green-500" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white text-sm">Trip Planning</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Get advice for your trip</div>
                                    </div>
                                </button>
                            </div>

                            <div className="text-xs text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">Or ask anything</div>

                            <div className="grid grid-cols-1 gap-2 text-left text-sm">
                                <SuggestionButton
                                    onClick={() => setInputValue("What gear should I prioritize for weight savings?")}
                                    text="What gear should I prioritize for weight savings?"
                                />
                                <SuggestionButton
                                    onClick={() => setInputValue("Help me plan a 3-day backpacking trip")}
                                    text="Help me plan a 3-day backpacking trip"
                                />
                                <SuggestionButton
                                    onClick={() => setInputValue("What's a good food strategy for a week-long trip?")}
                                    text="What's a good food strategy for a week-long trip?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Context Footer */}
                    <ContextFooter
                        items={items}
                        trips={trips}
                        tripItems={tripItems}
                        activities={activities}
                        categories={categories}
                        selectedContext={selectedContext}
                        onContextChange={setSelectedContext}
                    />

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-2">
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Carlo anything about backpacking..."
                                    rows={1}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Template Modals */}
                <UpgradeGearModal
                    isOpen={upgradeModalOpen}
                    onClose={() => setUpgradeModalOpen(false)}
                    onSubmit={handleTemplateSubmit}
                />
                <TripPlanningModal
                    isOpen={tripModalOpen}
                    onClose={() => setTripModalOpen(false)}
                    onSubmit={handleTemplateSubmit}
                />
            </>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                {isFetching ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p>Start the conversation by sending a message</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message, index) => {
                            // Find the preceding user message for context
                            let userQuery = null
                            if (message.role === 'assistant') {
                                for (let i = index - 1; i >= 0; i--) {
                                    if (messages[i].role === 'user') {
                                        userQuery = messages[i].content
                                        break
                                    }
                                }
                            }

                            return (
                                <MessageBubble
                                    key={message.id}
                                    message={message}
                                    conversationId={conversationId}
                                    userQuery={userQuery}
                                    existingFeedback={feedbackData[message.id]}
                                />
                            )
                        })}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">C</span>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Context Footer */}
            <ContextFooter
                items={items}
                trips={trips}
                tripItems={tripItems}
                activities={activities}
                categories={categories}
                selectedContext={selectedContext}
                onContextChange={setSelectedContext}
            />

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-2">
                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            rows={1}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                'Send'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function MessageBubble({ message, conversationId, userQuery, existingFeedback }) {
    const isUser = message.role === 'user'
    const isError = message.isError
    const showFeedback = !isUser && !isError && conversationId

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUser ? 'bg-gray-200 dark:bg-gray-600' : 'bg-indigo-100 dark:bg-indigo-900'
            }`}>
                <span className={`text-xs font-medium ${isUser ? 'text-gray-600 dark:text-gray-300' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {isUser ? 'U' : 'C'}
                </span>
            </div>
            <div className="max-w-[80%]">
                <div className={`rounded-lg px-4 py-3 ${
                    isUser
                        ? 'bg-indigo-600 text-white'
                        : isError
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                    <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                    </div>
                </div>
                {showFeedback && (
                    <MessageFeedback
                        conversationId={conversationId}
                        messageId={message.id}
                        messageContent={message.content}
                        userQuery={userQuery}
                        existingFeedback={existingFeedback}
                    />
                )}
            </div>
        </div>
    )
}

function SuggestionButton({ onClick, text }) {
    return (
        <button
            onClick={onClick}
            className="w-full px-4 py-2 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors text-gray-700 dark:text-gray-300"
        >
            {text}
        </button>
    )
}
