'use client'

import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PiUploadSimple, PiX, PiTrash } from 'react-icons/pi'
import { validateLighterpackCSV } from '@/server/actions/import/validateLighterpackCSV'
import { importLighterpackCSV } from '@/server/actions/import/importLighterpackCSV'

const { Tr, Th, Td, THead, TBody } = Table

const BATCH_SIZE = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const unitOptions = [
    { value: 'oz', label: 'oz' },
    { value: 'lb', label: 'lb' },
    { value: 'g', label: 'g' },
    { value: 'kg', label: 'kg' },
]

export default function ImportPage({ gearTypeId, existingCategories }) {
    const router = useRouter()
    const fileInputRef = useRef(null)

    const [stage, setStage] = useState('upload') // upload | draft | importing | success
    const [file, setFile] = useState(null)
    const [parseError, setParseError] = useState(null)

    // Editable draft rows
    const [draftRows, setDraftRows] = useState([])

    // Importing progress
    const [progress, setProgress] = useState({ current: 0, total: 0, currentName: '' })

    // Success data
    const [importResult, setImportResult] = useState(null)

    // Network/import error
    const [importError, setImportError] = useState(null)

    // Compute new categories live from draft rows
    const existingCategoryNames = useMemo(
        () => new Set(existingCategories.map((c) => c.name.toLowerCase())),
        [existingCategories]
    )

    const newCategories = useMemo(() => {
        return [
            ...new Set(
                draftRows
                    .filter((r) => r.category.trim())
                    .map((r) => r.category.trim())
                    .filter((cat) => !existingCategoryNames.has(cat.toLowerCase()))
            ),
        ]
    }, [draftRows, existingCategoryNames])

    // ── Draft row helpers ────────────────────────────────────────────────────────

    const updateRow = (id, field, value) => {
        setDraftRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        )
    }

    const deleteRow = (id) => {
        setDraftRows((prev) => prev.filter((row) => row.id !== id))
    }

    // ── File handling ────────────────────────────────────────────────────────────

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return

        setParseError(null)
        setDraftRows([])

        if (!selectedFile.name.endsWith('.csv')) {
            setParseError('Please upload a .csv file.')
            return
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setParseError('File is too large. Maximum size is 5MB.')
            return
        }

        setFile(selectedFile)

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                if (results.errors.length > 0) {
                    setParseError(`CSV parsing error: ${results.errors[0].message}`)
                    setFile(null)
                    return
                }

                const result = await validateLighterpackCSV(results.data, existingCategories)

                if (!result.valid) {
                    setParseError(
                        `Missing required columns: ${result.missingColumns.join(', ')}`
                    )
                    setFile(null)
                    return
                }

                if (result.totalItems === 0) {
                    setParseError(
                        'No valid items found in CSV. Make sure rows have Item Name, weight, and unit.'
                    )
                    setFile(null)
                    return
                }

                setDraftRows(
                    result.validRows.map((row, i) => ({
                        id: i,
                        name: row.name,
                        brand: row.brand || '',
                        category: row.category || '',
                        weight:
                            row.weight !== null && row.weight !== undefined
                                ? String(row.weight)
                                : '',
                        unit: row.unit || 'oz',
                        description: row.description || '',
                    }))
                )
                setStage('draft')
            },
            error: (err) => {
                setParseError(`Failed to read file: ${err.message}`)
                setFile(null)
            },
        })
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const dropped = e.dataTransfer.files?.[0]
        if (dropped) handleFileSelect(dropped)
    }

    const handleDragOver = (e) => e.preventDefault()

    const handleFileInputChange = (e) => {
        handleFileSelect(e.target.files?.[0])
    }

    const handleClear = () => {
        setFile(null)
        setParseError(null)
        setDraftRows([])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleCancel = () => {
        handleClear()
        setStage('upload')
    }

    const handleReset = () => {
        handleClear()
        setImportResult(null)
        setImportError(null)
        setProgress({ current: 0, total: 0, currentName: '' })
        setStage('upload')
    }

    // ── Import ───────────────────────────────────────────────────────────────────

    const handleImport = async () => {
        const rows = draftRows.filter((r) => r.name.trim())
        const total = rows.length
        if (total === 0) return

        setProgress({ current: 0, total, currentName: rows[0]?.name ?? '' })
        setStage('importing')
        setImportError(null)

        let allItemsCreated = 0
        let allCategoriesCreated = 0
        let allSkipped = 0
        let allErrors = 0

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE)

            setProgress({
                current: i + batch.length,
                total,
                currentName: batch[0]?.name ?? '',
            })

            const normalizedBatch = batch.map((r) => ({
                name: r.name.trim(),
                brand: r.brand.trim(),
                category: r.category.trim(),
                weight: r.weight !== '' ? parseFloat(r.weight) : null,
                unit: r.unit || 'oz',
                description: r.description.trim(),
            }))

            try {
                const result = await importLighterpackCSV(normalizedBatch, gearTypeId)

                if (!result.success) {
                    setImportError(result.error || 'Import failed. Please try again.')
                    return
                }

                allItemsCreated += result.itemsCreated
                allCategoriesCreated += result.categoriesCreated
                allSkipped += result.skipped
                allErrors += result.errors
            } catch (err) {
                console.error('Batch error:', err)
                allErrors += batch.length
            }
        }

        setImportResult({
            itemsCreated: allItemsCreated,
            categoriesCreated: allCategoriesCreated,
            skipped: allSkipped,
            errors: allErrors,
        })
        setStage('success')
    }

    // ── Upload stage ─────────────────────────────────────────────────────────────

    if (stage === 'upload') {
        return (
            <Card>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Import from Lighterpack
                </h1>
                <div className="mb-4 flex flex-col gap-4">
                    <div>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>
                                Open your list on{' '}
                                <a
                                    href="https://lighterpack.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-gray-900 dark:hover:text-gray-200"
                                >
                                    lighterpack.com
                                </a>
                            </li>
                            <li>Click the <strong>share icon</strong> at the top of the page</li>
                            <li>Select <strong>&quot;Export to CSV&quot;</strong></li>
                            <li>Upload the downloaded file below</li>
                        </ol>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Note that images and prices are not yet supported in Carlo. Also, the worn and consumable flags from Lighterpack are trip-level settings in Carlo. You&apos;ll set them when you add gear to a trip. Carlo separates your gear closet from your trip packing list, so you only configure those flags when they actually matter.
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#fe7f2d] transition-colors"
                    >
                        <PiUploadSimple className="w-10 h-10 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                            Drag and drop your CSV here, or{' '}
                            <span className="text-[#fe7f2d] font-medium">browse</span>
                        </p>
                        <p className="text-xs text-gray-400">.csv files only · max 5MB</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileInputChange}
                        />
                    </div>

                    {file && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{file.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleClear()
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <PiX className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {parseError && (
                        <Alert className="mt-4" type="danger" showIcon>
                            {parseError}
                        </Alert>
                    )}
                </div>
            </Card>
        )
    }

    // ── Draft stage (editable table) ─────────────────────────────────────────────

    if (stage === 'draft') {
        const validCount = draftRows.filter((r) => r.name.trim()).length

        return (
            <Card>
                <div className="flex justify-end gap-3 mb-4">
                    <Button variant="default" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                        onClick={handleImport}
                        disabled={validCount === 0}
                    >
                        Import {validCount} item{validCount !== 1 ? 's' : ''}
                    </Button>
                </div>

                {newCategories.length > 0 && (
                    <Alert className="mb-4" type="info" showIcon>
                        {newCategories.length} new{' '}
                        {newCategories.length === 1 ? 'category' : 'categories'} will be
                        created: {newCategories.join(', ')}
                    </Alert>
                )}

                {draftRows.length > 500 && (
                    <Alert className="mb-4" type="warning" showIcon>
                        Large import — this may take a moment.
                    </Alert>
                )}

                <div className="overflow-x-auto">
                    <Table overflow={false}>
                        <THead className="border-b border-gray-200 dark:border-gray-700">
                            <Tr>
                                <Th className="min-w-[150px]">Category</Th>
                                <Th className="min-w-[200px]">Item Name *</Th>
                                <Th className="min-w-[140px]">Brand</Th>
                                <Th>Description</Th>
                                <Th className="min-w-[30px]">Weight</Th>
                                <Th className="min-w-[75px]">Unit</Th>
                                <Th className="w-10" />
                            </Tr>
                        </THead>
                        <TBody>
                            {draftRows.map((row) => (
                                <Tr key={row.id}>
                                    <Td>
                                        <Input
                                            size="sm"
                                            value={row.category}
                                            onChange={(e) =>
                                                updateRow(row.id, 'category', e.target.value)
                                            }
                                            placeholder="Category"
                                        />
                                    </Td>
                                    <Td>
                                        <Input
                                            size="sm"
                                            value={row.name}
                                            onChange={(e) =>
                                                updateRow(row.id, 'name', e.target.value)
                                            }
                                            placeholder="Item name"
                                            invalid={!row.name.trim()}
                                        />
                                    </Td>
                                    <Td>
                                        <Input
                                            size="sm"
                                            value={row.brand}
                                            onChange={(e) =>
                                                updateRow(row.id, 'brand', e.target.value)
                                            }
                                            placeholder="Brand"
                                        />
                                    </Td>
                                    <Td>
                                        <Input
                                            size="sm"
                                            value={row.description}
                                            onChange={(e) =>
                                                updateRow(row.id, 'description', e.target.value)
                                            }
                                            placeholder="Notes..."
                                        />
                                    </Td>
                                    <Td>
                                        <Input
                                            size="sm"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={row.weight}
                                            onChange={(e) =>
                                                updateRow(row.id, 'weight', e.target.value)
                                            }
                                            placeholder="0"
                                        />
                                    </Td>
                                    <Td>
                                        <Select
                                            size="sm"
                                            options={unitOptions}
                                            value={
                                                unitOptions.find((o) => o.value === row.unit) ||
                                                unitOptions[0]
                                            }
                                            onChange={(opt) =>
                                                updateRow(row.id, 'unit', opt?.value || 'oz')
                                            }
                                            isSearchable={false}
                                        />
                                    </Td>
                                    <Td>
                                        <button
                                            onClick={() => deleteRow(row.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <PiTrash className="w-4 h-4" />
                                        </button>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </div>
            </Card>
        )
    }

    // ── Importing stage ──────────────────────────────────────────────────────────

    if (stage === 'importing') {
        const percent =
            progress.total > 0
                ? Math.round((progress.current / progress.total) * 100)
                : 0

        return (
            <Card>
                <div className="flex flex-col gap-4 py-4">
                    <p className="text-sm text-gray-500">
                        Importing item {progress.current} of {progress.total}
                        {progress.currentName ? `: ${progress.currentName}` : ''}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-[#fe7f2d] h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 text-right">{percent}%</p>

                    {importError && (
                        <Alert type="danger" showIcon>
                            {importError}
                            <div className="mt-2">
                                <Button size="sm" variant="default" onClick={handleCancel}>
                                    Go back
                                </Button>
                            </div>
                        </Alert>
                    )}
                </div>
            </Card>
        )
    }

    // ── Success stage ────────────────────────────────────────────────────────────

    if (stage === 'success' && importResult) {
        return (
            <Card>
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">
                        Successfully imported {importResult.itemsCreated} item
                        {importResult.itemsCreated !== 1 ? 's' : ''}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400">
                        {importResult.itemsCreated} item
                        {importResult.itemsCreated !== 1 ? 's' : ''} created
                        {importResult.categoriesCreated > 0
                            ? ` · ${importResult.categoriesCreated} categor${importResult.categoriesCreated !== 1 ? 'ies' : 'y'} created`
                            : ''}
                        {importResult.skipped > 0
                            ? ` · ${importResult.skipped} item${importResult.skipped !== 1 ? 's' : ''} skipped`
                            : ''}
                        {importResult.errors > 0
                            ? ` · ${importResult.errors} item${importResult.errors !== 1 ? 's' : ''} failed`
                            : ''}
                    </p>

                    {importResult.skipped > 0 && (
                        <Alert type="info" showIcon>
                            {importResult.skipped} duplicate item
                            {importResult.skipped !== 1 ? 's were' : ' was'} skipped because
                            {importResult.skipped !== 1
                                ? ' they already exist'
                                : ' it already exists'}{' '}
                            in your gear list.
                        </Alert>
                    )}

                    {importResult.errors > 0 && (
                        <Alert type="warning" showIcon>
                            {importResult.errors} item
                            {importResult.errors !== 1 ? 's' : ''} failed to import.
                        </Alert>
                    )}

                    <div className="flex gap-3 mt-2">
                        <Button
                            variant="solid"
                            className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                            onClick={() => router.push('/gear')}
                        >
                            View Gear
                        </Button>
                        <Button variant="default" onClick={handleReset}>
                            Import Another File
                        </Button>
                    </div>
                </div>
            </Card>
        )
    }

    return null
}
