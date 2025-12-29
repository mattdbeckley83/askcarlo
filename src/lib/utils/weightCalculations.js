/**
 * Weight calculation utilities for trip analytics
 * All internal calculations use grams for consistency
 */

// Conversion constants (to grams)
const GRAMS_PER_OZ = 28.3495
const GRAMS_PER_LB = 453.592
const GRAMS_PER_KG = 1000
const GRAMS_PER_LITER_WATER = 1000 // 1 L water = 1 kg = 1000 g
const LITERS_PER_FL_OZ = 0.02957 // 1 fl oz = 0.02957 L

/**
 * Convert any weight unit to grams
 * @param {number} weight - The weight value
 * @param {string} unit - The unit (oz, lb, g, kg)
 * @returns {number} Weight in grams
 */
export function convertToGrams(weight, unit) {
    if (weight === null || weight === undefined) return 0

    const normalizedUnit = (unit || 'oz').toLowerCase()

    switch (normalizedUnit) {
        case 'oz':
            return weight * GRAMS_PER_OZ
        case 'lb':
            return weight * GRAMS_PER_LB
        case 'kg':
            return weight * GRAMS_PER_KG
        case 'g':
            return weight
        default:
            return weight * GRAMS_PER_OZ // default to oz
    }
}

/**
 * Convert grams to target unit
 * @param {number} grams - Weight in grams
 * @param {string} targetUnit - Target unit (oz, lb, g, kg)
 * @returns {number} Weight in target unit
 */
export function convertFromGrams(grams, targetUnit) {
    if (!grams) return 0

    const normalizedUnit = (targetUnit || 'oz').toLowerCase()

    switch (normalizedUnit) {
        case 'oz':
            return grams / GRAMS_PER_OZ
        case 'lb':
            return grams / GRAMS_PER_LB
        case 'kg':
            return grams / GRAMS_PER_KG
        case 'g':
            return grams
        default:
            return grams / GRAMS_PER_OZ
    }
}

/**
 * Get water weight in grams from volume in liters
 * @param {number} waterVolumeLiters - Water volume in liters
 * @returns {number} Weight in grams
 */
export function getWaterWeightInGrams(waterVolumeLiters) {
    if (!waterVolumeLiters || waterVolumeLiters <= 0) return 0
    return waterVolumeLiters * GRAMS_PER_LITER_WATER
}

/**
 * Convert fluid ounces to liters
 * @param {number} flOz - Volume in fluid ounces
 * @returns {number} Volume in liters
 */
export function flOzToLiters(flOz) {
    if (!flOz || flOz <= 0) return 0
    return flOz * LITERS_PER_FL_OZ
}

/**
 * Convert liters to fluid ounces
 * @param {number} liters - Volume in liters
 * @returns {number} Volume in fluid ounces
 */
export function litersToFlOz(liters) {
    if (!liters || liters <= 0) return 0
    return liters / LITERS_PER_FL_OZ
}

/**
 * Calculate all trip weight metrics
 * @param {Array} tripItems - Array of trip items with nested items data
 * @param {number} waterVolumeLiters - Water volume in liters (optional)
 * @returns {Object} { total, base, worn, consumable, consumableItems, water } all in grams
 */
export function calculateTripWeights(tripItems, waterVolumeLiters = 0) {
    const waterWeight = getWaterWeightInGrams(waterVolumeLiters)

    if (!tripItems || tripItems.length === 0) {
        return {
            total: waterWeight,
            base: 0,
            worn: 0,
            consumable: waterWeight,
            consumableItems: 0,
            water: waterWeight
        }
    }

    let total = 0
    let worn = 0
    let consumableItems = 0

    tripItems.forEach((tripItem) => {
        const item = tripItem.items
        if (!item || !item.weight) return

        const weightInGrams = convertToGrams(item.weight, item.weight_unit)
        const quantity = tripItem.quantity || 1
        const itemTotal = weightInGrams * quantity

        total += itemTotal

        if (tripItem.is_worn) {
            worn += itemTotal
        }

        if (tripItem.is_consumable) {
            consumableItems += itemTotal
        }
    })

    // Add water weight to total
    total += waterWeight

    // Consumable = items marked consumable + water
    const consumable = consumableItems + waterWeight

    // Base weight = Total - Worn - Consumable
    const base = total - worn - consumable

    return { total, base, worn, consumable, consumableItems, water: waterWeight }
}

/**
 * Format weight for display - standardized to lb with oz fallback for light items
 * @param {number} grams - Weight in grams
 * @returns {string} Formatted weight string (e.g., "3.2 lb" or "1.4 oz" for items < 0.1 lb)
 */
