'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { PiCheck, PiClock, PiCoins } from 'react-icons/pi'
import { getReferrals } from '@/server/actions/referrals/getReferrals'
import { getReferralCode } from '@/server/actions/referrals/getReferralCode'

export default function ReferralStatus() {
    const [referrals, setReferrals] = useState([])
    const [referralCode, setReferralCode] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        Promise.all([getReferrals(), getReferralCode()]).then(([referralsResult, codeResult]) => {
            if (referralsResult.success) setReferrals(referralsResult.referrals)
            if (codeResult.success) setReferralCode(codeResult.referralCode)
            setIsLoading(false)
        })
    }, [])

    const handleCopy = () => {
        const url = `${window.location.origin}/sign-up?ref=${referralCode}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const activatedCount = referrals.filter((r) => r.status === 'activated').length
    const pendingCount = referrals.filter((r) => r.status === 'pending').length
    const totalEarned = referrals.reduce((sum, r) => sum + (r.referrer_tokens_awarded || 0), 0)

    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Refer a Friend
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Earn 75 tokens when someone you refer sends their first Carlo message.
                        They earn 50 bonus tokens too.
                    </p>
                </div>

                {/* Referral link */}
                <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg truncate text-gray-600 dark:text-gray-300 font-mono">
                        {referralCode ? `${typeof window !== 'undefined' ? window.location.origin : 'https://app.askcarlo.ai'}/sign-up?ref=${referralCode}` : '...'}
                    </div>
                    <button
                        onClick={handleCopy}
                        disabled={!referralCode}
                        className="px-3 py-2 text-sm font-medium bg-gray-900 dark:bg-white/10 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-white/20 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Stats */}
                {!isLoading && referrals.length > 0 && (
                    <div className="flex gap-4 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">{activatedCount}</span> activated
                        </span>
                        {pendingCount > 0 && (
                            <span className="text-gray-500 dark:text-gray-400">
                                <span className="font-semibold text-gray-900 dark:text-white">{pendingCount}</span> pending
                            </span>
                        )}
                        {totalEarned > 0 && (
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <PiCoins className="text-[#fe7f2d]" size={14} />
                                <span className="font-semibold text-[#fe7f2d]">{totalEarned}</span> earned
                            </span>
                        )}
                    </div>
                )}

                {/* Referral list */}
                {!isLoading && referrals.length > 0 && (
                    <div className="flex flex-col">
                        {referrals.map((r) => {
                            const name =
                                r.referee?.first_name ||
                                r.referee?.email?.split('@')[0] ||
                                'Someone'
                            return (
                                <div
                                    key={r.id}
                                    className="flex items-center justify-between py-2.5 border-t border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        {r.status === 'activated' ? (
                                            <PiCheck className="text-green-500 flex-shrink-0" size={16} />
                                        ) : (
                                            <PiClock className="text-gray-400 flex-shrink-0" size={16} />
                                        )}
                                        <span className="text-sm text-gray-900 dark:text-white">{name}</span>
                                    </div>
                                    {r.status === 'activated' ? (
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                            +{r.referrer_tokens_awarded} tokens
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">Pending first chat</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </Card>
    )
}
