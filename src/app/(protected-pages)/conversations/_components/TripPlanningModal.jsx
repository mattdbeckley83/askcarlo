'use client'

import { useState, useEffect } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getUserTrips, getTripDetails } from '@/server/actions/carlo/getTemplateData'
import { convertToGrams, formatWeight } from '@/lib/utils/weightCalculations'

export default function TripPlanningModal({ isOpen, onClose, onSubmit }) {
    const [trips, setTrips] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingTripDetails, setIsLoadingTripDetails] = useState(false)
    const [formState, setFormState] = useState({
        trip_id: null,
        question: '',
    })
    const [selectedTripDetails, setSelectedTripDetails] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchTrips()
        }
    }, [isOpen])

    const fetchTrips = async () => {
        setIsLoading(true)
        try {
            const result = await getUserTrips()
            if (result.error) {
                setError(result.error)
            }
            setTrips(result.trips || [])
        } catch (err) {
            console.error('Error fetching trips:', err)
            setError('Failed to load trips')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTripDetails = async (tripId) => {
        setIsLoadingTripDetails(true)
        try {
            const result = await getTripDetails(tripId)
            if (result.error) {
                console.error('Error fetching trip details:', result.error)
            }
            setSelectedTripDetails(result.tripItems || [])
        } catch (err) {
            console.error('Error fetching trip details:', err)
        } finally {
            setIsLoadingTripDetails(false)
        }
    }

    const tripOptions = trips.map((trip) => ({
        value: trip.id,
        label: trip.name,
        trip: trip,
    }))

    const handleTripChange = (option) => {
        const tripId = option?.value ?? null
        setFormState((prev) => ({
            ...prev,
            trip_id: tripId,
        }))
        if (tripId) {
            fetchTripDetails(tripId)
        } else {
            setSelectedTripDetails(null)
        }
    }

    const handleInputChange = (field) => (e) => {
        setFormState((prev) => ({
            ...prev,
            [field]: e.target.value,
        }))
    }

    const calculateWeights = (tripItems) => {
        let total = 0
        let worn = 0
        let consumable = 0

        tripItems.forEach((ti) => {
            const item = ti.items
            if (!item?.weight) return

            const weightInGrams = convertToGrams(item.weight, item.weight_unit) * (ti.quantity || 1)
            total += weightInGrams

            if (ti.is_worn) worn += weightInGrams
            if (ti.is_consumable) consumable += weightInGrams
        })

        const base = total - worn - consumable

        return {
            total: formatWeight(total, 'lb'),
            base: formatWeight(base, 'lb'),
            worn: formatWeight(worn, 'lb'),
            consumable: formatWeight(consumable, 'lb'),
        }
    }

    const groupItemsByCategory = (tripItems) => {
        const groups = {}

        tripItems.forEach((ti) => {
            const item = ti.items
            if (!item) return

            const categoryName = item.categories?.name || 'Uncategorized'
            if (!groups[categoryName]) {
                groups[categoryName] = []
            }

            let itemStr = item.name
            if (item.weight) {
                itemStr += ` (${item.weight} ${item.weight_unit})`
            }
            if (ti.quantity > 1) {
                itemStr += ` x${ti.quantity}`
            }
            if (ti.is_worn) itemStr += ' [worn]'
            if (ti.is_consumable) itemStr += ' [consumable]'

            groups[categoryName].push(itemStr)
        })

        return groups
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)

        if (!formState.trip_id) {
            setError('Please select a trip')
            return
        }

        if (!formState.question.trim()) {
            setError('Please enter your question')
            return
        }

        const selectedTrip = trips.find((t) => t.id === formState.trip_id)
        if (!selectedTrip) {
            setError('Selected trip not found')
            return
        }

        // Build the template prompt with full trip context
        let prompt = `I'm planning a trip: ${selectedTrip.name}\n`

        if (selectedTrip.activities?.name) {
            prompt += `Activity: ${selectedTrip.activities.name}\n`
        }

        if (selectedTrip.start_date || selectedTrip.end_date) {
            prompt += `Dates: ${selectedTrip.start_date || 'TBD'}`
            if (selectedTrip.end_date) {
                prompt += ` to ${selectedTrip.end_date}`
            }
            prompt += '\n'
        }

        if (selectedTrip.notes) {
            prompt += `Notes: ${selectedTrip.notes}\n`
        }

        // Add weight summary if we have trip items
        if (selectedTripDetails && selectedTripDetails.length > 0) {
            const weights = calculateWeights(selectedTripDetails)
            prompt += `\nCurrent pack weights:\n`
            prompt += `Total: ${weights.total} | Base: ${weights.base} | Worn: ${weights.worn} | Consumable: ${weights.consumable}\n`

            // Add items by category
            const itemsByCategory = groupItemsByCategory(selectedTripDetails)
            prompt += `\nItems by category:\n`
            Object.entries(itemsByCategory).forEach(([category, items]) => {
                prompt += `${category}: ${items.join(', ')}\n`
            })
        } else {
            prompt += `\nNo items added to this trip yet.\n`
        }

        prompt += `\nMy question: ${formState.question.trim()}`

        onSubmit({
            template: 'trip_planning',
            prompt: prompt,
            tripId: selectedTrip.id,
        })

        handleClose()
    }

    const handleClose = () => {
        setFormState({
            trip_id: null,
            question: '',
        })
        setSelectedTripDetails(null)
        setError(null)
        onClose()
    }

    const selectedTrip = trips.find((t) => t.id === formState.trip_id)

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={520}>
            <h4 className="text-lg font-semibold mb-4">Trip Planning</h4>
            <p className="text-gray-500 text-sm mb-4">
                Get personalized advice for your trip with full context of your planned gear.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            Select Trip <span className="text-red-500">*</span>
                        </label>
                        <Select
                            placeholder={isLoading ? 'Loading trips...' : 'Select a trip...'}
                            options={tripOptions}
                            value={tripOptions.find((opt) => opt.value === formState.trip_id)}
                            onChange={handleTripChange}
                            isDisabled={isLoading}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Show trip summary when selected */}
                    {selectedTrip && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                            <div className="font-medium">{selectedTrip.name}</div>
                            {selectedTrip.activities?.name && (
                                <div className="text-gray-500">{selectedTrip.activities.name}</div>
                            )}
                            {(selectedTrip.start_date || selectedTrip.end_date) && (
                                <div className="text-gray-500">
                                    {selectedTrip.start_date || 'TBD'}
                                    {selectedTrip.end_date && ` to ${selectedTrip.end_date}`}
                                </div>
                            )}
                            {isLoadingTripDetails ? (
                                <div className="text-gray-400 mt-2">Loading gear list...</div>
                            ) : selectedTripDetails && selectedTripDetails.length > 0 ? (
                                <div className="text-gray-500 mt-2">
                                    {selectedTripDetails.length} items in pack
                                    {' '}&middot;{' '}
                                    {calculateWeights(selectedTripDetails).total} total
                                </div>
                            ) : (
                                <div className="text-gray-400 mt-2">No items added yet</div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium mb-1 block">
                            What do you want help with? <span className="text-red-500">*</span>
                        </label>
                        <Input
                            textArea
                            placeholder="Am I missing anything? Is my pack too heavy? What should I remove? Any gear recommendations?"
                            value={formState.question}
                            onChange={handleInputChange('question')}
                            rows={3}
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
                            disabled={!formState.trip_id || !formState.question.trim()}
                        >
                            Start Conversation
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    )
}
