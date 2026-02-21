'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserTokenBalance } from '@/server/actions/tokens/tokenActions'

export function useTokenBalance() {
    const [balance, setBalance] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const refresh = useCallback(async () => {
        const result = await getUserTokenBalance()
        if (result.success) {
            setBalance(result.balance)
        }
        setIsLoading(false)
    }, [])

    // Update balance directly (for immediate UI updates after API calls)
    const updateBalance = useCallback((newBalance) => {
        if (typeof newBalance === 'number') {
            setBalance(newBalance)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    return { balance, isLoading, refresh, updateBalance }
}
