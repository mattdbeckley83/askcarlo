'use client'

import { useState } from 'react'
import { PiLightning, PiMapTrifold, PiChatCircle, PiCaretDown } from 'react-icons/pi'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'

const templates = [
    {
        key: 'free_chat',
        label: 'Free Chat',
        description: 'Open conversation with Carlo',
        icon: PiChatCircle,
    },
    {
        key: 'upgrade_gear',
        label: 'Upgrade Gear',
        description: 'Get recommendations to replace an item',
        icon: PiLightning,
    },
    {
        key: 'trip_planning',
        label: 'Trip Planning',
        description: 'Get advice for a specific trip',
        icon: PiMapTrifold,
    },
]

export default function TemplateSelector({ onSelectTemplate }) {
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (templateKey) => {
        setIsOpen(false)
        onSelectTemplate(templateKey)
    }

    const dropdownList = (
        <div className="py-1 min-w-[240px]">
            {templates.map((template) => {
                const Icon = template.icon
                return (
                    <button
                        key={template.key}
                        onClick={() => handleSelect(template.key)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 transition-colors"
                    >
                        <Icon className="w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400" />
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                                {template.label}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {template.description}
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    )

    return (
        <Dropdown
            renderTitle={
                <Button
                    variant="solid"
                    icon={<PiChatCircle />}
                    className="flex items-center gap-2"
                >
                    New Chat
                    <PiCaretDown className="ml-1" />
                </Button>
            }
            placement="bottom-start"
        >
            {dropdownList}
        </Dropdown>
    )
}
