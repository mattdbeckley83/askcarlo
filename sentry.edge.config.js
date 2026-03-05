import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: 'https://5ede07871e1e45f6a6c85887ab7dc116@o4510378637393920.ingest.us.sentry.io/4510993874878464',

    tracesSampleRate: 1.0,
})
