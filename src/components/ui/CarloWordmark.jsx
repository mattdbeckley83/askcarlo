'use client'

/**
 * Carlo Wordmark Component
 * Uses the National Park typeface (Extra Bold)
 *
 * To use this component:
 * 1. Download the National Park font from https://nationalparktypeface.com/
 * 2. Place the WOFF2 file at: public/fonts/NationalPark-ExtraBold.woff2
 *    (or update the font-face src below to match your file name)
 */

const CarloWordmark = ({
    className = '',
    width = 160,
    height = 32,
    color = 'currentColor'
}) => {
    return (
        <>
            <style jsx>{`
                @font-face {
                    font-family: 'National Park';
                    src: url('/fonts/woff2/NationalPark-ExtraBold.woff2') format('woff2');
                    font-weight: 800;
                    font-style: normal;
                    font-display: swap;
                }
                .carlo-wordmark {
                    font-family: 'National Park', system-ui, sans-serif;
                    font-weight: 800;
                    letter-spacing: 0.02em;
                    line-height: 1;
                }
            `}</style>
            <svg
                width={width}
                height={height}
                viewBox="0 0 160 32"
                className={className}
                role="img"
                aria-label="Carlo"
            >
                <text
                    x="0"
                    y="26"
                    className="carlo-wordmark"
                    fill={color}
                    fontSize="32"
                >
                    Carlo
                </text>
            </svg>
        </>
    )
}

export default CarloWordmark
