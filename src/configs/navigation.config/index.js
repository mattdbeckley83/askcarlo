import {
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'

const navigationConfig = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'items',
        path: '/items',
        title: 'My Items',
        translateKey: 'nav.items',
        icon: 'items',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'import',
        path: '/import',
        title: 'Import',
        translateKey: 'nav.import',
        icon: 'import',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'trips',
        path: '/trips',
        title: 'My Trips',
        translateKey: 'nav.trips',
        icon: 'trips',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'carlo',
        path: '/carlo',
        title: 'Carlo',
        translateKey: 'nav.carlo',
        icon: 'carlo',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
]

export default navigationConfig
