import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import Image from 'next/image'

const LOGO_SRC_PATH = '/img/logo/'

const Logo = (props) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth,
        logoHeight,
    } = props

    // Intrinsic dimensions for Next.js Image (used for aspect ratio calculation)
    // Full logos: ~1.84:1 aspect ratio, Streamline logos: ~1.3:1 aspect ratio
    const intrinsicWidth = type === 'full' ? 184 : 130
    const intrinsicHeight = type === 'full' ? 100 : 100

    // Display height (width will auto-scale to maintain aspect ratio)
    const displayHeight = logoHeight || 40

    return (
        <div className={classNames('logo', className)} style={style}>
            {mode === 'light' && (
                <>
                    <Image
                        className={classNames(
                            '',
                            type === 'full' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo-light-full.png`}
                        alt={`${APP_NAME} logo`}
                        width={intrinsicWidth}
                        height={intrinsicHeight}
                        style={{ height: displayHeight, width: 'auto' }}
                        priority
                    />
                    <Image
                        className={classNames(
                            '',
                            type === 'streamline' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo-light-streamline.png`}
                        alt={`${APP_NAME} logo`}
                        width={intrinsicWidth}
                        height={intrinsicHeight}
                        style={{ height: displayHeight, width: 'auto' }}
                        priority
                    />
                </>
            )}
            {mode === 'dark' && (
                <>
                    <Image
                        className={classNames(
                            type === 'full' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo-dark-full.png`}
                        alt={`${APP_NAME} logo`}
                        width={intrinsicWidth}
                        height={intrinsicHeight}
                        style={{ height: displayHeight, width: 'auto' }}
                        priority
                    />
                    <Image
                        className={classNames(
                            type === 'streamline' ? '' : 'hidden',
                            imgClass,
                        )}
                        src={`${LOGO_SRC_PATH}logo-dark-streamline.png`}
                        alt={`${APP_NAME} logo`}
                        width={intrinsicWidth}
                        height={intrinsicHeight}
                        style={{ height: displayHeight, width: 'auto' }}
                        priority
                    />
                </>
            )}
        </div>
    )
}

export default Logo
