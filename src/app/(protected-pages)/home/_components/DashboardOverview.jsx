'use client'

import { useState, useEffect } from 'react'
import { PiSparkle } from 'react-icons/pi'
import Card from '@/components/ui/Card'
import { getDashboardStats } from '@/server/actions/dashboard/getDashboardStats'

const StatCard = ({ label, value, icon, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-5 flex flex-col justify-between h-28`}>
        <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-gray-700">
                {label}
            </span>
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
        </div>
        <div className="text-3xl font-bold text-gray-900">
            {value ?? <span className="text-gray-400 text-2xl">—</span>}
        </div>
    </div>
)

export default function DashboardOverview() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        getDashboardStats().then(setStats)
    }, [])

    return (
        <div className="w-3/4">
            <Card>
                <div className="flex flex-col gap-4">
                    <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            label="Total gear items"
                            value={stats?.totalItems}
                            bgColor="bg-sky-100"
                            icon={<img src="/img/logo/backpack.png" alt="Gear" className="w-4 h-4 invert" />}
                        />
                        <StatCard
                            label="Total trips created"
                            value={stats?.totalTrips}
                            bgColor="bg-emerald-100"
                            icon={<img src="/img/logo/trips.png" alt="Trips" className="w-4 h-4 invert" />}
                        />
                        <StatCard
                            label="Total Carlo conversations"
                            value={stats?.totalConversations}
                            bgColor="bg-purple-100"
                            icon={<PiSparkle className="w-4 h-4 text-white" />}
                        />
                    </div>
                </div>
            </Card>
        </div>
    )
}