export function formatWeightForDisplay(grams) {
    if (!grams || grams === 0) return '0 lb'

    const lbs = grams / GRAMS_PER_LB

    // For very light items (< 0.1 lb), show in oz
    if (lbs < 0.1) {
        const oz = grams / GRAMS_PER_OZ
        return `${oz.toFixed(1)} oz`
    }

    return `${lbs.toFixed(1)} lb`
}

/**
 * Format weight for display with smart unit selection
 * @param {number} grams - Weight in grams
 * @param {string} preferredUnit - User's preferred unit (oz, lb, g, kg) or 'auto'
 * @returns {string} Formatted weight string (e.g., "3.2 lb" or "14.5 oz")
 * @deprecated Use formatWeightForDisplay() instead for standardized lb display
 */
export function formatWeight(grams, preferredUnit = 'auto') {
    if (!grams || grams === 0) return '0 oz'

    // Auto mode: show oz under 1 lb, lb otherwise
    if (preferredUnit === 'auto') {
        const lbs = grams / GRAMS_PER_LB
        if (lbs < 1) {
            const oz = grams / GRAMS_PER_OZ
            return `${oz.toFixed(1)} oz`
        }
        return `${lbs.toFixed(1)} lb`
    }

    const value = convertFromGrams(grams, preferredUnit)
    const normalizedUnit = preferredUnit.toLowerCase()

    // Format based on unit
    switch (normalizedUnit) {
        case 'oz':
            return `${value.toFixed(1)} oz`
        case 'lb':
            return `${value.toFixed(1)} lb`
        case 'g':
            return `${Math.round(value)} g`
        case 'kg':
            return `${value.toFixed(2)} kg`
        default:
            return `${value.toFixed(1)} oz`
    }
}

/**
 * Water category color constant
 */
export const WATER_CATEGORY_COLOR = '#147DF5' // Azure Blue

/**
 * Get weight breakdown by category
 * @param {Array} tripItems - Array of trip items with nested items data
 * @param {Object} categoryMap - Map of category_id to category object
 * @param {number} waterVolumeLiters - Water volume in liters (optional)
 * @returns {Array} Array of { id, category, color, weight, percentage }
 */
export function getWeightByCategory(tripItems, categoryMap, waterVolumeLiters = 0) {
    // Calculate total and per-category weights
    const categoryWeights = {}
    let totalWeight = 0

    if (tripItems && tripItems.length > 0) {
        tripItems.forEach((tripItem) => {
            const item = tripItem.items
            if (!item || !item.weight) return

            const weightInGrams = convertToGrams(item.weight, item.weight_unit)
            const quantity = tripItem.quantity || 1
            const itemWeight = weightInGrams * quantity

            totalWeight += itemWeight

            const categoryId = item.category_id || 'uncategorized'
            if (!categoryWeights[categoryId]) {
                categoryWeights[categoryId] = 0
            }
            categoryWeights[categoryId] += itemWeight
        })
    }

    // Add carried water weight if present (separate from "Water" gear category)
    const waterWeight = getWaterWeightInGrams(waterVolumeLiters)
    if (waterWeight > 0) {
        totalWeight += waterWeight
        categoryWeights['carried-water'] = waterWeight
    }

    if (totalWeight === 0) return []

    // Convert to array with category info
    return Object.entries(categoryWeights)
        .map(([categoryId, weight]) => {
            // Special handling for carried water (distinct from "Water" gear category)
            if (categoryId === 'carried-water') {
                return {
                    id: 'carried-water',
                    category: 'Carried Water',
                    color: WATER_CATEGORY_COLOR,
                    weight,
                    percentage: (weight / totalWeight) * 100,
                }
            }

            const category = categoryMap[categoryId]
            return {
                id: categoryId,
                category: category?.name || 'Uncategorized',
                color: category?.color || '#6b7280',
                weight,
                percentage: (weight / totalWeight) * 100,
            }
        })
        .sort((a, b) => b.weight - a.weight) // Sort by weight descending
}

/**
 * Get the preferred weight unit from localStorage
 * @returns {string} The preferred unit or 'lb'
 */
export function getPreferredUnit() {
    if (typeof window === 'undefined') return 'lb'
    return localStorage.getItem('preferredWeightUnit') || 'lb'
}

/**
 * Save the preferred weight unit to localStorage
 * @param {string} unit - The unit to save
 */
export function setPreferredUnit(unit) {
    if (typeof window === 'undefined') return
    localStorage.setItem('preferredWeightUnit', unit)
}
