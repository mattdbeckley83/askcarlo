'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { PiTrash, PiPencil, PiArrowSquareOut, PiShareNetwork, PiCaretUp, PiCaretDown } from 'react-icons/pi'
import TripItemList from './TripItemList'
import AddItemToTripModal from './AddItemToTripModal'
import EditTripModal from './EditTripModal'
import DeleteTripDialog from './DeleteTripDialog'
import ShareTripModal from './ShareTripModal'
import WeightSummary from './WeightSummary'
import CategoryBreakdown from './CategoryBreakdown'
import WeightTreemap from './WeightTreemap'

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
    const [hoveredCategory, setHoveredCategory] = useState(null)
    const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(true)

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
                {/* Row 2: All trip details on single line + analytics toggle */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap min-w-0">
                        {activity && <span>{activity.name}</span>}
                        {activity && (trip.start_date || trip.end_date || trip.notes || trip.distance_miles) && <span>•</span>}
                        {(trip.start_date || trip.end_date) && (
                            <span>
                                {formatDate(trip.start_date)}
                                {trip.start_date && trip.end_date && ' - '}
                                {trip.end_date && formatDate(trip.end_date)}
                            </span>
                        )}
                        {(trip.start_date || trip.end_date) && (trip.notes || trip.distance_miles) && <span>•</span>}
                        {trip.distance_miles && <span>{trip.distance_miles} mi</span>}
                        {trip.total_ascent_ft && <span>{formatNumber(trip.total_ascent_ft)} ft ↑</span>}
                        {trip.total_descent_ft && <span>{formatNumber(trip.total_descent_ft)} ft ↓</span>}
                        {trip.max_elevation_ft && <span>{formatNumber(trip.max_elevation_ft)}' max</span>}
                        {trip.min_elevation_ft && <span>{formatNumber(trip.min_elevation_ft)}' min</span>}
                        {(trip.distance_miles || trip.total_ascent_ft || trip.total_descent_ft || trip.max_elevation_ft || trip.min_elevation_ft) && trip.notes && <span>•</span>}
                        {trip.notes && <span className="truncate">{trip.notes}</span>}
                        {trip.trail_url && (
                            <a
                                href={trip.trail_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                            >
                                Trail <PiArrowSquareOut size={14} />
                            </a>
                        )}
                    </div>
                    <button
                        onClick={() => setIsAnalyticsVisible(!isAnalyticsVisible)}
                        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                    >
                        <span>{isAnalyticsVisible ? 'Hide Analytics' : 'Show Analytics'}</span>
                        {isAnalyticsVisible ? <PiCaretUp size={14} /> : <PiCaretDown size={14} />}
                    </button>
                </div>
            </div>

            {/* Analytics section (charts + weight summary) */}
            {isAnalyticsVisible && (
                <>
                    {/* Analytics Charts */}
                    {hasAnalyticsData && (
                        <Card>
                            <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
                                <div className="lg:w-[65%]">
                                    <div className="h-[360px]">
                                        <WeightTreemap
                                            tripItems={tripItems}
                                            categoryMap={categoryMap}
                                            waterVolume={waterVolume}
                                            hoveredCategory={hoveredCategory}
                                            onCategoryHover={setHoveredCategory}
                                        />
                                    </div>
                                </div>
                                <div className="lg:w-[35%]">
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

                    {/* Weight Summary - below charts */}
                    <WeightSummary
                        tripItems={tripItems}
                        tripId={trip.id}
                        waterVolume={waterVolume}
                        waterUnit={waterUnit}
                        onWaterUpdate={handleWaterUpdate}
                    />
                </>
            )}

            {/* Items Section */}
            <Card>
                <TripItemList
                    tripItems={tripItems}
                    tripId={trip.id}
                    categoryMap={categoryMap}
                    onAddItem={() => setIsAddItemModalOpen(true)}
                    addItemDisabled={availableItems.length === 0}
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
