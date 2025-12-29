'use client'

import { useMemo, useCallback } from 'react'
import { ResponsiveTreeMap } from '@nivo/treemap'
import {
    getWeightByCategory,
    formatWeightForDisplay,
} from '@/lib/utils/weightCalculations'

const WeightTreemap = ({ tripItems, categoryMap, waterVolume = 0, hoveredCategory, onCategoryHover }) => {
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

    // Create a color lookup function that uses each node's color from data
    const getNodeColor = useCallback((node) => {
        // Get the color from the node's data
        const nodeColor = node.data?.color || '#6b7280'

        // Dim non-hovered categories when one is highlighted from the list
        if (hoveredCategory && node.id !== hoveredCategory && node.id !== 'root') {
            return `${nodeColor}66` // Add transparency
        }
        return nodeColor
    }, [hoveredCategory])

    const handleMouseEnter = useCallback((node) => {
        // Filter out "root" node from hover interactions
        if (node.id && node.id !== 'root') {
            onCategoryHover?.(node.id)
        }
    }, [onCategoryHover])

    const handleMouseLeave = useCallback(() => {
        onCategoryHover?.(null)
    }, [onCategoryHover])

    if (!data || data.children.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-sm">Add items to see weight distribution</p>
            </div>
        )
    }

    return (
        <div className="h-full min-h-[280px]">
            <ResponsiveTreeMap
                data={data}
                identity="name"
                value="weight"
                valueFormat={(value) => formatWeightForDisplay(value)}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                enableLabel={false}
                enableParentLabel={false}
                colors={getNodeColor}
                nodeOpacity={1}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.3]],
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                tooltip={({ node }) => {
                    // Don't show tooltip for root node
                    if (node.id === 'root') return null
                    return (
                        <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: node.data?.color || node.color }}
                                />
                                <span className="font-medium">{node.id}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {formatWeightForDisplay(node.value)}
                            </div>
                        </div>
                    )
                }}
            />
        </div>
    )
}

export default WeightTreemap
