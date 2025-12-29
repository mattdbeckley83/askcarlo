'use client'

import { useMemo, useCallback } from 'react'
import { ResponsivePie } from '@nivo/pie'
import {
    getWeightByCategory,
    formatWeightForDisplay,
} from '@/lib/utils/weightCalculations'

const WeightPieChart = ({ tripItems, categoryMap, waterVolume = 0, hoveredCategory, onCategoryHover }) => {
    const data = useMemo(() => {
        const categoryData = getWeightByCategory(tripItems, categoryMap, waterVolume)

        return categoryData.map((item) => ({
            id: item.category,
            label: item.category,
            value: item.weight,
            color: item.color,
            percentage: item.percentage,
        }))
    }, [tripItems, categoryMap, waterVolume])

    // Create a color function that uses each datum's color from data
    const getSliceColor = useCallback((datum) => {
        const sliceColor = datum.data?.color || datum.color || '#6b7280'

        // Dim non-hovered categories when one is highlighted from the list
        if (hoveredCategory && datum.id !== hoveredCategory) {
            return `${sliceColor}66` // Add transparency
        }
        return sliceColor
    }, [hoveredCategory])

    const handleMouseEnter = useCallback((datum) => {
        onCategoryHover?.(datum.id)
    }, [onCategoryHover])

    const handleMouseLeave = useCallback(() => {
        onCategoryHover?.(null)
    }, [onCategoryHover])

    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-sm">Add items to see weight distribution</p>
            </div>
        )
    }

    return (
        <div className="h-full min-h-[280px]">
            <ResponsivePie
                data={data}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.5}
                padAngle={1}
                cornerRadius={4}
                activeOuterRadiusOffset={8}
                colors={getSliceColor}
                borderWidth={1}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.2]],
                }}
                enableArcLinkLabels={false}
                enableArcLabels={false}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                tooltip={({ datum }) => (
                    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: datum.data?.color || datum.color }}
                            />
                            <span className="font-medium">{datum.label}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatWeightForDisplay(datum.value)} ({datum.data.percentage.toFixed(1)}%)
                        </div>
                    </div>
                )}
            />
        </div>
    )
}

export default WeightPieChart
