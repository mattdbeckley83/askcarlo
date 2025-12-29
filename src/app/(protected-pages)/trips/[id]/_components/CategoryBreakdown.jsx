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

    if (categoryData.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No category data available</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Weight by Category
            </h3>
            <div className="flex flex-col gap-1">
                {categoryData.map((item) => {
                    const isHovered = hoveredCategory === item.category
                    const isDimmed = hoveredCategory && !isHovered

                    return (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-150 cursor-pointer
                                ${isHovered
                                    ? 'bg-amber-50 dark:bg-amber-900/30 scale-[1.02] shadow-sm'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                                ${isDimmed ? 'opacity-50' : 'opacity-100'}
                            `}
                            onMouseEnter={() => handleMouseEnter(item.category)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className={`font-medium ${isHovered ? 'text-amber-900 dark:text-amber-100' : ''}`}>
                                    {item.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`${isHovered ? 'text-amber-800 dark:text-amber-200' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {formatWeightForDisplay(item.weight)}
                                </span>
                                <span className={`text-sm w-12 text-right ${isHovered ? 'text-amber-700 dark:text-amber-300' : 'text-gray-400'}`}>
                                    {item.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CategoryBreakdown
