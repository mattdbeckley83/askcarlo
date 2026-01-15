'use client'

import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress'
import { PiCheck } from 'react-icons/pi'
import Link from 'next/link'

export default function OnboardingChecklist({ onboardingStatus }) {
    const checklistItems = [
        {
            id: 'gear',
            label: 'Add your first gear item',
            description: 'Start building your gear inventory',
            completed: onboardingStatus.hasAddedGear,
            href: '/gear?action=add',
        },
        {
            id: 'trip',
            label: 'Create your first trip',
            description: 'Plan a trip and add gear to it',
            completed: onboardingStatus.hasAddedTrip,
            href: '/trips?action=add',
        },
        {
            id: 'carlo',
            label: 'Chat with Carlo',
            description: 'Get personalized advice from our AI assistant',
            completed: onboardingStatus.hasUsedCarlo,
            href: '/conversations',
        },
        {
            id: 'profile',
            label: 'Select your activities',
            description: 'Choose the outdoor activities you enjoy',
            completed: onboardingStatus.hasCompletedProfile,
            href: '/profile',
        },
    ]

    const completedCount = checklistItems.filter((item) => item.completed).length
    const progressPercent = Math.round((completedCount / checklistItems.length) * 100)

    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Getting Started
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {completedCount} of {checklistItems.length} complete
                    </span>
                </div>

                <Progress
                    percent={progressPercent}
                    size="sm"
                    showInfo={false}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {checklistItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`group ${item.completed ? 'pointer-events-none' : ''}`}
                        >
                            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                {/* Checkbox */}
                                <div className="flex-shrink-0 mt-0.5">
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                            item.completed
                                                ? 'bg-[#fe7f2d] border-[#fe7f2d]'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                        }`}
                                    >
                                        {item.completed && (
                                            <PiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                        )}
                                    </div>
                                </div>

                                {/* Task content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`font-medium ${
                                            item.completed
                                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                                : 'text-gray-900 dark:text-white'
                                        }`}
                                    >
                                        {item.label}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Card>
    )
}
