'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Table from '@/components/ui/Table'
import { PiUploadSimple, PiX } from 'react-icons/pi'
import { validateLighterpackCSV } from '@/server/actions/import/validateLighterpackCSV'
import { importLighterpackCSV } from '@/server/actions/import/importLighterpackCSV'

const { Tr, Th, Td, THead, TBody } = Table

const BATCH_SIZE = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function ImportPage({ gearTypeId, existingCategories }) {
    const router = useRouter()
    const fileInputRef = useRef(null)

    const [stage, setStage] = useState('upload') // upload | preview | importing | success
    const [file, setFile] = useState(null)
    const [parseError, setParseError] = useState(null)

    // Preview data
    const [validationResult, setValidationResult] = useState(null)

    // Importing progress
    const [progress, setProgress] = useState({ current: 0, total: 0, currentName: '' })

    // Success data
    const [importResult, setImportResult] = useState(null)

    // Network/import error
    const [importError, setImportError] = useState(null)

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return

        setParseError(null)
        setValidationResult(null)

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
                    setParseError('No valid items found in CSV. Make sure rows have Item Name, weight, and unit.')
                    setFile(null)
                    return
                }

                setValidationResult(result)
                setStage('preview')
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
        setValidationResult(null)
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

    const handleImport = async () => {
        const rows = validationResult.validRows
        const total = rows.length
        setProgress({ current: 0, total, currentName: rows[0]?.name ?? '' })
        setStage('importing')
        setImportError(null)

        let allItemsCreated = 0
        let allCategoriesCreated = 0
        let allSkipped = 0
        let allErrors = 0
        let firstBatch = true

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE)
            const nextItem = rows[i + BATCH_SIZE]

            setProgress({
                current: Math.min(i + BATCH_SIZE, total),
                total,
                currentName: batch[0]?.name ?? '',
            })

            try {
                const result = await importLighterpackCSV(batch, gearTypeId)

                if (!result.success) {
                    // Fatal error — stop and show error
                    setImportError(result.error || 'Import failed. Please try again.')
                    return
                }

                allItemsCreated += result.itemsCreated
                allSkipped += result.skipped
                allErrors += result.errors

                if (firstBatch) {
                    allCategoriesCreated = result.categoriesCreated
                    firstBatch = false
                }
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

    // ── Upload stage ────────────────────────────────────────────────────────────

    if (stage === 'upload') {
        return (
            <div className="flex flex-col gap-6">
                {/* Instructions */}
                <Card>
                    <h2 className="text-lg font-semibold mb-3">
                        How to export from Lighterpack
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Go to your list on <a href="https://lighterpack.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900 dark:hover:text-gray-200">lighterpack.com</a></li>
                        <li>Click the menu icon (three dots) in the top right</li>
                        <li>Select &quot;Export CSV&quot;</li>
                        <li>Upload the downloaded file below</li>
                    </ol>
                </Card>

                {/* Drop zone */}
                <Card>
                    <h2 className="text-lg font-semibold mb-4">Upload CSV file</h2>
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
                                onClick={(e) => { e.stopPropagation(); handleClear() }}
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
                </Card>
            </div>
        )
    }

    // ── Preview stage ───────────────────────────────────────────────────────────

    if (stage === 'preview') {
        const { totalItems, preview, newCategories, validRows } = validationResult
        const truncated = totalItems > 10 ? totalItems - 10 : 0

        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-xl font-semibold">
                        {totalItems} item{totalItems !== 1 ? 's' : ''} found
                    </h2>
                    <div className="flex gap-3">
                        <Button variant="default" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                            onClick={handleImport}
                        >
                            Import {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </Button>
                    </div>
                </div>

                {newCategories.length > 0 && (
                    <Alert type="info" showIcon>
                        {newCategories.length} new{' '}
                        {newCategories.length === 1 ? 'category' : 'categories'} will be
                        created: {newCategories.join(', ')}
                    </Alert>
                )}

                {totalItems > 500 && (
                    <Alert type="warning" showIcon>
                        Large import — this may take a moment.
                    </Alert>
                )}

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>Item Name</Th>
                                    <Th>Category</Th>
                                    <Th>Weight</Th>
                                    <Th>Unit</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {preview.map((row, i) => (
                                    <Tr key={i}>
                                        <Td>{row.name}</Td>
                                        <Td>{row.category || <span className="text-gray-400">—</span>}</Td>
                                        <Td>{row.weight}</Td>
                                        <Td>{row.unit}</Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                    {truncated > 0 && (
                        <p className="mt-3 text-sm text-gray-500">
                            ...and {truncated} more item{truncated !== 1 ? 's' : ''}
                        </p>
                    )}
                </Card>
            </div>
        )
    }

    // ── Importing stage ─────────────────────────────────────────────────────────

    if (stage === 'importing') {
        const percent =
            progress.total > 0
                ? Math.round((progress.current / progress.total) * 100)
                : 0

        return (
            <Card>
                <div className="flex flex-col gap-4 py-4">
                    <h2 className="text-lg font-semibold">Importing...</h2>
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

    // ── Success stage ───────────────────────────────────────────────────────────

    if (stage === 'success' && importResult) {
        return (
            <Card>
                <div className="flex flex-col gap-4 py-4">
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
                            {importResult.skipped !== 1 ? ' they already exist' : ' it already exists'} in your gear list.
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
