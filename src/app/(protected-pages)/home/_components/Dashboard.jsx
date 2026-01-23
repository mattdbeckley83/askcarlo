'use client'

import OnboardingChecklist from './OnboardingChecklist'

export default function Dashboard({
    firstName,
    onboardingStatus,
}) {
    const isOnboardingComplete =
        onboardingStatus.hasAddedGear &&
        onboardingStatus.hasAddedTrip &&
        onboardingStatus.hasUsedCarlo &&
        onboardingStatus.hasCompletedProfile

    // Check if user has completed any tasks
    const hasCompletedAnyTask =
        onboardingStatus.hasAddedGear ||
        onboardingStatus.hasAddedTrip ||
        onboardingStatus.hasUsedCarlo ||
        onboardingStatus.hasCompletedProfile

    // Determine welcome message based on progress
    const welcomeMessage = hasCompletedAnyTask
        ? `Welcome back, ${firstName}`
        : `Welcome, ${firstName}! Let's get you started`

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {welcomeMessage}
                </h1>
            </div>

            {/* Getting Started Checklist - only show if not complete */}
            {!isOnboardingComplete && (
                <OnboardingChecklist onboardingStatus={onboardingStatus} />
            )}
        </div>
    )
}
