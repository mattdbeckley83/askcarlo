'use client'

import { useState, useRef, useEffect } from 'react'
import { PiCoins } from 'react-icons/pi'
import { useTokenBalance } from '@/lib/contexts/TokenBalanceContext'
import { createCheckoutSession } from '@/server/actions/stripe/createCheckoutSession'

const TokenBalance = () => {
    const { balance, isLoading } = useTokenBalance()
    const [open, setOpen] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const containerRef = useRef(null)
    const prevBalanceRef = useRef(null)

    useEffect(() => {
        if (prevBalanceRef.current !== null && balance < prevBalanceRef.current) {
            setIsAnimating(true)
            const t = setTimeout(() => setIsAnimating(false), 600)
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
                           bg-gray-900 border border-gray-700 shadow-md
                           hover:bg-gray-800 hover:border-gray-500
                           dark:bg-white/10 dark:backdrop-blur-sm dark:border-white/20
                           dark:hover:bg-white/15 dark:hover:border-white/30
                           transition-all duration-200 ${isAnimating ? 'animate-token-spend' : ''}`}
            >
                <PiCoins
                    className={`text-amber-400 transition-[filter] duration-300 ${isAnimating ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.85)]' : ''}`}
                    size={18}
                />
                <span className="font-semibold text-white">
                    {balance.toLocaleString()}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                        Tokens are spent when you chat with Carlo or use other AI-powered features.
                    </p>
                    <button
                        type="button"
                        disabled={isCheckingOut}
                        onClick={async () => {
                            setIsCheckingOut(true)
                            const result = await createCheckoutSession()
                            if (result.url) {
                                window.location.href = result.url
                            } else {
                                console.error('Checkout error:', result.error)
                                setIsCheckingOut(false)
                            }
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isCheckingOut ? 'Redirecting...' : 'Add 500 tokens for $5'}
                    </button>
                </div>
            )}
        </div>
    )
}

export default TokenBalance
