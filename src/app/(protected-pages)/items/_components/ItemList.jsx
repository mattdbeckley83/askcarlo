'use client'

import { useState, useMemo } from 'react'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { PiMagnifyingGlass, PiPlus, PiCaretUp, PiCaretDown, PiCaretUpDown } from 'react-icons/pi'
import AddItemModal from './AddItemModal'
import EditItemModal from './EditItemModal'

const { Tr, Th, Td, THead, TBody } = Table

const CategoryBadge = ({ name, color }) => {
    return (
        <div className="flex items-center gap-2">
            <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color || '#6b7280' }}
            />
            <span>{name || 'Uncategorized'}</span>
        </div>
    )
}

const formatWeight = (weight, unit) => {
    if (!weight) return '—'
    return `${weight} ${unit || 'oz'}`
}

const SortableHeader = ({ label, sortKey, currentSort, onSort }) => {
    const isActive = currentSort.key === sortKey
    const direction = isActive ? currentSort.direction : null

    return (
        <button
            onClick={() => onSort(sortKey)}
            className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group"
        >
            <span>{label}</span>
            <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                {direction === 'asc' ? (
                    <PiCaretUp className="w-4 h-4" />
                ) : direction === 'desc' ? (
                    <PiCaretDown className="w-4 h-4" />
                ) : (
                    <PiCaretUpDown className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                )}
            </span>
        </button>
    )
}

const ItemList = ({ items = [], categories = [], itemTypes = [] }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [sort, setSort] = useState({ key: 'name', direction: 'asc' })

    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat
            return acc
        }, {})
    }, [categories])

    const itemTypeMap = useMemo(() => {
        return itemTypes.reduce((acc, type) => {
            acc[type.id] = type
            return acc
        }, {})
    }, [itemTypes])

    const handleSort = (key) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    const filteredAndSortedItems = useMemo(() => {
        // Filter
        let result = items
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = items.filter((item) => {
                const category = categoryMap[item.category_id]
                return (
                    item.name?.toLowerCase().includes(query) ||
                    item.brand?.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query) ||
                    category?.name?.toLowerCase().includes(query)
                )
            })
        }

        // Sort
        const { key, direction } = sort
        const multiplier = direction === 'asc' ? 1 : -1

        return [...result].sort((a, b) => {
            let aVal, bVal

            switch (key) {
                case 'type':
                    aVal = itemTypeMap[a.item_type_id]?.name || ''
                    bVal = itemTypeMap[b.item_type_id]?.name || ''
                    break
                case 'category':
                    aVal = categoryMap[a.category_id]?.name || ''
                    bVal = categoryMap[b.category_id]?.name || ''
                    break
                case 'name':
                    aVal = a.name || ''
                    bVal = b.name || ''
                    break
                case 'brand':
                    aVal = a.brand || ''
                    bVal = b.brand || ''
                    break
                case 'description':
                    aVal = a.description || ''
                    bVal = b.description || ''
                    break
                case 'weight':
                    aVal = a.weight || 0
                    bVal = b.weight || 0
                    return (aVal - bVal) * multiplier
                case 'calories':
                    aVal = a.calories || 0
                    bVal = b.calories || 0
                    return (aVal - bVal) * multiplier
                default:
                    return 0
            }

            return aVal.localeCompare(bVal) * multiplier
        })
    }, [items, searchQuery, sort, categoryMap, itemTypeMap])

    const handleRowClick = (item) => {
        setSelectedItem(item)
        setIsEditModalOpen(true)
    }

    const handleEditModalClose = () => {
        setIsEditModalOpen(false)
        setSelectedItem(null)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search items..."
                        prefix={<PiMagnifyingGlass className="text-lg" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    variant="solid"
                    icon={<PiPlus />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add Item
                </Button>
            </div>

            <Card>
                <Table>
                    <THead>
                        <Tr>
                            <Th>
                                <SortableHeader
                                    label="Type"
                                    sortKey="type"
                                    currentSort={sort}
                                    onSort={handleSort}
                                />
                            </Th>
                            <Th>
                                <SortableHeader
                                    label="Category"
                                    sortKey="category"
                                    currentSort={sort}
                                    onSort={handleSort}
                                />
                            </Th>
                            <Th>
                                <SortableHeader
                                    label="Item Name"
                                    sortKey="name"
                                    currentSort={sort}
                                    onSort={handleSort}
                                />
                            </Th>
                            <Th>
                                <SortableHeader
                                    label="Brand"
                                    sortKey="brand"
                                    currentSort={sort}
                                    onSort={handleSort}
                                />
                            </Th>
                            <Th>
                                <SortableHeader
                                    label="Description"
                                    sortKey="description"
                                    currentSort={sort}
                                    onSort={handleSort}
                                />
                            </Th>
                            <Th>
                                <SortableHeader
                                    label="Weight"
                                    sortKey="weight"
                                    currentSort={sort}
                                    onSort={handleSort}
                                />
                            </Th>
                            <Th>
                                <SortableHeader
                                    label="Calories"
                                    sortKey="calories"
                                    currentSort={sort}
                                    onSort={handleSort}
                                />
                            </Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {filteredAndSortedItems.length === 0 ? (
                            <Tr>
                                <Td colSpan={7} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        {items.length === 0 ? (
                                            <>
                                                <p className="text-lg font-medium">No items yet</p>
                                                <p className="text-sm">Add your first item to get started</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-lg font-medium">No results found</p>
                                                <p className="text-sm">Try adjusting your search</p>
                                            </>
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ) : (
                            filteredAndSortedItems.map((item) => {
                                const category = categoryMap[item.category_id]
                                const itemType = itemTypeMap[item.item_type_id]
                                return (
                                    <Tr
                                        key={item.id}
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        onClick={() => handleRowClick(item)}
                                    >
                                        <Td>
                                            <span className="capitalize">
                                                {itemType?.name || '—'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <CategoryBadge
                                                name={category?.name}
                                                color={category?.color}
                                            />
                                        </Td>
                                        <Td>
                                            <span className="font-medium">{item.name}</span>
                                        </Td>
                                        <Td>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {item.brand || '—'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {item.description || '—'}
                                            </span>
                                        </Td>
                                        <Td>{formatWeight(item.weight, item.weight_unit)}</Td>
                                        <Td>
                                            {itemType?.name?.toLowerCase() === 'food' && item.calories
                                                ? `${item.calories} cal`
                                                : '—'}
                                        </Td>
                                    </Tr>
                                )
                            })
                        )}
                    </TBody>
                </Table>
            </Card>

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                categories={categories}
                itemTypes={itemTypes}
            />

            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                item={selectedItem}
                categories={categories}
                itemTypes={itemTypes}
            />
        </div>
    )
}

export default ItemList
