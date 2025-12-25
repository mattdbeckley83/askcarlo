'use client'

import { useState } from 'react'
import { PiCaretDown, PiCaretUp, PiPlus, PiCheck, PiX, PiPencilSimple } from 'react-icons/pi'
import Button from '@/components/ui/Button'
import ItemPickerModal from './ItemPickerModal'
import TripPickerModal from './TripPickerModal'
import ActivityPickerModal from './ActivityPickerModal'

export default function ContextFooter({
    items = [],
    trips = [],
    tripItems = {},
    activities = [],
    categories = [],
    selectedContext,
    onContextChange,
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [itemPickerOpen, setItemPickerOpen] = useState(false)
    const [tripPickerOpen, setTripPickerOpen] = useState(false)
    const [activityPickerOpen, setActivityPickerOpen] = useState(false)

    const selectedItemCount = selectedContext.itemIds?.length || 0
    const selectedTripCount = selectedContext.tripIds?.length || 0
    const selectedActivityCount = selectedContext.activityIds?.length || 0

    const hasAnySelection = selectedItemCount > 0 || selectedTripCount > 0 || selectedActivityCount > 0

    // Get selected item names for display
    const selectedItems = items.filter((item) => selectedContext.itemIds?.includes(item.id))
    const selectedTrips = trips.filter((trip) => selectedContext.tripIds?.includes(trip.id))
    const selectedActivities = activities.filter((act) => selectedContext.activityIds?.includes(act.id))

    const handleItemsChange = (itemIds) => {
        onContextChange({ ...selectedContext, itemIds })
    }

    const handleTripsChange = (tripIds, autoAddItemIds = []) => {
        // When a trip is selected, auto-add its items
        const newItemIds = [...new Set([...(selectedContext.itemIds || []), ...autoAddItemIds])]
        onContextChange({ ...selectedContext, tripIds, itemIds: newItemIds })
    }

    const handleActivitiesChange = (activityIds) => {
        onContextChange({ ...selectedContext, activityIds })
    }

    const clearItems = () => {
        onContextChange({ ...selectedContext, itemIds: [] })
    }

    const clearTrips = () => {
        onContextChange({ ...selectedContext, tripIds: [] })
    }

    const clearActivities = () => {
        onContextChange({ ...selectedContext, activityIds: [] })
    }

    const formatListPreview = (items, maxShow = 3) => {
        if (items.length === 0) return null
        const names = items.slice(0, maxShow).map((i) => i.name)
        const remaining = items.length - maxShow
        if (remaining > 0) {
            return `${names.join(', ')}, +${remaining} more`
        }
        return names.join(', ')
    }

    return (
        <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Collapsible Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <span className="flex items-center gap-2">
                    {isExpanded ? <PiCaretUp /> : <PiCaretDown />}
                    <span>Context</span>
                    {hasAnySelection && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                            {selectedItemCount + selectedTripCount + selectedActivityCount} selected
                        </span>
                    )}
                </span>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-3">
                    {/* Context Buttons */}
                    <div className="flex gap-2 mb-3">
                        <ContextButton
                            label="Items"
                            count={selectedItemCount}
                            onClick={() => setItemPickerOpen(true)}
                        />
                        <ContextButton
                            label="Trips"
                            count={selectedTripCount}
                            onClick={() => setTripPickerOpen(true)}
                        />
                        <ContextButton
                            label="Activities"
                            count={selectedActivityCount}
                            onClick={() => setActivityPickerOpen(true)}
                        />
                    </div>

                    {/* Selected Items Preview */}
                    {hasAnySelection && (
                        <div className="space-y-2 text-sm">
                            {selectedItemCount > 0 && (
                                <ContextPreviewRow
                                    label="Items"
                                    preview={formatListPreview(selectedItems)}
                                    onEdit={() => setItemPickerOpen(true)}
                                    onClear={clearItems}
                                />
                            )}
                            {selectedTripCount > 0 && (
                                <ContextPreviewRow
                                    label="Trips"
                                    preview={formatListPreview(selectedTrips)}
                                    onEdit={() => setTripPickerOpen(true)}
                                    onClear={clearTrips}
                                />
                            )}
                            {selectedActivityCount > 0 && (
                                <ContextPreviewRow
                                    label="Activities"
                                    preview={formatListPreview(selectedActivities)}
                                    onEdit={() => setActivityPickerOpen(true)}
                                    onClear={clearActivities}
                                />
                            )}
                        </div>
                    )}

                    {!hasAnySelection && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Add context to give Carlo access to your data
                        </p>
                    )}
                </div>
            )}

            {/* Picker Modals */}
            <ItemPickerModal
                isOpen={itemPickerOpen}
                onClose={() => setItemPickerOpen(false)}
                items={items}
                categories={categories}
                selectedIds={selectedContext.itemIds || []}
                onSave={handleItemsChange}
            />

            <TripPickerModal
                isOpen={tripPickerOpen}
                onClose={() => setTripPickerOpen(false)}
                trips={trips}
                tripItems={tripItems}
                selectedIds={selectedContext.tripIds || []}
                onSave={handleTripsChange}
            />

            <ActivityPickerModal
                isOpen={activityPickerOpen}
                onClose={() => setActivityPickerOpen(false)}
                activities={activities}
                selectedIds={selectedContext.activityIds || []}
                onSave={handleActivitiesChange}
            />
        </div>
    )
}

function ContextButton({ label, count, onClick }) {
    const hasSelection = count > 0

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                hasSelection
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
            {hasSelection ? (
                <>
                    <PiCheck className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs px-1.5 rounded-full">
                        {count}
                    </span>
                </>
            ) : (
                <>
                    <PiPlus className="w-3.5 h-3.5" />
                    <span>{label}</span>
                </>
            )}
        </button>
    )
}

function ContextPreviewRow({ label, preview, onEdit, onClear }) {
    return (
        <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300 w-16 flex-shrink-0">{label}:</span>
            <span className="flex-1 truncate">{preview}</span>
            <div className="flex gap-1 flex-shrink-0">
                <button
                    onClick={onEdit}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Edit"
                >
                    <PiPencilSimple className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={onClear}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-red-500"
                    title="Clear"
                >
                    <PiX className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}
