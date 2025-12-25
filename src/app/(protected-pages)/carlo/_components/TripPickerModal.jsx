'use client'

import { useState, useMemo } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import { PiMagnifyingGlass, PiCalendarBlank, PiInfo } from 'react-icons/pi'

const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export default function TripPickerModal({
    isOpen,
    onClose,
    trips = [],
    tripItems = {}, // { tripId: [itemIds] }
    selectedIds = [],
    onSave,
}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [localSelectedIds, setLocalSelectedIds] = useState(selectedIds)

    // Reset local state when modal opens
    useState(() => {
        if (isOpen) {
            setLocalSelectedIds(selectedIds)
            setSearchQuery('')
        }
    }, [isOpen, selectedIds])

    // Filter trips
    const filteredTrips = useMemo(() => {
        if (!searchQuery.trim()) return trips
        const query = searchQuery.toLowerCase()
        return trips.filter(
            (trip) =>
                trip.name?.toLowerCase().includes(query) ||
                trip.notes?.toLowerCase().includes(query)
        )
    }, [trips, searchQuery])

    const handleToggleTrip = (tripId) => {
        setLocalSelectedIds((prev) =>
            prev.includes(tripId)
                ? prev.filter((id) => id !== tripId)
                : [...prev, tripId]
        )
    }

    const handleSelectAll = () => {
        setLocalSelectedIds(filteredTrips.map((trip) => trip.id))
    }

    const handleClearAll = () => {
        setLocalSelectedIds([])
    }

    const handleSave = () => {
        // Collect all item IDs from selected trips
        const autoAddItemIds = localSelectedIds.flatMap(
            (tripId) => tripItems[tripId] || []
        )
        onSave(localSelectedIds, autoAddItemIds)
        onClose()
    }

    const handleClose = () => {
        setLocalSelectedIds(selectedIds) // Reset to original
        onClose()
    }

    const selectedCount = localSelectedIds.length

    // Count total items that will be auto-added
    const totalAutoItems = useMemo(() => {
        const uniqueItems = new Set()
        localSelectedIds.forEach((tripId) => {
            const items = tripItems[tripId] || []
            items.forEach((id) => uniqueItems.add(id))
        })
        return uniqueItems.size
    }, [localSelectedIds, tripItems])

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={550}>
            <div className="flex flex-col h-[60vh] max-h-[500px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Select Trips</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedCount} selected
                    </span>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-2 p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <PiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                        When you select a trip, all items assigned to that trip will be automatically added to your context.
                    </span>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <Input
                        placeholder="Search trips..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        prefix={<PiMagnifyingGlass className="text-gray-400" />}
                        size="sm"
                    />
                </div>

                {/* Select All / Clear All */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={handleSelectAll}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Select All ({filteredTrips.length})
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                    >
                        Clear All
                    </button>
                </div>

                {/* Trips List */}
                <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    {filteredTrips.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            {trips.length === 0
                                ? 'No trips created yet'
                                : 'No trips match your search'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredTrips.map((trip) => {
                                const itemCount = tripItems[trip.id]?.length || 0
                                return (
                                    <label
                                        key={trip.id}
                                        className="flex items-start gap-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={localSelectedIds.includes(trip.id)}
                                            onChange={() => handleToggleTrip(trip.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {trip.name}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {(trip.start_date || trip.end_date) && (
                                                    <span className="flex items-center gap-1">
                                                        <PiCalendarBlank className="w-3 h-3" />
                                                        {formatDate(trip.start_date)}
                                                        {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                                                    </span>
                                                )}
                                                <span>{itemCount} items</span>
                                            </div>
                                            {trip.notes && (
                                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                                                    {trip.notes}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Auto-add info */}
                {totalAutoItems > 0 && (
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        {totalAutoItems} item{totalAutoItems !== 1 ? 's' : ''} will be added to context
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="plain" size="sm" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="solid" size="sm" onClick={handleSave}>
                        Save ({selectedCount} trip{selectedCount !== 1 ? 's' : ''})
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
