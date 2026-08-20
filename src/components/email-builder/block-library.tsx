import React from 'react'
import {
    Type,
    Heading1,
    MousePointer,
    Image,
    Minus,
    Square,
    Columns,
    Grid3X3,
    Code,
    Plus,
} from 'lucide-react'
import { BlockDefinition, EmailBlockType } from '@/types/email-builder'

// Block Library Definitions
export const BLOCK_LIBRARY: BlockDefinition[] = [
    // Basic Blocks
    {
        type: 'text',
        name: 'Text',
        description: 'Add text content to your email',
        icon: <Type className="w-4 h-4" />,
        category: 'basic',
        defaultProps: {
            content: 'Enter your text here...',
            tag: 'p',
        },
        defaultStyle: {
            fontSize: '16px',
            color: '#333333',
            padding: '10px 0',
        },
    },
    {
        type: 'heading',
        name: 'Heading',
        description: 'Add a heading to your email',
        icon: <Heading1 className="w-4 h-4" />,
        category: 'basic',
        defaultProps: {
            content: 'Your Heading',
            level: 'h1',
        },
        defaultStyle: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#333333',
            padding: '20px 0 10px 0',
        },
    },
    {
        type: 'button',
        name: 'Button',
        description: 'Add a clickable button',
        icon: <MousePointer className="w-4 h-4" />,
        category: 'basic',
        defaultProps: {
            text: 'Click Here',
            href: 'https://example.com',
            target: '_blank',
        },
        defaultStyle: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '6px',
            textAlign: 'center',
            margin: '20px 0',
        },
    },
    {
        type: 'image',
        name: 'Image',
        description: 'Add an image to your email',
        icon: <Image className="w-4 h-4" />,
        category: 'basic',
        defaultProps: {
            src: 'https://via.placeholder.com/400x200/e5e7eb/6b7280?text=Image',
            alt: 'Placeholder image',
            width: 400,
            height: 200,
        },
        defaultStyle: {
            width: '100%',
            height: 'auto',
            margin: '10px 0',
        },
    },
    {
        type: 'divider',
        name: 'Divider',
        description: 'Add a horizontal line',
        icon: <Minus className="w-4 h-4" />,
        category: 'basic',
        defaultProps: {
            thickness: 1,
            style: 'solid',
        },
        defaultStyle: {
            margin: '20px 0',
            borderColor: '#e5e7eb',
        },
    },
    {
        type: 'spacer',
        name: 'Spacer',
        description: 'Add vertical spacing',
        icon: <Square className="w-4 h-4" />,
        category: 'basic',
        defaultProps: {
            height: 32,
        },
    },

    // Layout Blocks
    {
        type: 'container',
        name: 'Container',
        description: 'Group content in a container',
        icon: <Grid3X3 className="w-4 h-4" />,
        category: 'layout',
        defaultProps: {
            maxWidth: 600,
        },
        defaultStyle: {
            backgroundColor: '#ffffff',
            padding: '20px',
            margin: '10px 0',
        },
    },
    {
        type: 'columns',
        name: 'Columns',
        description: 'Create multi-column layout',
        icon: <Columns className="w-4 h-4" />,
        category: 'layout',
        defaultProps: {
            columns: 2,
            gap: 16,
        },
        defaultStyle: {
            margin: '10px 0',
        },
    },

    // Advanced Blocks
    {
        type: 'html',
        name: 'HTML',
        description: 'Add custom HTML code',
        icon: <Code className="w-4 h-4" />,
        category: 'advanced',
        defaultProps: {
            content: '<p>Custom HTML content</p>',
        },
    },
]

// Helper functions
export const getBlockDefinition = (type: EmailBlockType): BlockDefinition | undefined => {
    return BLOCK_LIBRARY.find(block => block.type === type)
}

export const getBlocksByCategory = (category: 'basic' | 'layout' | 'advanced'): BlockDefinition[] => {
    return BLOCK_LIBRARY.filter(block => block.category === category)
}

export const getAllCategories = (): string[] => {
    return Array.from(new Set(BLOCK_LIBRARY.map(block => block.category)))
}

// Block Library Component
interface BlockLibraryProps {
    onBlockSelect?: (block: BlockDefinition) => void
    selectedCategory?: string
}

export const BlockLibrary: React.FC<BlockLibraryProps> = ({
    onBlockSelect,
    selectedCategory = 'all',
}) => {
    const categories = getAllCategories()
    const [activeCategory, setActiveCategory] = React.useState(selectedCategory)

    const filteredBlocks = activeCategory === 'all'
        ? BLOCK_LIBRARY
        : getBlocksByCategory(activeCategory as any)

    return (
        <div className="h-full flex flex-col">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 sticky top-0 bg-white pb-2 z-10">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${activeCategory === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${activeCategory === category
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Scrollable Block Grid */}
            <div className="flex-1 overflow-y-auto blocks-scroll">
                {filteredBlocks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 pb-4">
                        {filteredBlocks.map((block) => (
                            <div
                                key={block.type}
                                onClick={() => onBlockSelect?.(block)}
                                className="group flex flex-col items-center space-y-3 p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/30 active:scale-95 relative backdrop-blur-sm"
                            >
                                <div className="flex-shrink-0 text-slate-500 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110">
                                    {React.cloneElement(block.icon as React.ReactElement, {
                                        className: "w-7 h-7"
                                    })}
                                </div>
                                <div className="text-center">
                                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-900 transition-colors">
                                        {block.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                        {block.description}
                                    </p>
                                    {/* Container indicator */}
                                    {(block.type === 'container' || block.type === 'columns') && (
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-sm">
                                                <Plus className="w-3 h-3 mr-1" />
                                                Nestable
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                            <Square className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-500">No blocks found in this category</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Draggable Block Item for DnD
interface DraggableBlockItemProps {
    block: BlockDefinition
    isDragging?: boolean
}

export const DraggableBlockItem: React.FC<DraggableBlockItemProps> = ({
    block,
    isDragging = false,
}) => {
    return (
        <div
            className={`group flex flex-col items-center space-y-3 p-4 border border-slate-200 rounded-xl cursor-grab transition-all duration-300 backdrop-blur-sm ${isDragging
                ? 'opacity-60 scale-110 rotate-2 shadow-2xl shadow-slate-300/50'
                : 'hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-xl hover:shadow-blue-200/30'
                }`}
        >
            <div className="flex-shrink-0 text-slate-500 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110">
                {React.cloneElement(block.icon as React.ReactElement, {
                    className: "w-7 h-7"
                })}
            </div>
            <div className="text-center">
                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-900 transition-colors">
                    {block.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {block.description}
                </p>
                {/* Container indicator */}
                {(block.type === 'container' || block.type === 'columns') && (
                    <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-sm">
                            <Plus className="w-3 h-3 mr-1" />
                            Nestable
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}