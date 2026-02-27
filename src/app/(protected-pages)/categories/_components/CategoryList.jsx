'use client'

import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { PiMagnifyingGlass, PiPlus } from 'react-icons/pi'
import { getCategoryColor } from '@/lib/constants/colors'
import AddCategoryModal from './AddCategoryModal'
import EditCategoryModal from './EditCategoryModal'

const { Tr, Th, Td, THead, TBody } = Table

const CategoryList = ({ categories }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categories
        const q = searchQuery.toLowerCase()
        return categories.filter((c) => c.name.toLowerCase().includes(q))
    }, [categories, searchQuery])

    const nextColor = getCategoryColor(categories.length)

    const handleRowClick = (category) => {
        setSelectedCategory(category)
        setIsEditModalOpen(true)
    }

    const handleEditClose = () => {
        setIsEditModalOpen(false)
        setSelectedCategory(null)
    }

    return (
        <>
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        Categories
                    </h1>
                    <div className="flex-1">
                        <Input
                            placeholder="Search categories..."
                            prefix={<PiMagnifyingGlass className="text-lg" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="solid"
                        className="!bg-[#fe7f2d] hover:!bg-[#e86f1d]"
                        icon={<PiPlus />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Category
                    </Button>
                </div>

                {filteredCategories.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                        {searchQuery
                            ? 'No categories match your search.'
                            : 'No categories yet. Categories are created automatically when you add gear or food items, or you can create one here.'}
                    </p>
                ) : (
                    <Table>
                        <THead>
                            <Tr>
                                <Th className="w-[52px]" />
                                <Th>Name</Th>
                                <Th className="w-[100px]">Items</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {filteredCategories.map((category) => (
                                <Tr
                                    key={category.id}
                                    className="cursor-pointer"
                                    onClick={() => handleRowClick(category)}
                                >
                                    <Td>
                                        <span
                                            className="block w-5 h-5 rounded-full"
                                            style={{ backgroundColor: category.color || '#6b7280' }}
                                        />
                                    </Td>
                                    <Td>
                                        <span className="font-medium">
                                            {category.name}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {category.itemCount}
                                        </span>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>

            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                defaultColor={nextColor}
            />

            <EditCategoryModal
                isOpen={isEditModalOpen}
                onClose={handleEditClose}
                category={selectedCategory}
            />
        </>
    )
}

export default CategoryList
