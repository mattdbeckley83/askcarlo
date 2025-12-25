'use client'

import { useState, useTransition } from 'react'
import Card from '@/components/ui/Card'
import Checkbox from '@/components/ui/Checkbox'
import Button from '@/components/ui/Button'
import { updateActivities } from '@/server/actions/profile/updateActivities'

const ProfileForm = ({ user, activities, selectedActivityIds: initialSelectedIds }) => {
    const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds))
    const [isPending, startTransition] = useTransition()
    const [saveStatus, setSaveStatus] = useState(null)

    const handleActivityToggle = (activityId, checked) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (checked) {
                next.add(activityId)
            } else {
                next.delete(activityId)
            }
            return next
        })
        setSaveStatus(null)
    }

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateActivities(Array.from(selectedIds))
            if (result.success) {
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
        return false
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Checkbox
                                    checked={selectedIds.has(activity.id)}
                                    onChange={(checked) =>
                                        handleActivityToggle(activity.id, checked)
                                    }
                                >
                                    <span className="text-sm font-medium">{activity.name}</span>
                                </Checkbox>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <Button
                            variant="solid"
                            onClick={handleSave}
                            disabled={isPending || !hasChanges()}
                            loading={isPending}
                        >
                            Save Activities
                        </Button>
                        {saveStatus === 'success' && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                                Activities saved successfully!
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-sm text-red-600 dark:text-red-400">
                                Failed to save. Please try again.
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ProfileForm
