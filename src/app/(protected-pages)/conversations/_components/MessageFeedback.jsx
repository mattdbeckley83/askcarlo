'use client'

import { useState } from 'react'
import { PiThumbsUp, PiThumbsUpFill, PiThumbsDown, PiThumbsDownFill, PiCheck } from 'react-icons/pi'
import FeedbackIssueSelector from './FeedbackIssueSelector'
import { submitFeedback } from '@/server/actions/carlo/submitFeedback'

export default function MessageFeedback({
    conversationId,
    messageId,
    messageContent,
    userQuery,
    existingFeedback,
}) {
    const [rating, setRating] = useState(existingFeedback?.rating || null)
    const [showIssueSelector, setShowIssueSelector] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(!!existingFeedback)

    const handleThumbsUp = async () => {
        if (isSubmitting) return

        setIsSubmitting(true)
        setRating('helpful')
        setShowIssueSelector(false)

        const result = await submitFeedback({
            conversationId,
            messageId,
            rating: 'helpful',
            messageContent,
            userQuery,
        })

        setIsSubmitting(false)

        if (result.success) {
            setSubmitted(true)
            // Auto-hide after a moment
            setTimeout(() => setSubmitted(false), 2000)
        }
    }

    const handleThumbsDown = () => {
        if (isSubmitting) return
        setRating('not_helpful')
        setShowIssueSelector(true)
    }

    const handleIssueSubmit = async ({ issueType, comment }) => {
        setIsSubmitting(true)

        const result = await submitFeedback({
            conversationId,
            messageId,
            rating: 'not_helpful',
            issueType,
            comment,
            messageContent,
            userQuery,
        })

        setIsSubmitting(false)

        if (result.success) {
            setShowIssueSelector(false)
            setSubmitted(true)
        }
    }

    const handleCancelIssue = () => {
        setShowIssueSelector(false)
        setRating(null)
    }

    // Show simple thank you after submission
    if (submitted && !showIssueSelector) {
        return (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                <PiCheck className="w-3.5 h-3.5 text-green-500" />
                <span>Thanks for your feedback</span>
            </div>
        )
    }

    return (
        <div className="mt-1">
            <div className="flex items-center gap-0.5">
                <button
                    onClick={handleThumbsUp}
                    disabled={isSubmitting}
                    className={`p-1.5 rounded-md transition-colors ${
                        rating === 'helpful'
                            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                            : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    title="Helpful"
                >
                    {rating === 'helpful' ? (
                        <PiThumbsUpFill className="w-4 h-4" />
                    ) : (
                        <PiThumbsUp className="w-4 h-4" />
                    )}
                </button>
                <button
                    onClick={handleThumbsDown}
                    disabled={isSubmitting}
                    className={`p-1.5 rounded-md transition-colors ${
                        rating === 'not_helpful'
                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                            : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title="Not helpful"
                >
                    {rating === 'not_helpful' ? (
                        <PiThumbsDownFill className="w-4 h-4" />
                    ) : (
                        <PiThumbsDown className="w-4 h-4" />
                    )}
                </button>
            </div>

            {showIssueSelector && (
                <FeedbackIssueSelector
                    onSubmit={handleIssueSubmit}
                    onCancel={handleCancelIssue}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
