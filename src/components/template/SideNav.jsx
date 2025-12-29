'use client'
import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useTheme from '@/utils/hooks/useTheme'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import useNavigation from '@/utils/hooks/useNavigation'
import queryRoute from '@/utils/queryRoute'
import appConfig from '@/configs/app.config'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_CONTENT_GUTTER,
    HEADER_HEIGHT,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
    translationSetup = appConfig.activeNavTranslation,
    background = true,
    className,
    contentClass,
    mode,
}) => {
    const pathname = usePathname()

    const route = queryRoute(pathname)

    const { navigationTree } = useNavigation()

    const defaultMode = useTheme((state) => state.mode)
    const direction = useTheme((state) => state.direction)
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const currentRouteKey = route?.key || ''
    const { session } = useCurrentSession()

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav hidden lg:block',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <div className={classNames('side-nav-content', contentClass)}>
                <Link
                    href={appConfig.authenticatedEntryPath}
                    className={classNames(
                        'flex items-center',
                        LOGO_X_GUTTER,
                        sideNavCollapse && 'justify-center px-0'
                    )}
                    style={{ height: HEADER_HEIGHT }}
                >
                    {!sideNavCollapse && (
                        <Image
                            src="/img/logo/yonderlust-wordmark-black.png"
                            alt="Yonderlust"
                            width={160}
                            height={32}
                            className="dark:invert"
                            priority
                        />
                    )}
                </Link>
                <ScrollBar style={{ height: `calc(100% - ${HEADER_HEIGHT}px)` }} direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={navigationTree}
                        routeKey={currentRouteKey}
                        direction={direction}
                        translationSetup={translationSetup}
                        userAuthority={session?.user?.authority || []}
                    />
                </ScrollBar>
            </div>
        </div>
    )
}

export default SideNav
