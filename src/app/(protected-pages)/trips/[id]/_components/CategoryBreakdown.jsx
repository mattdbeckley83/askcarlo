'use client'

import { useMemo } from 'react'
import {
    getWeightByCategory,
    formatWeightForDisplay,
} from '@/lib/utils/weightCalculations'

const CategoryBreakdown = ({ tripItems, categoryMap, waterVolume = 0 }) => {
    const categoryData = useMemo(() => {
        return getWeightByCategory(tripItems, categoryMap, waterVolume)
    }, [tripItems, categoryMap, waterVolume])

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
                {categoryData.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 dark:text-gray-400">
                                {formatWeightForDisplay(item.weight)}
                            </span>
                            <span className="text-sm text-gray-400 w-12 text-right">
                                {item.percentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CategoryBreakdown
