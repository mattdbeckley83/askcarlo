'use client'

import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getUserItems } from '@/server/actions/carlo/getTemplateData'

const budgetOptions = [
    { value: '', label: 'No limit' },
    { value: 'under_100', label: 'Under $100' },
    { value: 'under_200', label: 'Under $200' },
    { value: 'under_300', label: 'Under $300' },
    { value: 'under_500', label: 'Under $500' },
]

export default function UpgradeGearModal({ isOpen, onClose, onSubmit }) {
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [formState, setFormState] = useState({
        item_id: null,
        issues: '',
        features: '',
        budget: '',
    })
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchItems()
        }
    }, [isOpen])

    const fetchItems = async () => {
        setIsLoading(true)
        try {
            const result = await getUserItems()
            if (result.error) {
                setError(result.error)
            }
            setItems(result.items || [])
        } catch (err) {
            console.error('Error fetching items:', err)
            setError('Failed to load items')
        } finally {
            setIsLoading(false)
        }
    }

    const itemOptions = items.map((item) => ({
        value: item.id,
        label: item.brand ? `${item.name} (${item.brand})` : item.name,
        item: item,
    }))

    const handleSelectChange = (field) => (option) => {
        setFormState((prev) => ({
            ...prev,
            [field]: option?.value ?? null,
        }))
    }

    const handleInputChange = (field) => (e) => {
        setFormState((prev) => ({
            ...prev,
            [field]: e.target.value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)

        if (!formState.item_id) {
            setError('Please select an item to upgrade')
            return
        }

        const selectedItem = items.find((i) => i.id === formState.item_id)
        if (!selectedItem) {
            setError('Selected item not found')
            return
        }

        // Build the template prompt
        const budgetLabel = budgetOptions.find((b) => b.value === formState.budget)?.label

        let prompt = `I want to upgrade my ${selectedItem.name}`
        if (selectedItem.brand) {
            prompt += ` (${selectedItem.brand})`
        }
        prompt += '.\n\n'

        prompt += `Current specs: `
        if (selectedItem.weight) {
            prompt += `${selectedItem.weight} ${selectedItem.weight_unit}`
        } else {
            prompt += 'weight unknown'
        }
        if (selectedItem.categories?.name) {
            prompt += `, ${selectedItem.categories.name} category`
        }
        prompt += '.\n'

        if (formState.issues.trim()) {
            prompt += `\nIssues with current item: ${formState.issues.trim()}\n`
        }

        if (formState.features.trim()) {
            prompt += `\nMust-have features: ${formState.features.trim()}\n`
        }

        if (formState.budget && budgetLabel) {
            prompt += `\nBudget: ${budgetLabel}\n`
        }

        prompt += `\nPlease recommend 3 alternatives with:
- Product name and brand
- Weight
- Price estimate
- Why it's better than my current item
- Where to buy`

        onSubmit({
            template: 'upgrade_gear',
            prompt: prompt,
            itemId: selectedItem.id,
        })

        handleClose()
    }

    const handleClose = () => {
        setFormState({
            item_id: null,
            issues: '',
            features: '',
            budget: '',
        })
        setError(null)
        onClose()
    }

    const dialogTitleId = 'upgrade-gear-title'
    const dialogDescId = 'upgrade-gear-desc'

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            width={480}
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescId}
        >
            <h4 id={dialogTitleId} className="text-lg font-semibold mb-4">Upgrade Gear</h4>
            <p id={dialogDescId} className="text-gray-500 text-sm mb-4">
                Get personalized recommendations to replace or upgrade an item from your gear list.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            Select Item to Upgrade <span className="text-red-500">*</span>
                        </label>
                        <Select
                            placeholder={isLoading ? 'Loading items...' : 'Select an item...'}
                            options={itemOptions}
                            value={itemOptions.find((opt) => opt.value === formState.item_id)}
                            onChange={handleSelectChange('item_id')}
                            isDisabled={isLoading}
                            isLoading={isLoading}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            Issues with Current Item
                        </label>
                        <Input
                            textArea
                            placeholder="Too heavy, not durable enough, poor ventilation..."
                            value={formState.issues}
                            onChange={handleInputChange('issues')}
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            Must-Have Features
                        </label>
                        <Input
                            textArea
                            placeholder="Waterproof, under 1lb, good for cold weather..."
                            value={formState.features}
                            onChange={handleInputChange('features')}
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            Budget
                        </label>
                        <Select
                            placeholder="Select budget..."
                            options={budgetOptions}
                            value={budgetOptions.find((opt) => opt.value === formState.budget)}
                            onChange={handleSelectChange('budget')}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex justify-end gap-2 mt-2">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            disabled={!formState.item_id}
                        >
                            Start Conversation
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    )
}
