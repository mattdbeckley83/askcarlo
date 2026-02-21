'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTokenBalance } from '@/lib/contexts/TokenBalanceContext'

export default function TokenSuccessRefresh() {
    const { refresh } = useTokenBalance()
    const router = useRouter()

    useEffect(() => {
        // Poll a few times in case webhook takes a moment to process
        const delays = [1500, 4000, 8000]
        const timers = delays.map((delay) =>
            setTimeout(() => refresh(), delay)
        )

        // Clean up query param from URL without a navigation
        router.replace('/conversations', { scroll: false })

        return () => timers.forEach(clearTimeout)
    }, [refresh, router])

    return null
}
