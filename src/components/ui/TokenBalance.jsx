'use client'

import { useState, useRef, useEffect } from 'react'
import { PiCoins } from 'react-icons/pi'
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
                <PiCoins
                    className={`text-white transition-[filter] duration-300 ${isAnimating === 'spend' ? 'drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : ''} ${isAnimating === 'grant' ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.9)]' : ''}`}
                    size={18}
                />
                <span className="font-semibold text-white">
                    {balance.toLocaleString()}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 flex flex-col gap-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Tokens are spent when you chat with Carlo or use other AI-powered features.
                    </p>

                    <div className="flex flex-col gap-1">
                        {TOKEN_PACKAGES.map((pkg) => (
                            <button
                                key={pkg.id}
                                type="button"
                                disabled={checkingOutId !== null}
                                onClick={async () => {
                                    setCheckingOutId(pkg.id)
                                    const result = await createCheckoutSession(pkg.id)
                                    if (result.url) {
                                        window.location.href = result.url
                                    } else {
                                        console.error('Checkout error:', result.error)
                                        setCheckingOutId(null)
                                    }
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {checkingOutId === pkg.id ? 'Redirecting...' : pkg.label}
                                </span>
                                <div className="flex items-center gap-2">
                                    {pkg.badge && (
                                        <span className="text-xs px-1.5 py-0.5 bg-[#fe7f2d]/10 text-[#fe7f2d] rounded font-medium">
                                            {pkg.badge}
                                        </span>
                                    )}
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ${pkg.priceUsd}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                </div>
            )}
        </div>
    )
}

export default TokenBalance
