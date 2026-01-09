'use client'

import { useState, useEffect, useTransition } from 'react'
import Dialog from '@/components/ui/Dialog'
import Button from '@/components/ui/Button'
import Switcher from '@/components/ui/Switcher'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { PiCopy, PiCheck, PiWarning, PiLink } from 'react-icons/pi'
import { getTripShareStatus } from '@/server/actions/trips/getTripShareStatus'
import { toggleTripShare } from '@/server/actions/trips/toggleTripShare'

const ShareTripModal = ({ isOpen, onClose, tripId, tripName }) => {
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isActive, setIsActive] = useState(false)
    const [shareToken, setShareToken] = useState(null)
    const [copied, setCopied] = useState(false)

    const shareUrl = shareToken
        ? `https://askcarlo.ai/s/${shareToken}`
        : null

    // Fetch current share status when modal opens
    useEffect(() => {
        if (isOpen && tripId) {
            setIsLoading(true)
            setError(null)

            getTripShareStatus(tripId).then((result) => {
                if (result.error) {
                    setError(result.error)
                } else {
                    setIsActive(result.isActive)
                    setShareToken(result.shareToken)
                }
                setIsLoading(false)
            })
        }
    }, [isOpen, tripId])

    const handleToggle = () => {
        setError(null)

        startTransition(async () => {
            const result = await toggleTripShare(tripId)
            if (result.error) {
                setError(result.error)
            } else {
                setIsActive(result.isActive)
                setShareToken(result.shareToken)
            }
        })
    }

    const handleCopy = async () => {
        if (!shareUrl) return

        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)

            toast.push(
                <Notification title="Link copied!" type="success" />,
                { placement: 'top-center' }
            )

            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.push(
                <Notification title="Failed to copy link" type="danger" />,
                { placement: 'top-center' }
            )
        }
    }

    const handleClose = () => {
        setError(null)
        setCopied(false)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} width={480}>
            <h4 className="text-lg font-semibold mb-4">Share Trip</h4>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary" />
                </div>
            ) : (
                <>
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <PiLink className="text-xl text-gray-500" />
                            <div>
                                <p className="font-medium">Enable sharing</p>
                                <p className="text-sm text-gray-500">
                                    {isActive
                                        ? 'Anyone with the link can view this trip'
                                        : 'Trip is private'}
                                </p>
                            </div>
                        </div>
                        <Switcher
                            checked={isActive}
                            onChange={handleToggle}
                            disabled={isPending}
                            isLoading={isPending}
                        />
                    </div>

                    {/* Share URL Section - only show when active */}
                    {isActive && shareUrl && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Share link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg truncate"
                                />
                                <Button
                                    variant="solid"
                                    size="sm"
                                    icon={copied ? <PiCheck /> : <PiCopy />}
                                    onClick={handleCopy}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>

                            {/* Warning text */}
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <div className="flex gap-2">
                                    <PiWarning className="text-amber-600 dark:text-amber-400 text-lg flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        Anyone with this link can view your trip. The link will always show the current version of your trip.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-red-500 text-sm">{error}</div>
                    )}
                </>
            )}

            <div className="flex justify-end mt-6">
                <Button variant="plain" onClick={handleClose}>
                    Close
                </Button>
            </div>
        </Dialog>
    )
}

export default ShareTripModal
