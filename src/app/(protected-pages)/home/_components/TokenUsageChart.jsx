'use client'

import { useState, useEffect, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Chart from '@/components/shared/Chart'
import { getTokenUsageChart } from '@/server/actions/dashboard/getTokenUsageChart'

const INDIGO = '#818CF8' // indigo-400

export default function TokenUsageChart() {
    const [data, setData] = useState(null)

    useEffect(() => {
        getTokenUsageChart().then((result) => {
            if (result.success) setData(result)
        })
    }, [])

    const series = useMemo(() => {
        if (!data) return []
        return [
            { name: 'Carlo Chat', data: data.chatSeries },
            { name: 'Smart Fill', data: data.smartFillSeries },
        ]
    }, [data])

    const customOptions = useMemo(() => ({
        chart: {
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        colors: [INDIGO, INDIGO],
        plotOptions: {
            bar: {
                columnWidth: '70%',
                borderRadius: 4,
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
            labels: {
                style: { fontSize: '11px', colors: '#9ca3af' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { fontSize: '11px', colors: '#9ca3af' },
                formatter: (val) => Math.round(val).toLocaleString(),
            },
        },
        tooltip: {
            x: { show: false },
            y: {
                formatter: (val) => `${val.toLocaleString()} tokens`,
            },
        },
        legend: { show: false },
        fill: { opacity: 1 },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
    }), [data])

    const hasData = data && (data.chatSeries.some((v) => v > 0) || data.smartFillSeries.some((v) => v > 0))

    return (
        <div className="w-3/4">
            <Card>
                <div className="flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        Token Usage
                    </h2>

                    {!data ? (
                        <div className="h-[330px] flex items-center justify-center">
                            <span className="text-sm text-gray-400">Loading...</span>
                        </div>
                    ) : !hasData ? (
                        <div className="h-[330px] flex items-center justify-center">
                            <span className="text-sm text-gray-400">No usage data yet. Send a message to Carlo to get started.</span>
                        </div>
                    ) : (
                        <Chart
                            type="bar"
                            series={series}
                            customOptions={customOptions}
                            height={330}
                        />
                    )}
                </div>
            </Card>
        </div>
    )
}
