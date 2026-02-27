'use client'

import { useState, useEffect } from 'react'
import { PiBackpack, PiMapTrifold, PiChatsCircle } from 'react-icons/pi'
import Card from '@/components/ui/Card'
import { getDashboardStats } from '@/server/actions/dashboard/getDashboardStats'

const StatCard = ({ label, value, icon, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-8 flex flex-col justify-between h-40`}>
        <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-gray-900">
                {label}
            </span>
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
        </div>
        <div className="text-6xl font-bold text-gray-900">
            {value ?? <span className="text-gray-400 text-4xl">—</span>}
        </div>
    </div>
)

export default function DashboardOverview() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        getDashboardStats().then(setStats)
    }, [])

    return (
        <Card>
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Total gear items"
                        value={stats?.totalItems}
                        bgColor="bg-sky-100"
                        icon={<PiBackpack className="w-6 h-6 text-white" />}
                    />
                    <StatCard
                        label="Total trips created"
                        value={stats?.totalTrips}
                        bgColor="bg-emerald-100"
                        icon={<PiMapTrifold className="w-6 h-6 text-white" />}
                    />
                    <StatCard
                        label="Total Carlo conversations"
                        value={stats?.totalConversations}
                        bgColor="bg-purple-100"
                        icon={<PiChatsCircle className="w-6 h-6 text-white" />}
                    />
                </div>
            </div>
        </Card>
    )
}
