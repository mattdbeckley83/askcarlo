import authRoute from './authRoute'

export const protectedRoutes = {
    '/home': {
        key: 'home',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/gear': {
        key: 'gear',
        authority: [],
        meta: {
            pageBackgroundType: 'gray',
            pageContainerType: 'gutterless',
        },
    },
    '/food': {
        key: 'food',
        authority: [],
        meta: {
            pageBackgroundType: 'gray',
            pageContainerType: 'gutterless',
        },
    },
    '/import': {
        key: 'import',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/trips': {
        key: 'trips',
        authority: [],
        meta: {
            pageBackgroundType: 'gray',
            pageContainerType: 'gutterless',
        },
    },
    '/trips/:id': {
        key: 'trips',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    '/conversations': {
        key: 'conversations',
        authority: [],
        meta: {
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    '/profile': {
        key: 'profile',
        authority: [],
        meta: {
            pageBackgroundType: 'gray',
            pageContainerType: 'contained',
        },
    },
    '/categories': {
        key: 'categories',
        authority: [],
        meta: {
            pageBackgroundType: 'gray',
            pageContainerType: 'gutterless',
        },
    },
}

export const publicRoutes = {
    '/dashboard': {
        key: 'dashboard',
        authority: [],
    },
    '/privacy': {
        key: 'privacy',
        authority: [],
    },
}

export const authRoutes = authRoute
