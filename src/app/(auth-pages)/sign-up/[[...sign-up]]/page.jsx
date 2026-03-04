import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import CarloWordmark from '@/components/ui/CarloWordmark'
import ReferralCapture from './_components/ReferralCapture'

const clerkAppearance = {
    variables: {
        colorPrimary: '#fe7f2d',
        colorText: '#1f2937',
        colorTextSecondary: '#6b7280',
        colorBackground: '#ffffff',
        colorInputBackground: '#ffffff',
        colorInputText: '#1f2937',
        borderRadius: '0.75rem',
        fontFamily: 'inherit',
    },
    elements: {
        // Card and container - style Clerk's card directly
        card: 'bg-white shadow-xl rounded-2xl p-6',
        rootBox: 'w-full max-w-[400px]',

        // Header
        headerTitle: 'text-xl font-semibold text-gray-900',
        headerSubtitle: 'text-gray-500',

        // Form elements
        formButtonPrimary: 'bg-[#fe7f2d] hover:bg-[#e56d1f] text-white shadow-none font-medium',
        formFieldInput: 'border-gray-300 focus:border-[#fe7f2d] focus:ring-[#fe7f2d] focus:ring-1',
        formFieldLabel: 'text-gray-700 font-medium',

        // Links
        footerActionLink: 'text-[#fe7f2d] hover:text-[#e56d1f] font-medium',

        // Dividers
        dividerLine: 'bg-gray-200',
        dividerText: 'text-gray-400 text-sm',

        // Social buttons
        socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50 text-gray-700',
        socialButtonsBlockButtonText: 'font-medium',

        // Footer - hide Clerk branding completely
        footer: 'hidden',
        footerAction: 'hidden',
        footerItem: 'hidden',
        footerPages: 'hidden',
        footerPagesLink: 'hidden',

        // Hide development mode badge
        badge: 'hidden',

        // Identity preview (shows "Last used")
        identityPreview: 'hidden',
        identityPreviewText: 'hidden',
        identityPreviewEditButton: 'hidden',

        // Alert styling
        alert: 'border-[#fe7f2d] bg-orange-50',
        alertText: 'text-gray-700',
    },
}

export default async function SignUpPage({ searchParams }) {
    const params = await searchParams
    const refCode = params?.ref || null

    return (
        <div
            className="min-h-screen w-full bg-gray-900 bg-cover bg-center bg-fixed bg-no-repeat flex flex-col items-center justify-center px-4 py-8"
            style={{ backgroundImage: "url('/img/marketing-background.jpeg')" }}
        >
            {refCode && <ReferralCapture code={refCode} />}

            {/* Logo */}
            <Link href="https://askcarlo.ai" className="mb-8">
                <CarloWordmark
                    width={300}
                    height={60}
                    className="text-gray-900"
                />
            </Link>

            {/* Referral banner */}
            {refCode && (
                <div className="mb-4 w-full max-w-[400px] px-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl text-center border border-white/50 shadow-sm">
                    <p className="text-sm text-gray-700">
                        🎉 You were invited to Carlo! Chat with our AI assistant and you&apos;ll both earn free tokens.
                    </p>
                </div>
            )}

            {/* Clerk SignUp Component */}
            <SignUp
                afterSignUpUrl="/home"
                signInUrl="/sign-in"
                appearance={clerkAppearance}
            />
        </div>
    )
}
