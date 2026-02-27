'use client'

import { useState, useTransition } from 'react'
import Card from '@/components/ui/Card'
import Checkbox from '@/components/ui/Checkbox'
import Button from '@/components/ui/Button'
import { updateActivities } from '@/server/actions/profile/updateActivities'
import { updateAiContext } from '@/server/actions/profile/updateAiContext'
import { useTokenBalance } from '@/lib/contexts/TokenBalanceContext'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { PiCoins } from 'react-icons/pi'

const MAX_ACTIVITY_NOTES_LENGTH = 500
const MAX_AI_CONTEXT_LENGTH = 1000

const ProfileForm = ({
    user,
    activities,
    selectedActivityIds: initialSelectedIds,
    activityNotes: initialActivityNotes = {},
}) => {
    const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds))
    const [activityNotes, setActivityNotes] = useState(initialActivityNotes)
    const [expandedNotes, setExpandedNotes] = useState(new Set())
    const [aiContext, setAiContext] = useState(user.aiContext || '')
    const [isPending, startTransition] = useTransition()
    const [saveStatus, setSaveStatus] = useState(null)
    const { refresh } = useTokenBalance()

    const handleActivityToggle = (activityId, checked) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (checked) {
                next.add(activityId)
            } else {
                next.delete(activityId)
                setActivityNotes((prevNotes) => {
                    const newNotes = { ...prevNotes }
                    delete newNotes[activityId]
                    return newNotes
                })
                setExpandedNotes((prev) => {
                    const next = new Set(prev)
                    next.delete(activityId)
                    return next
                })
            }
            return next
        })
        setSaveStatus(null)
    }

    const handleNoteChange = (activityId, value) => {
        if (value.length <= MAX_ACTIVITY_NOTES_LENGTH) {
            setActivityNotes((prev) => ({ ...prev, [activityId]: value }))
            setSaveStatus(null)
        }
    }

    const toggleNoteExpanded = (activityId) => {
        setExpandedNotes((prev) => {
            const next = new Set(prev)
            if (next.has(activityId)) {
                next.delete(activityId)
            } else {
                next.add(activityId)
            }
            return next
        })
    }

    const handleAiContextChange = (value) => {
        if (value.length <= MAX_AI_CONTEXT_LENGTH) {
            setAiContext(value)
            setSaveStatus(null)
        }
    }

    const handleSave = () => {
        startTransition(async () => {
            const activitiesResult = await updateActivities(
                Array.from(selectedIds),
                activityNotes
            )
            const contextResult = await updateAiContext(aiContext)

            if (activitiesResult.success && contextResult.success) {
                if (activitiesResult.tokensAwarded) {
                    refresh()
                    toast.push(
                        <Notification
                            title={`+${activitiesResult.tokensAwarded} tokens earned!`}
                            customIcon={<PiCoins className="text-[#fe7f2d] mt-0.5" size={22} />}
                            duration={6000}
                            closable
                        >
                            Activities selected
                        </Notification>
                    )
                }
                setSaveStatus('success')
                setTimeout(() => setSaveStatus(null), 3000)
            } else {
                setSaveStatus('error')
            }
        })
    }

    const hasChanges = () => {
        const initial = new Set(initialSelectedIds)
        if (initial.size !== selectedIds.size) return true
        for (const id of selectedIds) {
            if (!initial.has(id)) return true
        }
        for (const activityId of selectedIds) {
            const currentNote = activityNotes[activityId] || ''
            const initialNote = initialActivityNotes[activityId] || ''
            if (currentNote !== initialNote) return true
        }
        if (aiContext !== (user.aiContext || '')) return true
        return false
    }

    const truncateText = (text, maxLength = 50) => {
        if (!text || text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            {/* Account Information */}
            <Card>
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">Account Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">
                                Name
                            </label>
                            <p className="font-medium">
                                {user.firstName || user.lastName
                                    ? `${user.firstName} ${user.lastName}`.trim()
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">
                                Email
                            </label>
                            <p className="font-medium">{user.email || '—'}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* My Activities */}
            <Card>
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">My Activities</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Select the outdoor activities you enjoy. Carlo uses this to personalize recommendations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activities.map((activity) => {
                            const isSelected = selectedIds.has(activity.id)
                            const isExpanded = expandedNotes.has(activity.id)
                            const note = activityNotes[activity.id] || ''
                            const hasNote = note.trim().length > 0

                            return (
                                <div
                                    key={activity.id}
                                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={(checked) =>
                                                handleActivityToggle(activity.id, checked)
                                            }
                                            checkboxClass="text-[#fe7f2d]"
                                        >
                                            <span className="text-sm font-medium">{activity.name}</span>
                                        </Checkbox>

                                        {isSelected && (
                                            <button
                                                type="button"
                                                onClick={() => toggleNoteExpanded(activity.id)}
                                                className="text-xs text-[#fe7f2d] hover:underline whitespace-nowrap"
                                            >
                                                {isExpanded ? '[- Hide]' : '[+ Add Context]'}
                                            </button>
                                        )}
                                    </div>

                                    {isSelected && !isExpanded && hasNote && (
                                        <p className="mt-2 text-xs text-[#fe7f2d] italic pl-6">
                                            {truncateText(note)}
                                        </p>
                                    )}

                                    {isSelected && isExpanded && (
                                        <div className="mt-3 pl-6">
                                            <textarea
                                                value={note}
                                                onChange={(e) => handleNoteChange(activity.id, e.target.value)}
                                                placeholder={`Tell Carlo more about your ${activity.name} style... (optional)`}
                                                rows={2}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-[#fe7f2d] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                            <div className="flex justify-end mt-1">
                                                <span className={`text-xs ${note.length > MAX_ACTIVITY_NOTES_LENGTH - 50 ? 'text-amber-500' : 'text-gray-400'}`}>
                                                    {note.length}/{MAX_ACTIVITY_NOTES_LENGTH}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Card>

            {/* Anything else Carlo should know */}
            <Card>
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">Anything else Carlo should know?</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Optional - helps Carlo give better recommendations
                        </p>
                    </div>

                    <div>
                        <textarea
                            value={aiContext}
                            onChange={(e) => handleAiContextChange(e.target.value)}
                            placeholder="Body size, dietary restrictions, location, budget preferences, physical limitations, etc."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#fe7f2d] focus:border-[#fe7f2d] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <div className="flex justify-end mt-1">
                            <span className={`text-xs ${aiContext.length > MAX_AI_CONTEXT_LENGTH - 100 ? 'text-amber-500' : 'text-gray-400'}`}>
                                {aiContext.length}/{MAX_AI_CONTEXT_LENGTH}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <Button
                    variant="solid"
                    className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                    onClick={handleSave}
                    disabled={isPending || !hasChanges()}
                    loading={isPending}
                >
                    Save Profile
                </Button>
                {saveStatus === 'success' && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                        Profile saved successfully!
                    </span>
                )}
                {saveStatus === 'error' && (
                    <span className="text-sm text-red-600 dark:text-red-400">
                        Failed to save. Please try again.
                    </span>
                )}
            </div>
        </div>
    )
}

export default ProfileForm
