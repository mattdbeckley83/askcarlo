'use client'

import { useMemo } from 'react'
import { ResponsiveTreeMap } from '@nivo/treemap'
import {
    getWeightByCategory,
    formatWeightForDisplay,
} from '@/lib/utils/weightCalculations'

const WeightTreemap = ({ tripItems, categoryMap, waterVolume = 0 }) => {
    const data = useMemo(() => {
        const categoryData = getWeightByCategory(tripItems, categoryMap, waterVolume)

        if (categoryData.length === 0) {
            return null
        }

        return {
            name: 'root',
            children: categoryData.map((item) => ({
                name: item.category,
                weight: item.weight,
                color: item.color,
            })),
        }
    }, [tripItems, categoryMap, waterVolume])

    const colors = useMemo(() => {
        if (!data?.children) return []
        return data.children.map((item) => item.color)
    }, [data])

    if (!data || data.children.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                <p className="text-sm">Add items to see weight distribution</p>
            </div>
        )
    }

    return (
        <div className="h-64">
            <ResponsiveTreeMap
                data={data}
                identity="name"
                value="weight"
                valueFormat={(value) => formatWeightForDisplay(value)}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                labelSkipSize={40}
                label={(node) => node.id}
                labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 3]],
                }}
                enableParentLabel={false}
                colors={colors}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.3]],
                }}
                tooltip={({ node }) => (
                    <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: node.color }}
                            />
                            <span className="font-medium">{node.id}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatWeightForDisplay(node.value)}
                        </div>
                    </div>
                )}
            />
        </div>
    )
}

export default WeightTreemap
