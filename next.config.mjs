import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
    },
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            // 'unsafe-inline' required: Next.js hydration + ThemeProvider inline script
            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.clerk.accounts.dev https://clerk.askcarlo.ai https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.com https://hjgtrlosyxursmzfkliz.supabase.co",
            "font-src 'self' data:",
            "connect-src 'self' https://hjgtrlosyxursmzfkliz.supabase.co wss://hjgtrlosyxursmzfkliz.supabase.co https://*.clerk.accounts.dev https://clerk.askcarlo.ai https://accounts.askcarlo.ai https://api.stripe.com https://accounts.google.com https://o4510378637393920.ingest.us.sentry.io",
            "frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self' https://checkout.stripe.com",
        ].join('; '),
    },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ]
    },
}

export default withSentryConfig(withNextIntl(nextConfig), {
    org: 'askcarlo-app',
    project: 'carlo',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    hideSourceMaps: true,
});
