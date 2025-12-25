'use client'

import Card from '@/components/ui/Card'
import { PiCalendar, PiMapTrifold } from 'react-icons/pi'
import Link from 'next/link'

export default function UpcomingTrips({ trips }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return null
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        })
    }

    const formatDateRange = (startDate, endDate) => {
        const start = formatDate(startDate)
        const end = formatDate(endDate)
        if (!start) return 'No date set'
        if (!end || startDate === endDate) return start
        return `${start} - ${end}`
    }

    const getDaysUntil = (startDate) => {
        if (!startDate) return null
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tripDate = new Date(startDate + 'T00:00:00')
        const diffTime = tripDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    return (
        <Card className="h-full">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Upcoming Trips
                    </h3>
                    <Link
                        href="/trips"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        View all
                    </Link>
                </div>
                {trips.length === 0 ? (
                    <div className="text-center py-6">
                        <PiMapTrifold className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No upcoming trips scheduled
                        </p>
                        <Link
                            href="/trips"
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                        >
                            Plan a trip
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {trips.map((trip) => {
                            const daysUntil = getDaysUntil(trip.start_date)
                            return (
                                <Link
                                    key={trip.id}
                                    href={`/trips/${trip.id}`}
                                    className="group"
                                >
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                            <PiCalendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {trip.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDateRange(trip.start_date, trip.end_date)}
                                                {trip.activities?.name && (
                                                    <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                                                        • {trip.activities.name}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        {daysUntil !== null && (
                                            <div className="flex-shrink-0 text-right">
                                                <span
                                                    className={`text-sm font-medium ${
                                                        daysUntil <= 7
                                                            ? 'text-orange-600 dark:text-orange-400'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {daysUntil === 0
                                                        ? 'Today!'
                                                        : daysUntil === 1
                                                          ? 'Tomorrow'
                                                          : `${daysUntil} days`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </Card>
    )
}
