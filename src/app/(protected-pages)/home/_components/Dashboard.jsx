'use client'

import OnboardingChecklist from './OnboardingChecklist'
import DashboardOverview from './DashboardOverview'

export default function Dashboard({ onboardingStatus }) {
    const isOnboardingComplete =
        onboardingStatus.hasAddedGear &&
        onboardingStatus.hasAddedTrip &&
        onboardingStatus.hasUsedCarlo &&
        onboardingStatus.hasCompletedProfile

    return (
        <div className="flex flex-col gap-6">
            {/* Getting Started Checklist - only show if not complete */}
            {!isOnboardingComplete && (
                <OnboardingChecklist onboardingStatus={onboardingStatus} />
            )}

            {/* Dashboard Overview - only show once onboarding is complete */}
            {isOnboardingComplete && (
                <DashboardOverview />
            )}
        </div>
    )
}
