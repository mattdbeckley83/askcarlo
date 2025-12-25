'use client'

import { useState, useMemo, useTransition } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PiPencilSimple, PiCheck } from 'react-icons/pi'
import {
    calculateTripWeights,
    formatWeightForDisplay,
    litersToFlOz,
} from '@/lib/utils/weightCalculations'
import { updateTripWater } from '@/server/actions/trips/updateTripWater'

const waterUnitOptions = [
    { value: 'L', label: 'L' },
    { value: 'fl oz', label: 'fl oz' },
]

const WeightCard = ({ label, weight, color }) => (
    <Card>
        <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`text-2xl font-bold ${color || ''}`}>
                {formatWeightForDisplay(weight)}
            </span>
        </div>
    </Card>
)

const ConsumableWeightCard = ({
    weights,
    waterVolume,
    waterUnit,
    tripId,
    onWaterUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editVolume, setEditVolume] = useState('')
    const [editUnit, setEditUnit] = useState({ value: 'L', label: 'L' })
    const [isPending, startTransition] = useTransition()

    // Convert stored liters to display unit
    const displayVolume = useMemo(() => {
        if (!waterVolume || waterVolume <= 0) return 0
        if (waterUnit === 'fl oz') {
            return litersToFlOz(waterVolume)
        }
        return waterVolume
    }, [waterVolume, waterUnit])

    const handleEditClick = () => {
        setEditVolume(displayVolume > 0 ? displayVolume.toFixed(1) : '')
        setEditUnit(waterUnitOptions.find(opt => opt.value === waterUnit) || waterUnitOptions[0])
        setIsEditing(true)
    }

    const handleSave = () => {
        startTransition(async () => {
            const volume = parseFloat(editVolume) || 0
            const result = await updateTripWater(tripId, volume, editUnit.value)
            if (result.success) {
                onWaterUpdate?.(result.trip)
            }
            setIsEditing(false)
        })
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            setIsEditing(false)
        }
    }

    const formatWaterDisplay = () => {
        if (!waterVolume || waterVolume <= 0) return '0L'
        const vol = displayVolume
        const unitLabel = waterUnit === 'fl oz' ? 'fl oz' : 'L'
        return `${vol.toFixed(1)}${unitLabel}`
    }

    return (
        <Card>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">Consumable Weight</span>
                <span className="text-2xl font-bold text-amber-500">
                    {formatWeightForDisplay(weights.consumable)}
                </span>

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Items:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                            {formatWeightForDisplay(weights.consumableItems)}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500 dark:text-gray-400">Water:</span>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={editVolume}
                                    onChange={(e) => setEditVolume(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-16 text-right"
                                    size="sm"
                                    autoFocus
                                />
                                <Select
                                    size="sm"
                                    options={waterUnitOptions}
                                    value={editUnit}
                                    onChange={setEditUnit}
                                    isSearchable={false}
                                    className="w-20"
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={isPending}
                                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                >
                                    <PiCheck size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="text-gray-700 dark:text-gray-300">
                                    {formatWaterDisplay()}
                                    {weights.water > 0 && (
                                        <span className="text-gray-400 ml-1">
                                            ({formatWeightForDisplay(weights.water)})
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={handleEditClick}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Edit water"
                                >
                                    <PiPencilSimple size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

const WeightSummary = ({ tripItems, tripId, waterVolume, waterUnit, onWaterUpdate }) => {
    // Calculate weights including water
    const weights = useMemo(() => {
        return calculateTripWeights(tripItems, waterVolume || 0)
    }, [tripItems, waterVolume])

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <WeightCard
                    label="Total Weight"
                    weight={weights.total}
                />
                <WeightCard
                    label="Base Weight"
                    weight={weights.base}
                    color="text-primary"
                />
                <WeightCard
                    label="Worn Weight"
                    weight={weights.worn}
                    color="text-blue-500"
                />
                <ConsumableWeightCard
                    weights={weights}
                    waterVolume={waterVolume}
                    waterUnit={waterUnit}
                    tripId={tripId}
                    onWaterUpdate={onWaterUpdate}
                />
            </div>

            {tripItems.length === 0 && !waterVolume && (
                <p className="text-sm text-gray-500 text-center py-2">
                    Add items to see weight analytics
                </p>
            )}
        </div>
    )
}

export default WeightSummary
