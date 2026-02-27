import { PiUserCircleDuotone, PiSparkleDuotone } from 'react-icons/pi'

const NavIcon = ({ src, alt, className = '' }) => (
    <img
        src={src}
        alt={alt}
        className={`w-7 h-7 brightness-0 dark:invert ${className}`}
    />
)

const navigationIcon = {
    home: <NavIcon src="/img/logo/dashboard.png" alt="Home" />,
    gear: <NavIcon src="/img/logo/backpack.png" alt="My Gear" />,
    food: <NavIcon src="/img/logo/food.png" alt="My Food" />,
    categories: <NavIcon src="/img/logo/categories.png" alt="Categories" className="opacity-60" />,
    trips: <NavIcon src="/img/logo/trips.png" alt="My Trips" />,
    carlo: <PiSparkleDuotone className="w-7 h-7 opacity-70" />,
    profile: <PiUserCircleDuotone />,
}

export default navigationIcon
