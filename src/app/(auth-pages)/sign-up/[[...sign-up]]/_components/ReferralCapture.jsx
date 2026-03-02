'use client'

import { useEffect } from 'react'

export default function ReferralCapture({ code }) {
    useEffect(() => {
        const expires = new Date()
        expires.setDate(expires.getDate() + 7)
        document.cookie = `carlo_ref=${encodeURIComponent(code)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    }, [code])

    return null
}
