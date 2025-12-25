'use client'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { PiUserDuotone, PiSignOutDuotone, PiUserCircleDuotone } from 'react-icons/pi'

const dropdownItemList = [
    {
        label: 'Profile',
        path: '/profile',
        icon: <PiUserCircleDuotone />,
    },
]

const _UserDropdown = () => {
    const { session, isLoaded } = useCurrentSession()
    const { signOut } = useClerk()

    const handleSignOut = async () => {
        await signOut({ redirectUrl: '/sign-in' })
    }

    // Always render icon on server/initial load to prevent hydration mismatch
    // Only use image after client has loaded
    const avatarProps = {
        ...(isLoaded && session?.user?.image
            ? { src: session?.user?.image }
            : { icon: <PiUserDuotone /> }),
    }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="cursor-pointer flex items-center">
                    <Avatar size={32} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="py-2 px-3 flex items-center gap-3">
                    <Avatar {...avatarProps} />
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {isLoaded ? (session?.user?.name || 'Anonymous') : '\u00A0'}
                        </div>
                        <div className="text-xs">
                            {isLoaded ? (session?.user?.email || 'No email available') : '\u00A0'}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            {dropdownItemList.map((item) => (
                <Dropdown.Item
                    key={item.label}
                    eventKey={item.label}
                    className="px-0"
                >
                    <Link className="flex h-full w-full px-2" href={item.path}>
                        <span className="flex gap-2 items-center w-full">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    </Link>
                </Dropdown.Item>
            ))}
            <Dropdown.Item
                eventKey="Sign Out"
                className="gap-2"
                onClick={handleSignOut}
            >
                <span className="text-xl">
                    <PiSignOutDuotone />
                </span>
                <span>Sign Out</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
