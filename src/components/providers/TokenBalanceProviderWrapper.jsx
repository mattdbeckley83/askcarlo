'use client'

import { TokenBalanceProvider } from '@/lib/contexts/TokenBalanceContext'

export default function TokenBalanceProviderWrapper({ children }) {
    return <TokenBalanceProvider>{children}</TokenBalanceProvider>
}
