import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Capture 100% of transactions in production for now; tune down once volume increases
    tracesSampleRate: 1.0,

    // Session replay: capture 10% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
        Sentry.replayIntegration(),
    ],

    // Only enable in production
    enabled: process.env.NODE_ENV === 'production',
})
