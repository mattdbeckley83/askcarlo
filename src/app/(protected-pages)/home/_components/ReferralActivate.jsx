'use client'

import { useEffect } from 'react'
import { createReferral } from '@/server/actions/referrals/createReferral'

export default function ReferralActivate() {
    useEffect(() => {
        const cookieMap = document.cookie.split(';').reduce((acc, c) => {
            const [k, v] = c.trim().split('=')
            if (k) acc[k] = v
            return acc
        }, {})

        const code = cookieMap['carlo_ref']
        if (!code) return

        // Clear cookie immediately to prevent re-firing on subsequent visits
        document.cookie = 'carlo_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        createReferral(decodeURIComponent(code)).catch(console.error)
    }, [])

    return null
}
