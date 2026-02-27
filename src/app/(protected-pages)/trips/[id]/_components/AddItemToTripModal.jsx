'use client'

import { useState, useMemo, useTransition } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { addItemToTrip } from '@/server/actions/trips/addItemToTrip'

const AddItemToTripModal = ({
    isOpen,
    onClose,
    tripId,
    availableItems,
    categoryMap,
}) => {
    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIds, setSelectedIds] = useState([])
    const [error, setError] = useState(null)

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return availableItems
        const query = searchQuery.toLowerCase()
        return availableItems.filter(
            (item) =>
                item.name?.toLowerCase().includes(query) ||
                item.brand?.toLowerCase().includes(query) ||
                categoryMap[item.category_id]?.name?.toLowerCase().includes(query)
        )
    }, [availableItems, searchQuery, categoryMap])

    const groupedItems = useMemo(() => {
        const groups = {}
        filteredItems.forEach((item) => {
            const category = categoryMap[item.category_id]
            const groupKey = category?.name || 'Uncategorized'
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    name: groupKey,
                    color: category?.color || '#6b7280',
                    items: [],
                }
            }
            groups[groupKey].items.push(item)
        })
        return Object.values(groups).sort((a, b) => {
            if (a.name === 'Uncategorized') return 1
            if (b.name === 'Uncategorized') return -1
            return a.name.localeCompare(b.name)
        })
    }, [filteredItems, categoryMap])

    const handleToggleItem = (itemId) => {
        setSelectedIds((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        )
    }

    const handleSelectAll = () => setSelectedIds(filteredItems.map((item) => item.id))
    const handleClearAll = () => setSelectedIds([])

    const handleSave = () => {
        if (selectedIds.length === 0) {
            setError('Select at least one item')
            return
        }
        setError(null)
        startTransition(async () => {
            const results = await Promise.all(
                selectedIds.map((itemId) => addItemToTrip(tripId, itemId))
            )
            const errors = results.filter((r) => r.error)
            if (errors.length > 0) {
                setError(`Failed to add ${errors.length} item(s)`)
            } else {
                handleClose()
            }
        })
    }

    const handleClose = () => {
        setSearchQuery('')
        setSelectedIds([])
        setError(null)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} closable={false} width={600}>
            <div className="flex flex-col h-[70vh] max-h-[600px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Add Items to Trip</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedIds.length} selected
                    </span>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <Input
                        placeholder="Search items..."
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
                        className="text-sm text-[#fe7f2d] hover:underline"
                    >
                        Select All ({filteredItems.length})
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                        onClick={handleClearAll}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
                    >
                        Clear All
                    </button>
                </div>

                {/* Items grouped by category */}
                <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                    {filteredItems.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            {availableItems.length === 0
                                ? 'All items are already in this trip'
                                : 'No items match your search'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {groupedItems.map((group) => (
                                <div key={group.name}>
                                    <div className="sticky top-0 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: group.color }}
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {group.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ({group.items.length})
                                            </span>
                                        </div>
                                    </div>
                                    {group.items.map((item) => (
                                        <label
                                            key={item.id}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => handleToggleItem(item.id)}
                                                checkboxClass="text-[#fe7f2d]"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {item.name}
                                                </div>
                                                {item.brand && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {item.brand}
                                                    </div>
                                                )}
                                            </div>
                                            {item.weight && (
                                                <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                                    {item.weight} {item.weight_unit}
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && <div className="mt-3 text-red-500 text-sm">{error}</div>}

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="plain" size="sm" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                        onClick={handleSave}
                        loading={isPending}
                    >
                        Add ({selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''})
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default AddItemToTripModal
