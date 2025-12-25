'use client'

import { useState, useTransition } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import { deleteTrip } from '@/server/actions/trips/deleteTrip'

const DeleteTripDialog = ({ isOpen, onClose, tripId, tripName, onSuccess }) => {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState(null)

    const handleDelete = () => {
        setError(null)

        startTransition(async () => {
            const result = await deleteTrip(tripId)
            if (result.error) {
                setError(result.error)
            } else {
                onClose()
                onSuccess?.()
            }
        })
    }

    const handleClose = () => {
        setError(null)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={400}>
            <h4 className="text-lg font-semibold mb-2">Delete Trip</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <strong>{tripName}</strong>? This
                action cannot be undone.
            </p>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="plain" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleDelete}
                    loading={isPending}
                >
                    Delete
                </Button>
            </div>
        </Dialog>
    )
}

export default DeleteTripDialog
