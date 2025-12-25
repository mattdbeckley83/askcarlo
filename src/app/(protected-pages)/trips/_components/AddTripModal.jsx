'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import FormItem from '@/components/ui/Form/FormItem'
import { addTrip } from '@/server/actions/trips/addTrip'

const AddTripModal = ({ isOpen, onClose, activities = [] }) => {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState(null)
    const [formState, setFormState] = useState({
        name: '',
        activity_id: null,
        start_date: '',
        end_date: '',
        notes: '',
    })

    const activityOptions = activities.map((activity) => ({
        value: activity.id,
        label: activity.name,
    }))

    const handleInputChange = (field) => (e) => {
        setFormState((prev) => ({
            ...prev,
            [field]: e.target.value,
        }))
    }

    const handleSelectChange = (field) => (option) => {
        setFormState((prev) => ({
            ...prev,
            [field]: option?.value ?? null,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData()
        formData.set('name', formState.name)
        formData.set('activity_id', formState.activity_id || '')
        formData.set('start_date', formState.start_date)
        formData.set('end_date', formState.end_date)
        formData.set('notes', formState.notes)

        startTransition(async () => {
            const result = await addTrip(formData)
            if (result.error) {
                setError(result.error)
            } else {
                // Reset form and navigate to the new trip
                setFormState({
                    name: '',
                    activity_id: null,
                    start_date: '',
                    end_date: '',
                    notes: '',
                })
                onClose()
                router.push(`/trips/${result.trip.id}`)
            }
        })
    }

    const handleClose = () => {
        setError(null)
        setFormState({
            name: '',
            activity_id: null,
            start_date: '',
            end_date: '',
            notes: '',
        })
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={500}>
            <h4 className="text-lg font-semibold mb-4">New Trip</h4>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                    <FormItem label="Trip Name" asterisk>
                        <Input
                            placeholder="Enter trip name"
                            value={formState.name}
                            onChange={handleInputChange('name')}
                            required
                        />
                    </FormItem>

                    <FormItem label="Activity">
                        <Select
                            placeholder="Select an activity"
                            options={activityOptions}
                            value={activityOptions.find(
                                (opt) => opt.value === formState.activity_id
                            )}
                            onChange={handleSelectChange('activity_id')}
                            isClearable
                        />
                    </FormItem>

                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Start Date">
                            <Input
                                type="date"
                                value={formState.start_date}
                                onChange={handleInputChange('start_date')}
                            />
                        </FormItem>

                        <FormItem label="End Date">
                            <Input
                                type="date"
                                value={formState.end_date}
                                onChange={handleInputChange('end_date')}
                            />
                        </FormItem>
                    </div>

                    <FormItem label="Notes">
                        <Input
                            textArea
                            placeholder="Add notes about your trip (optional)"
                            value={formState.notes}
                            onChange={handleInputChange('notes')}
                            rows={3}
                        />
                    </FormItem>

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
                            loading={isPending}
                        >
                            Create Trip
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    )
}

export default AddTripModal
