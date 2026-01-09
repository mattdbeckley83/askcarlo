'use client'

import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Segment from '@/components/ui/Segment'
import { PiChartPie, PiSquaresFour, PiCaretDown, PiCaretUp, PiArrowSquareOut, PiEye } from 'react-icons/pi'

const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const formatNumber = (num) => {
    if (num === null || num === undefined) return null
    return num.toLocaleString()
}

// Weight conversion helper
const convertToOz = (weight, unit) => {
    if (!weight) return 0
    switch (unit?.toLowerCase()) {
        case 'oz':
            return weight
        case 'lb':
            return weight * 16
        case 'g':
            return weight * 0.035274
        case 'kg':
            return weight * 35.274
        default:
            return weight
    }
}

const formatWeight = (oz) => {
    if (oz >= 16) {
        const lb = Math.floor(oz / 16)
        const remainingOz = (oz % 16).toFixed(1)
        return `${lb} lb ${remainingOz} oz`
    }
    return `${oz.toFixed(1)} oz`
}

// Simple treemap component for shared view
const SimpleTreemap = ({ tripItems, categoryMap }) => {
    const categoryData = useMemo(() => {
        const grouped = {}

        tripItems.forEach((tripItem) => {
            const item = tripItem.items
            if (!item) return

            const categoryId = item.category_id || 'uncategorized'
            const category = categoryMap[categoryId] || { name: 'Uncategorized', color: '#9CA3AF' }
            const weightOz = convertToOz(item.weight, item.weight_unit) * tripItem.quantity

            if (!grouped[categoryId]) {
                grouped[categoryId] = {
                    name: category.name,
                    color: category.color,
                    weight: 0,
                }
            }
            grouped[categoryId].weight += weightOz
        })

        return Object.values(grouped).sort((a, b) => b.weight - a.weight)
    }, [tripItems, categoryMap])

    const totalWeight = categoryData.reduce((sum, cat) => sum + cat.weight, 0)

    if (totalWeight === 0) return null

    return (
        <div className="flex flex-wrap gap-1">
            {categoryData.map((cat, i) => {
                const pct = (cat.weight / totalWeight) * 100
                return (
                    <div
                        key={i}
                        className="p-2 rounded text-white text-xs font-medium"
                        style={{
                            backgroundColor: cat.color,
                            width: `calc(${pct}% - 4px)`,
                            minWidth: '60px',
                        }}
                    >
                        <div className="truncate">{cat.name}</div>
                        <div>{formatWeight(cat.weight)}</div>
                    </div>
                )
            })}
        </div>
    )
}

