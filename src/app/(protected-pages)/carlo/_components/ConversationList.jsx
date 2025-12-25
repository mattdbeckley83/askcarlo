'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createConversation } from '@/server/actions/carlo/createConversation'
import { deleteConversation } from '@/server/actions/carlo/deleteConversation'

export default function ConversationList({ conversations, activeConversationId }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deletingId, setDeletingId] = useState(null)

    const handleNewConversation = async () => {
        startTransition(async () => {
            const result = await createConversation()
            if (result.success && result.conversation) {
                router.push(`/carlo?id=${result.conversation.id}`)
            }
        })
    }

    const handleSelectConversation = (conversationId) => {
        router.push(`/carlo?id=${conversationId}`)
    }

    const handleDeleteConversation = async (e, conversationId) => {
        e.stopPropagation()
        if (!confirm('Delete this conversation?')) return

        setDeletingId(conversationId)
        const result = await deleteConversation(conversationId)
        setDeletingId(null)

        if (result.success) {
            if (activeConversationId === conversationId) {
                router.push('/carlo')
            } else {
                router.refresh()
            }
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (diffDays === 1) {
            return 'Yesterday'
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' })
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        }
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={handleNewConversation}
                    disabled={isPending}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isPending ? 'Creating...' : '+ New Conversation'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new conversation with Carlo</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {conversations.map((conversation) => (
                            <li
                                key={conversation.id}
                                onClick={() => handleSelectConversation(conversation.id)}
                                className={`
                                    px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
                                    ${activeConversationId === conversation.id ? 'bg-indigo-50 border-l-2 border-indigo-600' : ''}
                                    ${deletingId === conversation.id ? 'opacity-50' : ''}
                                `}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {conversation.title || 'New Conversation'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatDate(conversation.updated_at)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                        disabled={deletingId === conversation.id}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete conversation"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
