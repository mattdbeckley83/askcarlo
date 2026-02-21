import React from 'react'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import TokenBalanceProviderWrapper from '@/components/providers/TokenBalanceProviderWrapper'

const Layout = async ({ children }) => {
    return (
        <TokenBalanceProviderWrapper>
            <PostLoginLayout>{children}</PostLoginLayout>
        </TokenBalanceProviderWrapper>
    )
}

export default Layout
