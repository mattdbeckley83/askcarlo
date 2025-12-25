'use client'

import { useState, useMemo } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'

export default function ActivityPickerModal({
    isOpen,
    onClose,
    activities = [],
    selectedIds = [],
    onSave,
}) {
    const [localSelectedIds, setLocalSelectedIds] = useState(selectedIds)

    // Reset local state when modal opens
    useState(() => {
        if (isOpen) {
            setLocalSelectedIds(selectedIds)
        }
    }, [isOpen, selectedIds])

    const handleToggleActivity = (activityId) => {
        setLocalSelectedIds((prev) =>
            prev.includes(activityId)
                ? prev.filter((id) => id !== activityId)
                : [...prev, activityId]
        )
    }

    const handleSelectAll = () => {
        setLocalSelectedIds(activities.map((act) => act.id))
    }

    const handleClearAll = () => {
        setLocalSelectedIds([])
    }

    const handleSave = () => {
        onSave(localSelectedIds)
        onClose()
    }

    const handleClose = () => {
        setLocalSelectedIds(selectedIds) // Reset to original
        onClose()
    }

    const selectedCount = localSelectedIds.length

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={400}>
            <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Select Activities</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedCount} selected
                    </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Select activities to help Carlo understand what type of trip you're planning.
                </p>

                {/* Select All / Clear All */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={handleSelectAll}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                    >
                        Clear All
                    </button>
                </div>

                {/* Activities List */}
                <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    {activities.length === 0 ? (
                        <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                            No activities available
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {activities.map((activity) => (
                                <label
                                    key={activity.id}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={localSelectedIds.includes(activity.id)}
                                        onChange={() => handleToggleActivity(activity.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.name}
                                        </div>
                                        {activity.description && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {activity.description}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="plain" size="sm" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="solid" size="sm" onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
