'use client'

import { useState, useMemo, useTransition, useRef, useEffect } from 'react'
import { PiPencilSimple, PiCheck, PiCaretDown, PiCaretUp } from 'react-icons/pi'
import {
    calculateTripWeights,
    formatWeightForDisplay,
    litersToFlOz,
} from '@/lib/utils/weightCalculations'
import { updateTripWater } from '@/server/actions/trips/updateTripWater'

const WeightSummary = ({ tripItems, tripId, waterVolume, waterUnit, onWaterUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editVolume, setEditVolume] = useState('')
    const [editUnit, setEditUnit] = useState({ value: 'L', label: 'L' })
    const [isPending, startTransition] = useTransition()
    const popoverRef = useRef(null)

    // Calculate weights including water
    const weights = useMemo(() => {
        return calculateTripWeights(tripItems, waterVolume || 0)
    }, [tripItems, waterVolume])

    // Convert stored liters to display unit
    const displayVolume = useMemo(() => {
        if (!waterVolume || waterVolume <= 0) return 0
        if (waterUnit === 'fl oz') {
            return litersToFlOz(waterVolume)
        }
        return waterVolume
    }, [waterVolume, waterUnit])

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsExpanded(false)
                setIsEditing(false)
            }
        }
        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isExpanded])

    const handleEditClick = () => {
        setEditVolume(displayVolume > 0 ? Math.round(displayVolume).toString() : '')
        setEditUnit({ value: waterUnit || 'L', label: waterUnit || 'L' })
        setIsEditing(true)
    }

    const handleSave = () => {
        startTransition(async () => {
            const volume = parseInt(editVolume, 10) || 0
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
        if (!waterVolume || waterVolume <= 0) return '0 L'
        const vol = Math.round(displayVolume)
        const unitLabel = waterUnit === 'fl oz' ? ' fl oz' : ' L'
        return `${vol}${unitLabel}`
    }

    if (tripItems.length === 0 && !waterVolume) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-6 py-4">
                <p className="text-sm text-gray-500 text-center">
                    Add items to see weight analytics
                </p>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {/* Total Weight */}
                <div className="flex flex-col items-center text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatWeightForDisplay(weights.total)}
                    </span>
                </div>

                {/* Base Weight */}
                <div className="flex flex-col items-center text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Base</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {formatWeightForDisplay(weights.base)}
                    </span>
                </div>

                {/* Worn Weight */}
                <div className="flex flex-col items-center text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Worn</span>
                    <span className="text-xl font-bold text-blue-500">
                        {formatWeightForDisplay(weights.worn)}
                    </span>
                </div>

                {/* Consumable Weight with Popover */}
                <div className="relative flex justify-center" ref={popoverRef}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Consumable</span>
                            <span className="text-xl font-bold text-amber-500">
                                {formatWeightForDisplay(weights.consumable)}
                            </span>
                        </div>
                        <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {isExpanded ? <PiCaretUp size={16} /> : <PiCaretDown size={16} />}
                        </span>
                    </button>

                    {/* Popover */}
                    {isExpanded && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Water:</span>

                                {isEditing ? (
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={editVolume}
                                                onChange={(e) => setEditVolume(e.target.value.replace(/\D/g, ''))}
                                                onKeyDown={handleKeyDown}
                                                className="w-16 px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                autoFocus
                                            />
                                            <select
                                                value={editUnit.value}
                                                onChange={(e) => setEditUnit({ value: e.target.value, label: e.target.value })}
                                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="L">L</option>
                                                <option value="fl oz">fl oz</option>
                                            </select>
                                            <button
                                                onClick={handleSave}
                                                disabled={isPending}
                                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                            >
                                                <PiCheck size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
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
                    )}
                </div>
            </div>
        </div>
    )
}

export default WeightSummary
