'use client'

import { useState, useMemo, useTransition } from 'react'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { PiTrash, PiSneaker, PiForkKnife, PiCaretUp, PiCaretDown, PiCaretUpDown, PiPlus } from 'react-icons/pi'
import { updateTripItem } from '@/server/actions/trips/updateTripItem'
import { removeItemFromTrip } from '@/server/actions/trips/removeItemFromTrip'
import { toggleItemPacked } from '@/server/actions/trips/toggleItemPacked'
import { convertToGrams, formatWeightForDisplay } from '@/lib/utils/weightCalculations'

const { Tr, Th, Td, THead, TBody } = Table

const CategoryBadge = ({ name, color }) => {
    return (
        <div className="flex items-center gap-2">
            <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color || '#6b7280' }}
            />
            <span>{name || 'Uncategorized'}</span>
        </div>
    )
}

const formatItemWeight = (weight, unit) => {
    if (!weight) return '—'
    const grams = convertToGrams(weight, unit)
    return formatWeightForDisplay(grams)
}

const SortableHeader = ({ label, sortKey, currentSort, onSort, className }) => {
    const isActive = currentSort.key === sortKey
    const direction = isActive ? currentSort.direction : null

    return (
        <button
            onClick={() => onSort(sortKey)}
            className={`flex items-center gap-1 uppercase hover:text-gray-900 dark:hover:text-gray-100 transition-colors group ${className || ''}`}
        >
            <span>{label}</span>
            <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {direction === 'asc' ? (
                    <PiCaretUp className="w-4 h-4" />
                ) : direction === 'desc' ? (
                    <PiCaretDown className="w-4 h-4" />
                ) : (
                    <PiCaretUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                )}
            </span>
        </button>
    )
}

