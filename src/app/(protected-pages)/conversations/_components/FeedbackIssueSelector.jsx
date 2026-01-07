'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

const issueOptions = [
    { value: 'inaccurate', label: 'Inaccurate' },
    { value: 'not_relevant', label: 'Not relevant' },
    { value: 'too_generic', label: 'Too generic' },
    { value: 'missing_details', label: 'Missing details' },
    { value: 'other', label: 'Other' },
]

export default function FeedbackIssueSelector({ onSubmit, onCancel, isSubmitting }) {
    const [selectedIssue, setSelectedIssue] = useState(null)
    const [comment, setComment] = useState('')

    const handleSubmit = () => {
        onSubmit({
            issueType: selectedIssue,
            comment: comment.trim() || null,
        })
    }

    return (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                What was the issue?
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
                {issueOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setSelectedIssue(option.value)}
                        className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                            selectedIssue === option.value
                                ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Additional comments (optional)"
                rows={2}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />

            <div className="flex justify-end gap-2 mt-2">
                <Button
                    type="button"
                    variant="plain"
                    size="xs"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="solid"
                    size="xs"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                </Button>
            </div>
        </div>
    )
}
