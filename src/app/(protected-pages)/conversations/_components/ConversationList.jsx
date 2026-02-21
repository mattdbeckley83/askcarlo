'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PiMagnifyingGlass, PiDotsThreeOutline, PiPencilSimple, PiArchive, PiTrash } from 'react-icons/pi'
import { createConversation } from '@/server/actions/carlo/createConversation'
import { deleteConversation } from '@/server/actions/carlo/deleteConversation'
import { renameConversation } from '@/server/actions/carlo/renameConversation'

export default function ConversationList({ conversations, firstMessages = {}, activeConversationId }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deletingId, setDeletingId] = useState(null)
    const [query, setQuery] = useState('')
    const [openMenuId, setOpenMenuId] = useState(null)
    const [renamingId, setRenamingId] = useState(null)
    const [renameValue, setRenameValue] = useState('')
    const renameInputRef = useRef(null)

    // Close menu on outside click
    useEffect(() => {
        if (!openMenuId) return
        const handleClick = () => setOpenMenuId(null)
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [openMenuId])

    // Focus rename input when it appears
    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus()
            renameInputRef.current.select()
        }
    }, [renamingId])

    const handleNewConversation = () => {
        startTransition(async () => {
            const result = await createConversation()
            if (result.success && result.conversation) {
                router.push(`/conversations?id=${result.conversation.id}`)
            }
        })
    }

    const handleSelectConversation = (conversationId) => {
        if (renamingId) return
        router.push(`/conversations?id=${conversationId}`)
    }

    const handleToggleMenu = (e, conversationId) => {
        e.stopPropagation()
        setOpenMenuId((prev) => (prev === conversationId ? null : conversationId))
    }

    const handleStartRename = (e, conversation) => {
        e.stopPropagation()
        setOpenMenuId(null)
        setRenamingId(conversation.id)
        setRenameValue(conversation.title || '')
    }

    const handleRenameSubmit = async (conversationId) => {
        if (!renameValue.trim()) {
            setRenamingId(null)
            return
        }
        const result = await renameConversation(conversationId, renameValue)
        setRenamingId(null)
        if (result.success) router.refresh()
    }

    const handleRenameKeyDown = (e, conversationId) => {
        if (e.key === 'Enter') handleRenameSubmit(conversationId)
        if (e.key === 'Escape') setRenamingId(null)
    }

    const handleDelete = async (e, conversationId) => {
        e.stopPropagation()
        setOpenMenuId(null)
        if (!confirm('Delete this conversation?')) return

        setDeletingId(conversationId)
        const result = await deleteConversation(conversationId)
        setDeletingId(null)

        if (result.success) {
            if (activeConversationId === conversationId) {
                router.push('/conversations')
            } else {
                router.refresh()
            }
        }
    }

    const filtered = query.trim()
        ? conversations.filter((c) => {
              const q = query.toLowerCase()
              return (
                  (c.title || '').toLowerCase().includes(q) ||
                  (firstMessages[c.id] || '').toLowerCase().includes(q)
              )
          })
        : conversations

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">

            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <PiMagnifyingGlass
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        size={16}
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-transparent border-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        {query.trim() ? (
                            <p className="text-sm">No conversations match &ldquo;{query}&rdquo;</p>
                        ) : (
                            <>
                                <p className="text-sm">No conversations yet</p>
                                <p className="text-xs mt-1">Start a new conversation with Carlo</p>
                            </>
                        )}
                    </div>
                ) : (
                    <ul className="p-2 flex flex-col gap-0.5">
                        {filtered.map((conversation) => (
                            <li
                                key={conversation.id}
                                onClick={() => handleSelectConversation(conversation.id)}
                                className={`
                                    group relative px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150
                                    ${activeConversationId === conversation.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : ''}
                                    ${deletingId === conversation.id ? 'opacity-50' : ''}
                                `}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        {renamingId === conversation.id ? (
                                            <input
                                                ref={renameInputRef}
                                                type="text"
                                                value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                onBlur={() => handleRenameSubmit(conversation.id)}
                                                onKeyDown={(e) => handleRenameKeyDown(e, conversation.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full text-sm font-bold bg-white dark:bg-gray-700 border border-indigo-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                                {conversation.title || 'New Conversation'}
                                            </p>
                                        )}
                                        {!renamingId && firstMessages[conversation.id] && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                                {firstMessages[conversation.id]}
                                            </p>
                                        )}
                                    </div>

                                    {/* Ellipsis trigger */}
                                    <div className="relative flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => handleToggleMenu(e, conversation.id)}
                                            className={`p-1.5 rounded-md transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                                openMenuId === conversation.id
                                                    ? 'opacity-100 bg-gray-100 dark:bg-gray-600'
                                                    : 'opacity-0 group-hover:opacity-100'
                                            }`}
                                            title="More options"
                                        >
                                            <PiDotsThreeOutline size={16} />
                                        </button>

                                        {/* Dropdown menu */}
                                        {openMenuId === conversation.id && (
                                            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                                                <button
                                                    onMouseDown={(e) => handleStartRename(e, conversation)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <PiPencilSimple size={15} className="text-gray-400" />
                                                    Rename
                                                </button>
                                                <button
                                                    disabled
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                                    title="Coming soon"
                                                >
                                                    <PiArchive size={15} />
                                                    Archive
                                                </button>
                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                                                <button
                                                    onMouseDown={(e) => handleDelete(e, conversation.id)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <PiTrash size={15} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* New Conversation — pinned to bottom */}
            <div className="px-3 py-4">
                <button
                    onClick={handleNewConversation}
                    disabled={isPending}
                    className="w-full px-4 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                    {isPending ? 'Creating...' : '+ New Conversation'}
                </button>
            </div>
        </div>
    )
}
