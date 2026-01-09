'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Segment from '@/components/ui/Segment'
import { PiPlus, PiTrash, PiPencil, PiChartPie, PiSquaresFour, PiCaretDown, PiCaretUp, PiArrowSquareOut, PiShareNetwork } from 'react-icons/pi'
import TripItemList from './TripItemList'
import AddItemToTripModal from './AddItemToTripModal'
import EditTripModal from './EditTripModal'
import DeleteTripDialog from './DeleteTripDialog'
import ShareTripModal from './ShareTripModal'
import WeightSummary from './WeightSummary'
import CategoryBreakdown from './CategoryBreakdown'
import WeightTreemap from './WeightTreemap'
import WeightPieChart from './WeightPieChart'

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

const TripDetail = ({
    trip,
    tripItems,
    activities,
    categories,
    itemTypes,
    userItems,
}) => {
    const router = useRouter()
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [chartView, setChartView] = useState('treemap')
    const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false)
    const [hoveredCategory, setHoveredCategory] = useState(null)

    // Water state - initialize from trip data
    const [waterVolume, setWaterVolume] = useState(trip.water_volume || 0)
    const [waterUnit, setWaterUnit] = useState(trip.water_unit || 'L')

    const activity = useMemo(() => {
        return activities.find((a) => a.id === trip.activity_id)
    }, [activities, trip.activity_id])

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat
            return acc
        }, {})
    }, [categories])

    const itemTypeMap = useMemo(() => {
        return itemTypes.reduce((acc, type) => {
            acc[type.id] = type
            return acc
        }, {})
    }, [itemTypes])

    // Filter out items already in trip
    const availableItems = useMemo(() => {
        const tripItemIds = new Set(tripItems.map((ti) => ti.item_id))
        return userItems.filter((item) => !tripItemIds.has(item.id))
    }, [userItems, tripItems])

    const handleDeleteSuccess = () => {
        router.push('/trips')
    }

    const handleWaterUpdate = (updatedTrip) => {
        setWaterVolume(updatedTrip.water_volume || 0)
        setWaterUnit(updatedTrip.water_unit || 'L')
    }

    // Check if we should show analytics charts (has items or has water)
    const hasAnalyticsData = tripItems.length > 0 || waterVolume > 0

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                {/* Row 1: Trip name + Edit/Delete */}
                <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold">{trip.name}</h1>
                    <div className="flex gap-2">
                        <Button
                            variant="plain"
                            icon={<PiShareNetwork />}
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            Share
                        </Button>
                        <Button
                            variant="plain"
                            icon={<PiPencil />}
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="plain"
                            icon={<PiTrash />}
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
                {/* Row 2: Activity/dates + Analytics toggle */}
                <div className="flex justify-between items-center">
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
                    {hasAnalyticsData && (
                        <button
                            onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
                            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
                        >
                            {isAnalyticsExpanded ? <PiCaretUp size={16} /> : <PiCaretDown size={16} />}
                            <span>{isAnalyticsExpanded ? 'Hide Analytics' : 'Show Analytics'}</span>
                        </button>
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
                                        waterVolume={waterVolume}
                                        hoveredCategory={hoveredCategory}
                                        onCategoryHover={setHoveredCategory}
                                    />
                                ) : (
                                    <WeightPieChart
                                        tripItems={tripItems}
                                        categoryMap={categoryMap}
                                        waterVolume={waterVolume}
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
                                waterVolume={waterVolume}
                                hoveredCategory={hoveredCategory}
                                onCategoryHover={setHoveredCategory}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Weight Summary - Always visible */}
            <WeightSummary
                tripItems={tripItems}
                tripId={trip.id}
                waterVolume={waterVolume}
                waterUnit={waterUnit}
                onWaterUpdate={handleWaterUpdate}
            />

            {/* Items Section */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Items</h2>
                    <Button
                        variant="solid"
                        size="sm"
                        icon={<PiPlus />}
                        onClick={() => setIsAddItemModalOpen(true)}
                        disabled={availableItems.length === 0}
                    >
                        Add Items
                    </Button>
                </div>
                <TripItemList
                    tripItems={tripItems}
                    tripId={trip.id}
                    categoryMap={categoryMap}
                />
            </Card>

            {/* Modals */}
            <AddItemToTripModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                tripId={trip.id}
                availableItems={availableItems}
                categoryMap={categoryMap}
            />

            <EditTripModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                trip={trip}
                activities={activities}
            />

            <DeleteTripDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                tripId={trip.id}
                tripName={trip.name}
                onSuccess={handleDeleteSuccess}
            />

            <ShareTripModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                tripId={trip.id}
                tripName={trip.name}
            />
        </div>
    )
}

export default TripDetail
