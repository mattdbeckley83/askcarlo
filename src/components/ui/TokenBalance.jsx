'use client'

import { useState, useRef, useEffect } from 'react'
import { PiShoppingCartSimple } from 'react-icons/pi'
import { useTokenBalance } from '@/lib/contexts/TokenBalanceContext'
import { createCheckoutSession } from '@/server/actions/stripe/createCheckoutSession'
import { TOKEN_PACKAGES } from '@/lib/tokenPackages'

const TokenBalance = () => {
    const { balance, isLoading } = useTokenBalance()
    const [open, setOpen] = useState(false)
    const [isAnimating, setIsAnimating] = useState(null) // 'spend' | 'grant' | null
    const [checkingOutId, setCheckingOutId] = useState(null)
    const containerRef = useRef(null)
    const prevBalanceRef = useRef(null)

    useEffect(() => {
        if (prevBalanceRef.current !== null && balance !== prevBalanceRef.current) {
            const type = balance > prevBalanceRef.current ? 'grant' : 'spend'
            setIsAnimating(type)
            const t = setTimeout(() => setIsAnimating(null), 800)
            return () => clearTimeout(t)
        }
        prevBalanceRef.current = balance
    }, [balance])

    useEffect(() => {
        if (!open) return
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    if (isLoading) return null

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                           bg-indigo-600 border border-indigo-600 shadow-md
                           hover:bg-indigo-700 hover:border-indigo-700
                           transition-all duration-200 ${isAnimating === 'spend' ? 'animate-token-spend' : ''} ${isAnimating === 'grant' ? 'animate-token-grant' : ''}`}
            >
                <img
                    src="/img/logo/carlo.png"
                    alt="tokens"
                    className={`w-[18px] h-[18px] brightness-0 invert transition-[filter] duration-300 ${isAnimating === 'spend' ? 'drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : ''} ${isAnimating === 'grant' ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]' : ''}`}
                />
                <span className="font-semibold text-white">
                    {balance.toLocaleString()}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 flex flex-col gap-3">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Buy Tokens</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Tokens are spent when you chat with Carlo or use Smart Fill.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        {TOKEN_PACKAGES.map((pkg) => (
                            <button
                                key={pkg.id}
                                type="button"
                                disabled={checkingOutId !== null}
                                onClick={async () => {
                                    setCheckingOutId(pkg.id)
                                    const result = await createCheckoutSession(pkg.id)
                                    if (result.url) {
                                        window.open(result.url, '_blank')
                                        setCheckingOutId(null)
                                    } else {
                                        console.error('Checkout error:', result.error)
                                        setCheckingOutId(null)
                                    }
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
                            >
                                <div className="flex items-center gap-2">
                                    <PiShoppingCartSimple className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                    <span className="font-medium text-indigo-900 dark:text-indigo-100">
                                        {checkingOutId === pkg.id ? 'Opening...' : pkg.label}
                                    </span>
                                    {pkg.badge && (
                                        <span className="text-xs px-1.5 py-0.5 bg-indigo-600 text-white rounded font-medium">
                                            {pkg.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                                    ${pkg.priceUsd}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TokenBalance
