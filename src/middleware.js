import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
])

const allowedOrigins = [
    'https://app.askcarlo.ai',
    'http://localhost:3000',
    'http://localhost:3001',
]

function isAllowedOrigin(origin) {
    if (!origin) return false
    if (allowedOrigins.includes(origin)) return true
    // Allow Vercel preview deployments
    if (/^https:\/\/askcarlo[^.]*\.vercel\.app$/.test(origin)) return true
    return false
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export default async function middleware(req, event) {
    const origin = req.headers.get('origin')

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS' && isAllowedOrigin(origin)) {
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                'Access-Control-Allow-Headers':
                    'Content-Type, Authorization, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, RSC',
                'Access-Control-Max-Age': '86400',
            },
        })
    }

    const response = await clerkHandler(req, event)

    // Add CORS headers to all responses for allowed origins
    if (origin && isAllowedOrigin(origin) && response) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Vary', 'Origin')
    }

    return response
}

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}
