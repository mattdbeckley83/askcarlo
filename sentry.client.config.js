import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: 'https://5ede07871e1e45f6a6c85887ab7dc116@o4510378637393920.ingest.us.sentry.io/4510993874878464',

    // Capture 100% of transactions for now; tune down once volume increases
    tracesSampleRate: 1.0,

    // Session replay: capture 10% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
        Sentry.replayIntegration(),
    ],
})