const TripItemRow = ({ tripItem, tripId, categoryMap }) => {
    const [isPending, startTransition] = useTransition()
    const item = tripItem.items

    const handleToggle = (field, currentValue) => {
        startTransition(async () => {
            await updateTripItem(tripItem.id, tripId, { [field]: !currentValue })
        })
    }

    const handleTogglePacked = () => {
        startTransition(async () => {
            await toggleItemPacked(tripItem.id, tripId)
        })
    }

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10)
        if (!isNaN(value) && value >= 1) {
            startTransition(async () => {
                await updateTripItem(tripItem.id, tripId, { quantity: value })
            })
        }
    }

    const handleRemove = () => {
        startTransition(async () => {
            await removeItemFromTrip(tripItem.id, tripId)
        })
    }

    const category = categoryMap[item?.category_id]
    const isPacked = tripItem.packed

    return (
        <Tr className={`group ${isPending ? 'opacity-50' : ''}`}>
            <Td className="w-[40px]">
                <input
                    type="checkbox"
                    checked={isPacked}
                    onChange={handleTogglePacked}
                    disabled={isPending}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 cursor-pointer accent-[#fe7f2d]"
                />
            </Td>
            <Td>
                <CategoryBadge name={category?.name} color={category?.color} />
            </Td>
            <Td>
                <span className={`font-medium ${isPacked ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                    {item?.name || '—'}
                </span>
            </Td>
            <Td>
                <span className={`text-gray-600 dark:text-gray-400 ${isPacked ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                    {item?.brand || '—'}
                </span>
            </Td>
            <Td>{formatItemWeight(item?.weight, item?.weight_unit)}</Td>
            <Td>
                <div className="flex justify-center">
                    <Input
                        type="number"
                        min="1"
                        value={tripItem.quantity}
                        onChange={handleQuantityChange}
                        className="w-14 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        size="xs"
                    />
                </div>
            </Td>
            <Td>
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => handleToggle('is_worn', tripItem.is_worn)}
                        disabled={isPending}
                        className={`p-1.5 rounded-md transition-all ${
                            tripItem.is_worn
                                ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 opacity-100'
                                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 opacity-0 group-hover:opacity-100'
                        }`}
                        title={tripItem.is_worn ? 'Mark as not worn' : 'Mark as worn'}
                    >
                        <PiSneaker size={18} />
                    </button>
                    <button
                        onClick={() => handleToggle('is_consumable', tripItem.is_consumable)}
                        disabled={isPending}
                        className={`p-1.5 rounded-md transition-all ${
                            tripItem.is_consumable
                                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 opacity-100'
                                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 opacity-0 group-hover:opacity-100'
                        }`}
                        title={tripItem.is_consumable ? 'Mark as not consumable' : 'Mark as consumable'}
                    >
                        <PiForkKnife size={18} />
                    </button>
                    <button
                        onClick={handleRemove}
                        disabled={isPending}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove from trip"
                    >
                        <PiTrash size={18} />
                    </button>
                </div>
            </Td>
        </Tr>
    )
}

const TripItemList = ({ tripItems, tripId, categoryMap, onAddItem, addItemDisabled }) => {
    const [sort, setSort] = useState({ key: 'category', direction: 'asc' })

    const handleSort = (key) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    const sortedItems = useMemo(() => {
        const { key, direction } = sort
        const multiplier = direction === 'asc' ? 1 : -1

        return [...tripItems].sort((a, b) => {
            let aVal, bVal
            const aItem = a.items
            const bItem = b.items

            switch (key) {
                case 'category':
                    aVal = categoryMap[aItem?.category_id]?.name || ''
                    bVal = categoryMap[bItem?.category_id]?.name || ''
                    break
                case 'name':
                    aVal = aItem?.name || ''
                    bVal = bItem?.name || ''
                    break
                case 'brand':
                    aVal = aItem?.brand || ''
                    bVal = bItem?.brand || ''
                    break
                case 'weight':
                    aVal = aItem?.weight ? convertToGrams(aItem.weight, aItem.weight_unit) : 0
                    bVal = bItem?.weight ? convertToGrams(bItem.weight, bItem.weight_unit) : 0
                    return (aVal - bVal) * multiplier
                case 'quantity':
                    aVal = a.quantity || 0
                    bVal = b.quantity || 0
                    return (aVal - bVal) * multiplier
                default:
                    return 0
            }

            return aVal.localeCompare(bVal) * multiplier
        })
    }, [tripItems, sort, categoryMap])

    const packedCount = useMemo(() => tripItems.filter((i) => i.packed).length, [tripItems])
    const totalCount = tripItems.length

    return (
        <div className="rounded-lg">
            {totalCount > 0 && (
                <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                    Packed: {packedCount}/{totalCount} items
                </div>
            )}
            <Table overflow={false} compact className="[&>thead]:border-0 [&>tbody]:border-t-0">
                <THead className="border-b border-gray-200 dark:border-gray-700">
                    <Tr>
                        <Th className="w-[40px]" />
                        <Th className="w-[140px]">
                            <SortableHeader
                                label="Category"
                                sortKey="category"
                                currentSort={sort}
                                onSort={handleSort}
                            />
                        </Th>
                        <Th className="w-[280px]">
                            <SortableHeader
                                label="Item Name"
                                sortKey="name"
                                currentSort={sort}
                                onSort={handleSort}
                            />
                        </Th>
                        <Th>
                            <SortableHeader
                                label="Brand"
                                sortKey="brand"
                                currentSort={sort}
                                onSort={handleSort}
                            />
                        </Th>
                        <Th className="w-[80px]">
                            <SortableHeader
                                label="Weight"
                                sortKey="weight"
                                currentSort={sort}
                                onSort={handleSort}
                            />
                        </Th>
                        <Th className="w-[70px]">
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handleSort('quantity')}
                                    className="relative w-14 flex justify-center uppercase hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
                                >
                                    <span>Qty</span>
                                    <span className="absolute left-full ml-1 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                        {sort.key === 'quantity' ? (
                                            sort.direction === 'asc' ? <PiCaretUp className="w-4 h-4" /> : <PiCaretDown className="w-4 h-4" />
                                        ) : (
                                            <PiCaretUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                        )}
                                    </span>
                                </button>
                            </div>
                        </Th>
                        <Th className="w-[120px]">
                            <div className="flex justify-end">
                                <Button
                                    variant="solid"
                                    size="sm"
                                    className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                                    icon={<PiPlus />}
                                    onClick={onAddItem}
                                    disabled={addItemDisabled}
                                >
                                    Add Items
                                </Button>
                            </div>
                        </Th>
                    </Tr>
                </THead>
                <TBody>
                    {tripItems.length === 0 ? (
                        <Tr>
                            <Td colSpan={7} className="text-center py-8">
                                <div className="text-gray-500">
                                    <p className="text-lg font-medium">No items in this trip</p>
                                    <p className="text-sm">Add items from your inventory to get started</p>
                                </div>
                            </Td>
                        </Tr>
                    ) : sortedItems.map((tripItem) => (
                        <TripItemRow
                            key={tripItem.id}
                            tripItem={tripItem}
                            tripId={tripId}
                            categoryMap={categoryMap}
                        />
                    ))}
                </TBody>
            </Table>
        </div>
    )
}

export default TripItemList
