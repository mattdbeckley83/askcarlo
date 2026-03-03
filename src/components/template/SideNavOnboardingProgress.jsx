'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useTheme from '@/utils/hooks/useTheme'
import { getOnboardingStatus } from '@/server/actions/dashboard/getOnboardingStatus'

export default function SideNavOnboardingProgress() {
    const [status, setStatus] = useState(null)
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    useEffect(() => {
        getOnboardingStatus().then(setStatus)
    }, [])

    if (!status || sideNavCollapse) return null

    const steps = [
        status.hasCompletedProfile,
        status.hasAddedGear,
        status.hasAddedTrip,
        status.hasUsedCarlo,
    ]
    const completedCount = steps.filter(Boolean).length
    const total = steps.length

    if (completedCount === total) return null

    const progressPercent = Math.round((completedCount / total) * 100)

    return (
        <Link
            href="/home"
            className="block mx-4 mb-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Getting Started
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {completedCount}/{total}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                <div
                    className="bg-[#fe7f2d] h-1.5 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </Link>
    )
}
