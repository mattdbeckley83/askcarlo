'use client'

import { useState, useMemo } from 'react'
import { PiCaretDown, PiCaretUp, PiPlus, PiCheck } from 'react-icons/pi'
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
    itemTypes = {},
    selectedContext,
    onContextChange,
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [gearPickerOpen, setGearPickerOpen] = useState(false)
    const [foodPickerOpen, setFoodPickerOpen] = useState(false)
    const [tripPickerOpen, setTripPickerOpen] = useState(false)
    const [activityPickerOpen, setActivityPickerOpen] = useState(false)

    // Filter items by type
    const gearItems = useMemo(() => {
        if (!itemTypes.gear) return []
        return items.filter((item) => item.item_type_id === itemTypes.gear)
    }, [items, itemTypes.gear])

    const foodItems = useMemo(() => {
        if (!itemTypes.food) return []
        return items.filter((item) => item.item_type_id === itemTypes.food)
    }, [items, itemTypes.food])

    const selectedGearCount = selectedContext.gearIds?.length || 0
    const selectedFoodCount = selectedContext.foodIds?.length || 0
    const selectedTripCount = selectedContext.tripIds?.length || 0
    const selectedActivityCount = selectedContext.activityIds?.length || 0

    const totalSelectedCount = selectedGearCount + selectedFoodCount + selectedTripCount + selectedActivityCount

    const handleGearChange = (gearIds) => {
        onContextChange({ ...selectedContext, gearIds })
    }

    const handleFoodChange = (foodIds) => {
        onContextChange({ ...selectedContext, foodIds })
    }

    const handleTripsChange = (tripIds, autoAddItemIds = []) => {
        // When a trip is selected, auto-add its gear and food items
        const newGearIds = [...selectedContext.gearIds || []]
        const newFoodIds = [...selectedContext.foodIds || []]

        autoAddItemIds.forEach((itemId) => {
            const item = items.find((i) => i.id === itemId)
            if (item) {
                if (item.item_type_id === itemTypes.gear && !newGearIds.includes(itemId)) {
                    newGearIds.push(itemId)
                } else if (item.item_type_id === itemTypes.food && !newFoodIds.includes(itemId)) {
                    newFoodIds.push(itemId)
                }
            }
        })

        onContextChange({
            ...selectedContext,
            tripIds,
            gearIds: [...new Set(newGearIds)],
            foodIds: [...new Set(newFoodIds)]
        })
    }

    const handleActivitiesChange = (activityIds) => {
        onContextChange({ ...selectedContext, activityIds })
    }

    return (
        <div>
            {/* Expanded Content — renders above the trigger */}
            {isExpanded && (
                <div className="px-4 pt-2 pb-1">
                    <div className="flex gap-2 flex-wrap">
                        <ContextButton
                            label="Gear"
                            count={selectedGearCount}
                            onClick={() => setGearPickerOpen(true)}
                        />
                        <ContextButton
                            label="Food"
                            count={selectedFoodCount}
                            onClick={() => setFoodPickerOpen(true)}
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
                </div>
            )}

            {/* Trigger button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
                <span className="flex items-center gap-2">
                    {isExpanded ? <PiCaretDown /> : <PiCaretUp />}
                    <span>Context</span>
                    {totalSelectedCount > 0 && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                            {totalSelectedCount} selected
                        </span>
                    )}
                </span>
            </button>

            {/* Picker Modals */}
            <ItemPickerModal
                isOpen={gearPickerOpen}
                onClose={() => setGearPickerOpen(false)}
                items={gearItems}
                categories={categories}
                selectedIds={selectedContext.gearIds || []}
                onSave={handleGearChange}
                itemType="gear"
            />

            <ItemPickerModal
                isOpen={foodPickerOpen}
                onClose={() => setFoodPickerOpen(false)}
                items={foodItems}
                categories={categories}
                selectedIds={selectedContext.foodIds || []}
                onSave={handleFoodChange}
                itemType="food"
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

