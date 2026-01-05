'use client'

import { useState, useEffect, useTransition } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import FormItem from '@/components/ui/Form/FormItem'
import { updateTrip } from '@/server/actions/trips/updateTrip'

const EditTripModal = ({ isOpen, onClose, trip, activities = [] }) => {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState(null)
    const [showTrailDetails, setShowTrailDetails] = useState(false)
    const [formState, setFormState] = useState({
        name: '',
        activity_id: null,
        start_date: '',
        end_date: '',
        notes: '',
        distance_miles: '',
        total_ascent_ft: '',
        total_descent_ft: '',
        max_elevation_ft: '',
        min_elevation_ft: '',
        trail_url: '',
    })

    useEffect(() => {
        if (trip) {
            const hasTrailData = trip.distance_miles || trip.total_ascent_ft || trip.total_descent_ft ||
                trip.max_elevation_ft || trip.min_elevation_ft || trip.trail_url
            setShowTrailDetails(!!hasTrailData)
            setFormState({
                name: trip.name || '',
                activity_id: trip.activity_id || null,
                start_date: trip.start_date || '',
                end_date: trip.end_date || '',
                notes: trip.notes || '',
                distance_miles: trip.distance_miles || '',
                total_ascent_ft: trip.total_ascent_ft || '',
                total_descent_ft: trip.total_descent_ft || '',
                max_elevation_ft: trip.max_elevation_ft || '',
                min_elevation_ft: trip.min_elevation_ft || '',
                trail_url: trip.trail_url || '',
            })
        }
    }, [trip])

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
        formData.set('trip_id', trip.id)
        formData.set('name', formState.name)
        formData.set('activity_id', formState.activity_id || '')
        formData.set('start_date', formState.start_date)
        formData.set('end_date', formState.end_date)
        formData.set('notes', formState.notes)
        formData.set('distance_miles', formState.distance_miles)
        formData.set('total_ascent_ft', formState.total_ascent_ft)
        formData.set('total_descent_ft', formState.total_descent_ft)
        formData.set('max_elevation_ft', formState.max_elevation_ft)
        formData.set('min_elevation_ft', formState.min_elevation_ft)
        formData.set('trail_url', formState.trail_url)

        startTransition(async () => {
            const result = await updateTrip(formData)
            if (result.error) {
                setError(result.error)
            } else {
                onClose()
            }
        })
    }

    const handleClose = () => {
        setError(null)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={500}>
            <div className="flex flex-col max-h-[80vh]">
                <h4 className="text-lg font-semibold mb-4 flex-shrink-0">Edit Trip</h4>
                <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
                    <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
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

                    {/* Trail Details Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowTrailDetails(!showTrailDetails)}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            {showTrailDetails ? '[- Hide trail details]' : '[+ Add trail details]'}
                        </button>

                        {showTrailDetails && (
                            <div className="mt-4 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem label="Distance (miles)">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            placeholder="12.5"
                                            value={formState.distance_miles}
                                            onChange={handleInputChange('distance_miles')}
                                        />
                                    </FormItem>
                                    <FormItem label="Total Ascent (ft)">
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="3200"
                                            value={formState.total_ascent_ft}
                                            onChange={handleInputChange('total_ascent_ft')}
                                        />
                                    </FormItem>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormItem label="Total Descent (ft)">
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="2800"
                                            value={formState.total_descent_ft}
                                            onChange={handleInputChange('total_descent_ft')}
                                        />
                                    </FormItem>
                                    <FormItem label="Max Elevation (ft)">
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="8450"
                                            value={formState.max_elevation_ft}
                                            onChange={handleInputChange('max_elevation_ft')}
                                        />
                                    </FormItem>
                                </div>

                                <FormItem label="Min Elevation (ft)">
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="5200"
                                        value={formState.min_elevation_ft}
                                        onChange={handleInputChange('min_elevation_ft')}
                                    />
                                </FormItem>

                                <FormItem label="Trail Link">
                                    <Input
                                        type="url"
                                        placeholder="AllTrails, GaiaGPS, or CalTopo link"
                                        value={formState.trail_url}
                                        onChange={handleInputChange('trail_url')}
                                    />
                                </FormItem>
                            </div>
                        )}
                    </div>

                    </div>

                    <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                        {error && (
                            <div className="text-red-500 text-sm mb-3">{error}</div>
                        )}
                        <div className="flex justify-end gap-2">
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
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}

export default EditTripModal
