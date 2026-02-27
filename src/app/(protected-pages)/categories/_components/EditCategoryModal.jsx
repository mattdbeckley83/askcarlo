'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FormItem from '@/components/ui/Form/FormItem'
import { PiTrash, PiWarning, PiCheck } from 'react-icons/pi'
import { updateCategory } from '@/server/actions/categories/updateCategory'
import { deleteCategory } from '@/server/actions/categories/deleteCategory'
import { CATEGORY_COLORS } from '@/lib/constants/colors'

const EditCategoryModal = ({ isOpen, onClose, category }) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isDeleting, startDeleteTransition] = useTransition()
    const [error, setError] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [name, setName] = useState('')
    const [color, setColor] = useState(CATEGORY_COLORS[0])

    useEffect(() => {
        if (category) {
            setName(category.name || '')
            setColor(category.color || CATEGORY_COLORS[0])
            setShowDeleteConfirm(false)
            setError(null)
        }
    }, [category])

    const handleClose = () => {
        setError(null)
        setShowDeleteConfirm(false)
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData()
        formData.set('category_id', category.id)
        formData.set('name', name)
        formData.set('color', color)

        startTransition(async () => {
            const result = await updateCategory(formData)
            if (result.error) {
                setError(result.error)
            } else {
                router.refresh()
                handleClose()
            }
        })
    }

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true)
    }

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false)
    }

    const handleDeleteConfirm = () => {
        startDeleteTransition(async () => {
            const result = await deleteCategory(category.id)
            if (result.error) {
                setError(result.error)
                setShowDeleteConfirm(false)
            } else {
                router.refresh()
                handleClose()
            }
        })
    }

    if (showDeleteConfirm) {
        return (
            <Dialog isOpen={isOpen} onClose={handleClose} width={400} closable={false}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <PiWarning className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Delete Category</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {category?.name}
                            </span>
                            ? This action cannot be undone.
                        </p>
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="plain"
                            className="flex-1"
                            onClick={handleDeleteCancel}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            className="flex-1 !bg-red-600 hover:!bg-red-700"
                            onClick={handleDeleteConfirm}
                            loading={isDeleting}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Dialog>
        )
    }

    const canDelete = category?.itemCount === 0

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={420} closable={false}>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Edit Category</h4>
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={canDelete ? handleDeleteClick : undefined}
                            disabled={!canDelete}
                            className={`p-2 rounded-lg transition-colors ${
                                canDelete
                                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer'
                                    : 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                            }`}
                        >
                            <PiTrash className="w-5 h-5" />
                        </button>
                        {!canDelete && (
                            <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                                This category has {category?.itemCount} item{category?.itemCount !== 1 ? 's' : ''} assigned. Reassign or remove them before deleting.
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FormItem label="Category Name" asterisk>
                        <Input
                            placeholder="Enter category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </FormItem>

                    <FormItem label="Color">
                        <div className="flex flex-wrap gap-2 pt-1">
                            {CATEGORY_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    title={c}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-gray-400"
                                    style={{
                                        backgroundColor: c,
                                        boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined,
                                    }}
                                >
                                    {color === c && (
                                        <PiCheck className="w-4 h-4 text-white drop-shadow-sm" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </FormItem>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="plain" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                            loading={isPending}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default EditCategoryModal
