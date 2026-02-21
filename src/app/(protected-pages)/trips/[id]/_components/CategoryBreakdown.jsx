'use client'

import { useMemo, useCallback } from 'react'
import {
    getWeightByCategory,
    formatWeightForDisplay,
} from '@/lib/utils/weightCalculations'

const CategoryBreakdown = ({ tripItems, categoryMap, waterVolume = 0, hoveredCategory, onCategoryHover }) => {
    const categoryData = useMemo(() => {
        return getWeightByCategory(tripItems, categoryMap, waterVolume)
    }, [tripItems, categoryMap, waterVolume])

    const handleMouseEnter = useCallback((category) => {
        onCategoryHover?.(category)
    }, [onCategoryHover])

    const handleMouseLeave = useCallback(() => {
        onCategoryHover?.(null)
    }, [onCategoryHover])

    // Split data into two columns (fill first column, then second)
    const midpoint = Math.ceil(categoryData.length / 2)
    const firstColumn = categoryData.slice(0, midpoint)
    const secondColumn = categoryData.slice(midpoint)

    if (categoryData.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No category data available</p>
            </div>
        )
    }

    const renderItem = (item) => {
        const isHovered = hoveredCategory === item.category
        const isDimmed = hoveredCategory && !isHovered

        return (
            <div
                key={item.id}
                className={`flex items-center justify-between py-1.5 px-2 rounded transition-all duration-150 cursor-pointer
                    ${isHovered
                        ? 'bg-amber-50 dark:bg-amber-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                    ${isDimmed ? 'opacity-40' : 'opacity-100'}
                `}
                onMouseEnter={() => handleMouseEnter(item.category)}
                onMouseLeave={handleMouseLeave}
            >
                <div className="flex items-center gap-1.5 min-w-0">
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className={`text-sm font-medium truncate ${isHovered ? 'text-amber-900 dark:text-amber-100' : ''}`}>
                        {item.category}
                    </span>
                </div>
                <span className={`text-sm ml-1 flex-shrink-0 ${isHovered ? 'text-amber-700 dark:text-amber-300' : 'text-gray-400'}`}>
                    {item.percentage.toFixed(0)}%
                </span>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 text-center">
                Weight by Category
            </h3>
            <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-0.5">
                    {firstColumn.map(renderItem)}
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                    {secondColumn.map(renderItem)}
                </div>
            </div>
        </div>
    )
}

export default CategoryBreakdown
