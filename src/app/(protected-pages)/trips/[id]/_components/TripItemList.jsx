'use client'

import { useTransition } from 'react'
import Table from '@/components/ui/Table'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Switcher from '@/components/ui/Switcher'
import { PiTrash } from 'react-icons/pi'
import { updateTripItem } from '@/server/actions/trips/updateTripItem'
import { removeItemFromTrip } from '@/server/actions/trips/removeItemFromTrip'
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

const TripItemRow = ({ tripItem, tripId, categoryMap }) => {
    const [isPending, startTransition] = useTransition()
    const item = tripItem.items

    const handleToggle = (field) => (checked) => {
        startTransition(async () => {
            await updateTripItem(tripItem.id, tripId, { [field]: checked })
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

    return (
        <Tr className={`group ${isPending ? 'opacity-50' : ''}`}>
            <Td>
                <CategoryBadge name={category?.name} color={category?.color} />
            </Td>
            <Td>
                <div>
                    <div className="font-medium">{item?.name || '—'}</div>
                    {item?.brand && (
                        <div className="text-sm text-gray-500">{item.brand}</div>
                    )}
                </div>
            </Td>
            <Td>
                <span className="text-gray-600 dark:text-gray-400">
                    {item?.description || '—'}
                </span>
            </Td>
            <Td className="text-right">{formatItemWeight(item?.weight, item?.weight_unit)}</Td>
            <Td className="text-right">
                <Input
                    type="number"
                    min="1"
                    value={tripItem.quantity}
                    onChange={handleQuantityChange}
                    className="w-14 text-right"
                    size="sm"
                />
            </Td>
            <Td className="text-center">
                <Switcher
                    checked={tripItem.is_worn}
                    onChange={handleToggle('is_worn')}
                    disabled={isPending}
                />
            </Td>
            <Td className="text-center">
                <Switcher
                    checked={tripItem.is_consumable}
                    onChange={handleToggle('is_consumable')}
                    disabled={isPending}
                />
            </Td>
            <Td>
                <button
                    onClick={handleRemove}
                    disabled={isPending}
                    className="p-1.5 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove from trip"
                >
                    <PiTrash size={18} />
                </button>
            </Td>
        </Tr>
    )
}

const TripItemList = ({ tripItems, tripId, categoryMap }) => {
    if (tripItems.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-medium">No items in this trip</p>
                <p className="text-sm">Add items from your inventory to get started</p>
            </div>
        )
    }

    return (
        <Table>
            <THead>
                <Tr>
                    <Th className="w-[140px]">Category</Th>
                    <Th className="w-[180px]">Item Name</Th>
                    <Th>Description</Th>
                    <Th className="w-[80px] text-right">Weight</Th>
                    <Th className="w-[70px] text-right">Qty</Th>
                    <Th className="w-[80px] text-center">Worn</Th>
                    <Th className="w-[80px] text-center">Cons.</Th>
                    <Th className="w-[50px]"></Th>
                </Tr>
            </THead>
            <TBody>
                {tripItems.map((tripItem) => (
                    <TripItemRow
                        key={tripItem.id}
                        tripItem={tripItem}
                        tripId={tripId}
                        categoryMap={categoryMap}
                    />
                ))}
            </TBody>
        </Table>
    )
}

export default TripItemList
