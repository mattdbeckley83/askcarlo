'use client'

import { useState, useEffect, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { getTokenUsageChart } from '@/server/actions/dashboard/getTokenUsageChart'

const TABS = ['All', 'Carlo Chat', 'Smart Fill']

// Soft, muted colors — indigo for Carlo, emerald for Smart Fill
const CHAT_COLOR = '#818CF8'
const SMART_FILL_COLOR = '#6EE7B7'

export default function TokenUsageChart() {
    const [data, setData] = useState(null)
    const [activeTab, setActiveTab] = useState('All')

    useEffect(() => {
        getTokenUsageChart().then((result) => {
            if (result.success) setData(result)
        })
    }, [])

    const { series, chartColors } = useMemo(() => {
        if (!data) return { series: [], chartColors: [] }

        if (activeTab === 'Carlo Chat') {
            return {
                series: [{ name: 'Carlo Chat', data: data.chatSeries }],
                chartColors: [CHAT_COLOR],
            }
        }
        if (activeTab === 'Smart Fill') {
            return {
                series: [{ name: 'Smart Fill', data: data.smartFillSeries }],
                chartColors: [SMART_FILL_COLOR],
            }
        }
        return {
            series: [
                { name: 'Carlo Chat', data: data.chatSeries },
                { name: 'Smart Fill', data: data.smartFillSeries },
            ],
            chartColors: [CHAT_COLOR, SMART_FILL_COLOR],
        }
    }, [data, activeTab])

    const customOptions = useMemo(() => ({
        chart: {
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        colors: chartColors,
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 3,
                borderRadiusApplication: 'end',
            },
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
        },
        xaxis: {
            categories: data?.dates || [],
            tickAmount: 6,
            labels: {
                style: { fontSize: '11px', colors: '#9ca3af' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { fontSize: '11px', colors: '#9ca3af' },
                formatter: (val) => Math.round(val),
            },
        },
        tooltip: {
            y: {
                formatter: (val) => `${val} tokens`,
            },
        },
        legend: {
            show: activeTab === 'All',
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '12px',
            markers: { size: 6, shape: 'circle' },
            itemMargin: { horizontal: 12 },
            fontFamily: 'inherit',
        },
        fill: { opacity: 1 },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
    }), [data, chartColors, activeTab])

    return (
        <div className="w-3/4">
            <Card>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                            Token Usage
                        </h2>
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                            {TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                        activeTab === tab
                                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {data ? (
                        <Chart
                            type="bar"
                            series={series}
                            customOptions={customOptions}
                            height={220}
                        />
                    ) : (
                        <div className="h-[220px] flex items-center justify-center">
                            <span className="text-sm text-gray-400">Loading...</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
