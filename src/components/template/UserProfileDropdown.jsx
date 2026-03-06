'use client'
import { useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { PiUserDuotone, PiSignOutDuotone, PiUserCircleDuotone, PiQuestionDuotone } from 'react-icons/pi'

const dropdownItemList = [
    {
        label: 'Profile',
        path: '/profile',
        icon: <PiUserCircleDuotone />,
    },
    {
        label: 'Support',
        path: '/support',
        icon: <PiQuestionDuotone />,
    },
]

const _UserDropdown = () => {
    const { session, isLoaded } = useCurrentSession()
    const { signOut } = useClerk()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSignOut = async () => {
        await signOut({ redirectUrl: '/sign-in' })
    }

    const avatarProps = {
        ...(mounted && isLoaded && session?.user?.image
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
                            {mounted && isLoaded ? (session?.user?.name || 'Anonymous') : '\u00A0'}
                        </div>
                        <div className="text-xs">
                            {mounted && isLoaded ? (session?.user?.email || 'No email available') : '\u00A0'}
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
