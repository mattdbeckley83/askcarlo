'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { PiMagnifyingGlass, PiPlus } from 'react-icons/pi'
import AddTripModal from './AddTripModal'

const { Tr, Th, Td, THead, TBody } = Table

const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return '—'
    if (startDate && !endDate) return formatDate(startDate)
    if (!startDate && endDate) return formatDate(endDate)
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

const TripList = ({ trips = [], activities = [] }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Open add modal if action=add is in URL
    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setIsAddModalOpen(true)
            // Clear the URL param
            router.replace('/trips', { scroll: false })
        }
    }, [searchParams, router])

    const activityMap = useMemo(() => {
        return activities.reduce((acc, activity) => {
            acc[activity.id] = activity
            return acc
        }, {})
    }, [activities])

    const filteredTrips = useMemo(() => {
        if (!searchQuery.trim()) return trips
        const query = searchQuery.toLowerCase()
        return trips.filter(
            (trip) =>
                trip.name?.toLowerCase().includes(query) ||
                trip.notes?.toLowerCase().includes(query) ||
                activityMap[trip.activity_id]?.name?.toLowerCase().includes(query)
        )
    }, [trips, searchQuery, activityMap])

    const handleRowClick = (trip) => {
        router.push(`/trips/${trip.id}`)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search trips..."
                        prefix={<PiMagnifyingGlass className="text-lg" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    variant="solid"
                    icon={<PiPlus />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    New Trip
                </Button>
            </div>

            <Card>
                <Table>
                    <THead>
                        <Tr>
                            <Th>Trip Name</Th>
                            <Th>Activity</Th>
                            <Th>Dates</Th>
                            <Th>Notes</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {filteredTrips.length === 0 ? (
                            <Tr>
                                <Td colSpan={4} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        {trips.length === 0 ? (
                                            <>
                                                <p className="text-lg font-medium">No trips yet</p>
                                                <p className="text-sm">Create your first trip to get started</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-lg font-medium">No results found</p>
                                                <p className="text-sm">Try adjusting your search</p>
                                            </>
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ) : (
                            filteredTrips.map((trip) => {
                                const activity = activityMap[trip.activity_id]
                                return (
                                    <Tr
                                        key={trip.id}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        onClick={() => handleRowClick(trip)}
                                    >
                                        <Td>
                                            <div className="font-medium">{trip.name}</div>
                                        </Td>
                                        <Td>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {activity?.name || '—'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {formatDateRange(trip.start_date, trip.end_date)}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span className="text-gray-600 dark:text-gray-400 line-clamp-1">
                                                {trip.notes || '—'}
                                            </span>
                                        </Td>
                                    </Tr>
                                )
                            })
                        )}
                    </TBody>
                </Table>
            </Card>

            <AddTripModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                activities={activities}
            />
        </div>
    )
}

export default TripList
