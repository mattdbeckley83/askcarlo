'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FormItem from '@/components/ui/Form/FormItem'
import { PiCheck } from 'react-icons/pi'
import { createCategory } from '@/server/actions/categories/createCategory'
import { CATEGORY_COLORS } from '@/lib/constants/colors'

const AddCategoryModal = ({ isOpen, onClose, defaultColor }) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState(null)
    const [name, setName] = useState('')
    const [color, setColor] = useState(defaultColor || CATEGORY_COLORS[0])

    const handleClose = () => {
        setName('')
        setColor(defaultColor || CATEGORY_COLORS[0])
        setError(null)
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData()
        formData.set('name', name)
        formData.set('color', color)

        startTransition(async () => {
            const result = await createCategory(formData)
            if (result.error) {
                setError(result.error)
            } else {
                router.refresh()
                handleClose()
            }
        })
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={420} closable={false}>
            <div className="flex flex-col gap-4">
                <h4 className="text-lg font-semibold">Add Category</h4>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FormItem label="Category Name" asterisk>
                        <Input
                            placeholder="e.g. Shelter, Sleep System, Clothing..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
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
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                                    style={{
                                        backgroundColor: c,
                                        boxShadow:
                                            color === c
                                                ? `0 0 0 3px white, 0 0 0 5px ${c}`
                                                : undefined,
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
                        <Button type="button" variant="plain" size="sm" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            size="sm"
                            className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                            loading={isPending}
                        >
                            Add Category
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default AddCategoryModal
