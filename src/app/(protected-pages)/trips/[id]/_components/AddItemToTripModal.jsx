'use client'

import { useState, useMemo, useTransition } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { addItemToTrip } from '@/server/actions/trips/addItemToTrip'

const CategoryBadge = ({ name, color }) => {
    return (
        <div className="flex items-center gap-2">
            <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color || '#6b7280' }}
            />
            <span className="text-sm text-gray-500">{name || 'Uncategorized'}</span>
        </div>
    )
}

const AddItemToTripModal = ({
    isOpen,
    onClose,
    tripId,
    availableItems,
    categoryMap,
}) => {
    const [isPending, startTransition] = useTransition()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItems, setSelectedItems] = useState(new Set())
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

    const handleToggleItem = (itemId) => {
        setSelectedItems((prev) => {
            const next = new Set(prev)
            if (next.has(itemId)) {
                next.delete(itemId)
            } else {
                next.add(itemId)
            }
            return next
        })
    }

    const handleSubmit = async () => {
        if (selectedItems.size === 0) {
            setError('Select at least one item')
            return
        }

        setError(null)

        startTransition(async () => {
            const itemIds = Array.from(selectedItems)
            const results = await Promise.all(
                itemIds.map((itemId) => addItemToTrip(tripId, itemId))
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
        setSelectedItems(new Set())
        setError(null)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={500}>
            <h4 className="text-lg font-semibold mb-4">Add Items to Trip</h4>

            <div className="mb-4">
                <Input
                    placeholder="Search items..."
                    prefix={<PiMagnifyingGlass className="text-lg" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="max-h-80 overflow-y-auto border rounded-lg dark:border-gray-700">
                {filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        {availableItems.length === 0
                            ? 'All items are already in this trip'
                            : 'No items match your search'}
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {filteredItems.map((item) => {
                            const category = categoryMap[item.category_id]
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                    onClick={() => handleToggleItem(item.id)}
                                >
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => handleToggleItem(item.id)}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                            {item.name}
                                        </div>
                                        <CategoryBadge
                                            name={category?.name}
                                            color={category?.color}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {selectedItems.size > 0 && (
                <div className="mt-3 text-sm text-gray-500">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </div>
            )}

            {error && <div className="mt-3 text-red-500 text-sm">{error}</div>}

            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="plain" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    onClick={handleSubmit}
                    loading={isPending}
                    disabled={selectedItems.size === 0}
                >
                    Add {selectedItems.size > 0 ? `(${selectedItems.size})` : ''}
                </Button>
            </div>
        </Dialog>
    )
}

export default AddItemToTripModal
