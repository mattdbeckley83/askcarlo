'use client'

import { useState, useRef, useEffect } from 'react'
import {
    PiLightbulb,
    PiCode,
    PiPencilSimple,
    PiChartLine,
    PiPaperPlaneRight,
    PiSparkle,
    PiMagnifyingGlass,
    PiImage,
    PiPlus,
} from 'react-icons/pi'

// Template reference page - not part of main navigation
// Access via /chat URL

const suggestionCards = [
    {
        icon: PiLightbulb,
        title: 'Brainstorm ideas',
        description: 'Generate creative concepts for your project',
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
        icon: PiCode,
        title: 'Help me code',
        description: 'Debug, write, or explain code',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
        icon: PiPencilSimple,
        title: 'Write content',
        description: 'Create articles, emails, or documents',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
        icon: PiChartLine,
        title: 'Analyze data',
        description: 'Extract insights from your information',
        color: 'text-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
]

const sampleConversations = [
    {
        id: 1,
        title: 'Camera outfit',
        preview: "I have a photoshoot tomorrow. Can...",
    },
    {
        id: 2,
        title: 'Vacation planning',
        preview: "I'm planning a trip to Europe next su...",
    },
    {
        id: 3,
        title: 'Healthy recipes',
        preview: 'Can you suggest some healthy dinn...',
    },
    {
        id: 4,
        title: 'Exercise routine',
        preview: "I'm looking to start a new exercise r...",
    },
    {
        id: 5,
        title: 'Max number Python function',
        preview: 'Write a Python function that finding...',
    },
]

const demoResponses = [
    "I'd be happy to help you with that! Could you tell me more about what you're working on?",
    "That's an interesting question. Let me break it down for you...",
    "Great idea! Here are some thoughts on how we could approach this together.",
    "I understand what you're looking for. Let me provide some suggestions.",
]

export default function TemplateChatPage() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const message = inputValue.trim()
        if (!message || isTyping) return

        // Add user message
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: message,
        }
        setMessages((prev) => [...prev, userMessage])
        setInputValue('')
        setIsTyping(true)

        // Simulate AI response after delay
        setTimeout(() => {
            const randomResponse =
                demoResponses[Math.floor(Math.random() * demoResponses.length)]
            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: randomResponse,
            }
            setMessages((prev) => [...prev, aiMessage])
            setIsTyping(false)
        }, 1500)
    }

    const handleSuggestionClick = (title) => {
        setInputValue(title)
        inputRef.current?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleNewChat = () => {
        setMessages([])
        setInputValue('')
    }

    return (
        <div className="flex h-[calc(100vh-120px)]">
            {/* Main content area with gray background */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-gray-900">
                {messages.length === 0 ? (
                    <WelcomeScreen
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        inputRef={inputRef}
                        handleSubmit={handleSubmit}
                        handleKeyDown={handleKeyDown}
                        handleSuggestionClick={handleSuggestionClick}
                    />
                ) : (
                    <ChatScreen
                        messages={messages}
                        isTyping={isTyping}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        inputRef={inputRef}
                        messagesEndRef={messagesEndRef}
                        handleSubmit={handleSubmit}
                        handleKeyDown={handleKeyDown}
                    />
                )}

                {/* Copyright footer */}
                <div className="py-3 text-center">
                    <p className="text-xs text-gray-400">
                        Copyright 2026 Ecme All rights reserved.
                    </p>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search chat"
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                    {sampleConversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50"
                        >
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {conversation.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                {conversation.preview}
                            </p>
                        </button>
                    ))}
                </div>

                {/* New chat button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <PiPlus className="w-4 h-4" />
                        New chat
                    </button>
                </div>
            </div>
        </div>
    )
}

function WelcomeScreen({
    inputValue,
    setInputValue,
    inputRef,
    handleSubmit,
    handleKeyDown,
    handleSuggestionClick,
}) {
    return (
        <div className="flex-1 flex flex-col p-6">
            {/* White card container - full height */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10">
                <div className="w-full max-w-4xl text-center">
                    {/* Greeting with gradient */}
                    <div className="mb-2">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Hello, there
                            </span>
                        </h1>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-medium text-gray-400 dark:text-gray-500 mb-10">
                        How can I help you today?
                    </h2>

                    {/* Suggestion cards - horizontal row */}
                    <div className="flex gap-5 mb-10">
                        {suggestionCards.map((card, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    handleSuggestionClick(card.title)
                                }
                                className="flex-1 flex flex-col justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:bg-white dark:hover:bg-gray-700 transition-all text-left group min-h-[150px]"
                            >
                                {/* Text at top */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>

                                {/* Icon at bottom-left */}
                                <div
                                    className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center mt-4`}
                                >
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Input area */}
                    <form onSubmit={handleSubmit}>
                        <div className="relative flex items-center">
                            <button
                                type="button"
                                className="absolute left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <PiImage className="w-5 h-5" />
                            </button>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter a prompt here"
                                className="w-full pl-12 pr-14 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <PiPaperPlaneRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

function ChatScreen({
    messages,
    isTyping,
    inputValue,
    setInputValue,
    inputRef,
    messagesEndRef,
    handleSubmit,
    handleKeyDown,
}) {
    return (
        <div className="flex-1 flex flex-col min-h-0 p-6">
            {/* White card container */}
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input area */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                        <div className="relative flex items-center">
                            <button
                                type="button"
                                className="absolute left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <PiImage className="w-5 h-5" />
                            </button>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter a prompt here"
                                className="w-full pl-12 pr-14 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping}
                                className="absolute right-2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <PiPaperPlaneRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

function MessageBubble({ message }) {
    const isUser = message.role === 'user'

    return (
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser
                        ? 'bg-gray-200 dark:bg-gray-600'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}
            >
                {isUser ? (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        U
                    </span>
                ) : (
                    <PiSparkle className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message content */}
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
            >
                <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
        </div>
    )
}

function TypingIndicator() {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600">
                <PiSparkle className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                    <span
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                    />
                    <span
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                    />
                    <span
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                    />
                </div>
            </div>
        </div>
    )
}
