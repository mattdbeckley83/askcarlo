'use client'

import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Segment from '@/components/ui/Segment'
import { PiCaretDown, PiCaretUp, PiArrowSquareOut, PiEye, PiChartPie, PiSquaresFour } from 'react-icons/pi'
import {
    calculateTripWeights,
    formatWeightForDisplay,
    litersToFlOz,
    convertToGrams,
} from '@/lib/utils/weightCalculations'
// Import the same chart components used in the protected trip detail page
import WeightTreemap from '@/app/(protected-pages)/trips/[id]/_components/WeightTreemap'
import WeightPieChart from '@/app/(protected-pages)/trips/[id]/_components/WeightPieChart'
import CategoryBreakdown from '@/app/(protected-pages)/trips/[id]/_components/CategoryBreakdown'

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


// Item list sorted by weight
const SharedItemList = ({ tripItems, categoryMap }) => {
    const groupedItems = useMemo(() => {
        const groups = {}

        tripItems.forEach((tripItem) => {
            const item = tripItem.items
            if (!item) return

            const categoryId = item.category_id || 'uncategorized'
            const category = categoryMap[categoryId] || { name: 'Uncategorized', color: '#9CA3AF' }
            const itemWeightGrams = convertToGrams(item.weight, item.weight_unit) * (tripItem.quantity || 1)

            if (!groups[categoryId]) {
                groups[categoryId] = {
                    category,
                    items: [],
                    totalWeight: 0,
                }
            }
            groups[categoryId].items.push({ ...tripItem, item, weightGrams: itemWeightGrams })
            groups[categoryId].totalWeight += itemWeightGrams
        })

        // Sort categories by total weight (heaviest first)
        const sortedGroups = Object.values(groups).sort((a, b) => b.totalWeight - a.totalWeight)

        // Sort items within each category by weight (heaviest first)
        sortedGroups.forEach(group => {
            group.items.sort((a, b) => b.weightGrams - a.weightGrams)
        })

        return sortedGroups
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
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: group.category.color }}
                            />
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">
                                {group.category.name}
                            </h3>
                        </div>
                        <span className="text-sm text-gray-500">
                            {formatWeightForDisplay(group.totalWeight)}
                        </span>
                    </div>
                    <div className="space-y-1 pl-5">
                        {group.items.map((tripItem, j) => (
                            <div
                                key={j}
                                className="flex items-center justify-between text-sm py-1"
                            >
                                <div className="flex items-center gap-2 flex-wrap">
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
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                            worn
                                        </span>
                                    )}
                                    {tripItem.is_consumable && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                                            consumable
                                        </span>
                                    )}
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">
                                    {formatWeightForDisplay(tripItem.weightGrams)}
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
    const [chartView, setChartView] = useState('treemap')
    const [hoveredCategory, setHoveredCategory] = useState(null)

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat
            return acc
        }, {})
    }, [categories])

    // Calculate weight summary using proper utilities
    // Note: water_volume is stored in LITERS, water_unit is the display preference
    const weights = useMemo(() => {
        return calculateTripWeights(tripItems, trip.water_volume || 0)
    }, [tripItems, trip.water_volume])

    // Format water display with both volume AND weight
    const waterDisplay = useMemo(() => {
        if (!trip.water_volume || trip.water_volume <= 0) return null

        // water_volume is stored in liters
        // water_unit is the user's preferred display unit ('L' or 'fl oz')
        const volumeLiters = trip.water_volume
        const displayUnit = trip.water_unit || 'L'

        let volumeStr
        if (displayUnit === 'fl oz') {
            const flOz = litersToFlOz(volumeLiters)
            volumeStr = `${flOz.toFixed(1)} fl oz`
        } else {
            volumeStr = `${volumeLiters.toFixed(1)} L`
        }

        // Weight: 1 L water = 1 kg = 2.205 lb
        const weightLb = volumeLiters * 2.205
        const weightStr = `${weightLb.toFixed(1)} lb`

        return `${volumeStr} (${weightStr})`
    }, [trip.water_volume, trip.water_unit])

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
                        <div className="lg:w-[70%] flex flex-col gap-4">
                            <Segment
                                value={chartView}
                                onChange={(val) => setChartView(val)}
                                size="sm"
                                className="self-start"
                            >
                                <Segment.Item value="treemap">
                                    <span className="flex items-center gap-1">
                                        <PiSquaresFour />
                                        <span className="hidden sm:inline">Treemap</span>
                                    </span>
                                </Segment.Item>
                                <Segment.Item value="pie">
                                    <span className="flex items-center gap-1">
                                        <PiChartPie />
                                        <span className="hidden sm:inline">Donut</span>
                                    </span>
                                </Segment.Item>
                            </Segment>
                            <div className="flex-1 min-h-[320px]">
                                {chartView === 'treemap' ? (
                                    <WeightTreemap
                                        tripItems={tripItems}
                                        categoryMap={categoryMap}
                                        waterVolume={trip.water_volume || 0}
                                        hoveredCategory={hoveredCategory}
                                        onCategoryHover={setHoveredCategory}
                                    />
                                ) : (
                                    <WeightPieChart
                                        tripItems={tripItems}
                                        categoryMap={categoryMap}
                                        waterVolume={trip.water_volume || 0}
                                        hoveredCategory={hoveredCategory}
                                        onCategoryHover={setHoveredCategory}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="lg:w-[30%]">
                            <CategoryBreakdown
                                tripItems={tripItems}
                                categoryMap={categoryMap}
                                waterVolume={trip.water_volume || 0}
                                hoveredCategory={hoveredCategory}
                                onCategoryHover={setHoveredCategory}
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
                        <p className="text-xl font-bold">{formatWeightForDisplay(weights.total)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Base Weight</p>
                        <p className="text-xl font-bold text-indigo-600">{formatWeightForDisplay(weights.base)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Worn Weight</p>
                        <p className="text-xl font-bold text-blue-500">{formatWeightForDisplay(weights.worn)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">Consumable</p>
                        <p className="text-xl font-bold text-amber-500">{formatWeightForDisplay(weights.consumable)}</p>
                    </div>
                </div>
                {waterDisplay && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Includes {waterDisplay} water
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
