'use client'

import * as Sentry from '@sentry/nextjs'

// Module-level init runs once on page load. The typeof window guard
// prevents this from executing during server-side rendering.
if (typeof window !== 'undefined') {
    Sentry.init({
        dsn: 'https://83e8aaef59485cb0231038bf707df4e9@o4510378637393920.ingest.us.sentry.io/4510994238472192',
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        integrations: [Sentry.replayIntegration()],
    })
}

export default function SentryProvider() {
    return null
}
