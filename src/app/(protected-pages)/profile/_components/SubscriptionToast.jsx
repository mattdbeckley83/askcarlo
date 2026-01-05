'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

export default function SubscriptionToast() {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const subscription = searchParams.get('subscription')

        if (subscription === 'success') {
            toast.push(
                <Notification title="Welcome to Trailblazer! 🎉" type="success">
                    Your subscription is now active. Enjoy unlimited conversations with Carlo!
                </Notification>,
            )
            // Clean the URL
            router.replace('/profile', { scroll: false })
        } else if (subscription === 'canceled') {
            toast.push(
                <Notification title="Subscription not completed" type="info">
                    No worries! You can upgrade to Trailblazer anytime.
                </Notification>,
            )
            // Clean the URL
            router.replace('/profile', { scroll: false })
        }
    }, [searchParams, router])

    return null
}
