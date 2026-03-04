'use server'

const VALID_UNITS = ['oz', 'g', 'lb', 'kg']

function normalizeUnit(unit) {
    if (!unit) return null
    const lower = unit.toLowerCase().trim()
    switch (lower) {
        case 'oz':
        case 'ounce':
        case 'ounces':
            return 'oz'
        case 'g':
        case 'gram':
        case 'grams':
            return 'g'
        case 'lb':
        case 'lbs':
        case 'pound':
        case 'pounds':
            return 'lb'
        case 'kg':
        case 'kilogram':
        case 'kilograms':
            return 'kg'
        default:
            return null
    }
}

export async function validateLighterpackCSV(rows, existingCategories = []) {
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return { valid: false, missingColumns: ['Item Name', 'weight', 'unit'] }
    }

    // Check required columns exist in first row's keys
    const firstRow = rows[0]
    const rowKeys = Object.keys(firstRow)
    const requiredColumns = ['Item Name', 'weight', 'unit']
    const missingColumns = requiredColumns.filter(
        (col) => !rowKeys.includes(col)
    )

    if (missingColumns.length > 0) {
        return { valid: false, missingColumns }
    }

    const existingCategoryNames = new Set(
        existingCategories.map((c) => c.name.toLowerCase())
    )

    const validRows = []
    let invalidRows = 0

    for (const row of rows) {
        const name = row['Item Name']?.trim()
        const weight = row['weight']
        const unit = normalizeUnit(row['unit'])

        // Row must have name, weight, and a valid unit
        if (!name || weight === undefined || weight === '' || !unit) {
            invalidRows++
            continue
        }

        validRows.push({
            name,
            brand: row['brand']?.trim() || '',
            category: row['Category']?.trim() || '',
            weight: parseFloat(weight),
            unit,
            description: row['desc']?.trim() || '',
        })
    }

    const preview = validRows.slice(0, 10).map((r) => ({
        name: r.name,
        category: r.category,
        weight: r.weight,
        unit: r.unit,
    }))

    const newCategories = [
        ...new Set(
            validRows
                .filter((r) => r.category)
                .map((r) => r.category)
                .filter((cat) => !existingCategoryNames.has(cat.toLowerCase()))
        ),
    ]

    return {
        valid: true,
        totalItems: validRows.length,
        preview,
        newCategories,
        invalidRows,
        validRows,
    }
}
