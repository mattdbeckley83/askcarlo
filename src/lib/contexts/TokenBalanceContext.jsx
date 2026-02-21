'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getUserTokenBalance } from '@/server/actions/tokens/tokenActions'

const TokenBalanceContext = createContext({
    balance: 0,
    isLoading: true,
    refresh: () => {},
    updateBalance: () => {},
})

export function TokenBalanceProvider({ children }) {
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

    return (
        <TokenBalanceContext.Provider value={{ balance, isLoading, refresh, updateBalance }}>
            {children}
        </TokenBalanceContext.Provider>
    )
}

export function useTokenBalance() {
    const context = useContext(TokenBalanceContext)
    if (context === undefined) {
        throw new Error('useTokenBalance must be used within a TokenBalanceProvider')
    }
    return context
}