// Simplified category breakdown
const SimpleCategoryBreakdown = ({ tripItems, categoryMap }) => {
    const categoryData = useMemo(() => {
        const grouped = {}

        tripItems.forEach((tripItem) => {
            const item = tripItem.items
            if (!item) return

            const categoryId = item.category_id || 'uncategorized'
            const category = categoryMap[categoryId] || { name: 'Uncategorized', color: '#9CA3AF' }
            const weightOz = convertToOz(item.weight, item.weight_unit) * tripItem.quantity

            if (!grouped[categoryId]) {
                grouped[categoryId] = {
                    name: category.name,
                    color: category.color,
                    weight: 0,
                }
            }
            grouped[categoryId].weight += weightOz
        })

        return Object.values(grouped).sort((a, b) => b.weight - a.weight)
    }, [tripItems, categoryMap])

    const totalWeight = categoryData.reduce((sum, cat) => sum + cat.weight, 0)

    return (
        <div className="space-y-2">
            {categoryData.map((cat, i) => {
                const pct = totalWeight > 0 ? (cat.weight / totalWeight) * 100 : 0
                return (
                    <div key={i} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                        />
                        <span className="flex-1 text-sm truncate">{cat.name}</span>
                        <span className="text-sm text-gray-500">{pct.toFixed(0)}%</span>
                        <span className="text-sm font-medium w-24 text-right">
                            {formatWeight(cat.weight)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// Simple item list for shared view
const SharedItemList = ({ tripItems, categoryMap }) => {
    const groupedItems = useMemo(() => {
        const groups = {}

        tripItems.forEach((tripItem) => {
            const item = tripItem.items
            if (!item) return

            const categoryId = item.category_id || 'uncategorized'
            const category = categoryMap[categoryId] || { name: 'Uncategorized', color: '#9CA3AF' }

            if (!groups[categoryId]) {
                groups[categoryId] = {
                    category,
                    items: [],
                }
            }
            groups[categoryId].items.push({ ...tripItem, item })
        })

        return Object.values(groups).sort((a, b) =>
            a.category.name.localeCompare(b.category.name)
        )
    }, [tripItems, categoryMap])

    if (tripItems.length === 0) {
        return (
            <p className="text-gray-500 text-center py-4">
                No items in this trip.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {groupedItems.map((group, i) => (
                <div key={i}>
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: group.category.color }}
                        />
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            {group.category.name}
                        </h3>
                    </div>
                    <div className="space-y-1 pl-5">
                        {group.items.map((tripItem, j) => (
                            <div
                                key={j}
                                className="flex items-center justify-between text-sm py-1"
                            >
                                <div className="flex items-center gap-2">
                                    <span>{tripItem.item.name}</span>
                                    {tripItem.item.brand && (
                                        <span className="text-gray-400">
                                            ({tripItem.item.brand})
                                        </span>
                                    )}
                                    {tripItem.quantity > 1 && (
                                        <span className="text-gray-500">
                                            ×{tripItem.quantity}
                                        </span>
                                    )}
                                    {tripItem.is_worn && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                            worn
                                        </span>
                                    )}
                                    {tripItem.is_consumable && (
                                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                            consumable
                                        </span>
                                    )}
                                </div>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {tripItem.item.weight} {tripItem.item.weight_unit}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

const SharedTripDetail = ({ trip, tripItems, categories, activity }) => {
    const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true)

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat
            return acc
        }, {})
    }, [categories])

    // Calculate weight summary
    const weightSummary = useMemo(() => {
        let totalOz = 0
        let consumableOz = 0
        let wornOz = 0

        tripItems.forEach((tripItem) => {
            const item = tripItem.items
            if (!item || !item.weight) return

            const weightOz = convertToOz(item.weight, item.weight_unit) * tripItem.quantity
            totalOz += weightOz

            if (tripItem.is_consumable) consumableOz += weightOz
            if (tripItem.is_worn) wornOz += weightOz
        })

        // Add water weight if present
        if (trip.water_volume && trip.water_unit) {
            const waterOz = trip.water_unit === 'L'
                ? trip.water_volume * 33.814 * 1.043 // liters to oz weight
                : trip.water_volume * 1.043 // oz to oz weight
            totalOz += waterOz
            consumableOz += waterOz
        }

        const baseOz = totalOz - consumableOz - wornOz

        return { totalOz, baseOz, consumableOz, wornOz }
    }, [tripItems, trip.water_volume, trip.water_unit])

    const hasAnalyticsData = tripItems.length > 0 || (trip.water_volume && trip.water_volume > 0)

    return (
        <div className="flex flex-col gap-6">
            {/* Shared Trip Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <PiEye className="text-lg" />
                    <span className="font-medium">You're viewing a shared trip</span>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{trip.name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-500">
                    {activity && <span>{activity.name}</span>}
                    {(trip.start_date || trip.end_date) && (
                        <span>
                            {formatDate(trip.start_date)}
                            {trip.start_date && trip.end_date && ' - '}
                            {trip.end_date && formatDate(trip.end_date)}
                        </span>
                    )}
                </div>

                {/* Notes */}
                {trip.notes && (
                    <p className="text-gray-600 dark:text-gray-400">
                        {trip.notes}
                    </p>
                )}

                {/* Trail Metrics */}
                {(trip.distance_miles || trip.total_ascent_ft || trip.total_descent_ft || trip.max_elevation_ft || trip.min_elevation_ft || trip.trail_url) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        {trip.distance_miles && (
                            <span>{trip.distance_miles} mi</span>
                        )}
                        {trip.total_ascent_ft && (
                            <span>{formatNumber(trip.total_ascent_ft)} ft ↑</span>
                        )}
                        {trip.total_descent_ft && (
                            <span>{formatNumber(trip.total_descent_ft)} ft ↓</span>
                        )}
                        {trip.max_elevation_ft && (
                            <span>{formatNumber(trip.max_elevation_ft)}' max</span>
                        )}
                        {trip.min_elevation_ft && (
                            <span>{formatNumber(trip.min_elevation_ft)}' min</span>
                        )}
                        {trip.trail_url && (
                            <a
                                href={trip.trail_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                Trail Link <PiArrowSquareOut size={14} />
                            </a>
                        )}
                    </div>
                )}

                {/* Analytics Toggle */}
                {hasAnalyticsData && (
                    <button
                        onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm self-start mt-2"
                    >
                        {isAnalyticsExpanded ? <PiCaretUp size={16} /> : <PiCaretDown size={16} />}
                        <span>{isAnalyticsExpanded ? 'Hide Analytics' : 'Show Analytics'}</span>
                    </button>
                )}
            </div>

            {/* Analytics Charts - Collapsible */}
            {isAnalyticsExpanded && hasAnalyticsData && (
                <Card>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-[70%]">
                            <h3 className="font-medium mb-4">Weight Distribution</h3>
                            <SimpleTreemap
                                tripItems={tripItems}
                                categoryMap={categoryMap}
                            />
                        </div>
                        <div className="lg:w-[30%]">
                            <h3 className="font-medium mb-4">Category Breakdown</h3>
                            <SimpleCategoryBreakdown
                                tripItems={tripItems}
                                categoryMap={categoryMap}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Weight Summary */}
            <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Total Weight</p>
                        <p className="text-xl font-bold">{formatWeight(weightSummary.totalOz)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Base Weight</p>
                        <p className="text-xl font-bold text-blue-600">{formatWeight(weightSummary.baseOz)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Worn Weight</p>
                        <p className="text-xl font-bold text-purple-600">{formatWeight(weightSummary.wornOz)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Consumable</p>
                        <p className="text-xl font-bold text-green-600">{formatWeight(weightSummary.consumableOz)}</p>
                    </div>
                </div>
                {trip.water_volume > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Includes {trip.water_volume} {trip.water_unit} water
                    </p>
                )}
            </Card>

            {/* Items Section */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">Items</h2>
                <SharedItemList
                    tripItems={tripItems}
                    categoryMap={categoryMap}
                />
            </Card>
        </div>
    )
}

export default SharedTripDetail
