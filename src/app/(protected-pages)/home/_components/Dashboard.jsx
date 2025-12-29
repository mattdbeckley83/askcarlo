'use client'

import QuickStats from './QuickStats'
import UpcomingTrips from './UpcomingTrips'
import QuickActions from './QuickActions'
import OnboardingChecklist from './OnboardingChecklist'

export default function Dashboard({
    firstName,
    itemsCount,
    tripsCount,
    upcomingTrips,
    onboardingStatus,
}) {
    const isOnboardingComplete =
        onboardingStatus.hasAddedGear &&
        onboardingStatus.hasAddedTrip &&
        onboardingStatus.hasUsedCarlo &&
        onboardingStatus.hasCompletedProfile

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {firstName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Here's what's happening with your gear and trips
                </p>
            </div>

            {/* Getting Started Checklist - only show if not complete */}
            {!isOnboardingComplete && (
                <OnboardingChecklist onboardingStatus={onboardingStatus} />
            )}

            {/* Stats and Upcoming Trips Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <QuickStats itemsCount={itemsCount} tripsCount={tripsCount} />
                </div>
                <div className="lg:col-span-2">
                    <UpcomingTrips trips={upcomingTrips} />
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActions />
        </div>
    )
}
