'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Copy, Trash2, GripVertical, Settings, Plus } from 'lucide-react'
import { useEmailBuilder } from '@/store/email-builder'
import { EmailBlock, ContainerBlock, ColumnsBlock } from '@/types/email-builder'
import { EmailBlockRenderer } from './blocks'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DropIndicator } from './drop-indicator'
import { useDragDropContext } from './drag-drop-context'

interface DraggableBlockProps {
    block: EmailBlock
    isSelected: boolean
    isPreviewMode: boolean
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
    block,
    isSelected,
    isPreviewMode,
}) => {
    const {
        selectBlock,
        removeBlock,
        duplicateBlock,
    } = useEmailBuilder()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: block.id,
        data: {
            type: 'block',
            block,
        },
        disabled: isPreviewMode,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!isPreviewMode) {
            selectBlock(isSelected ? null : block.id)
        }
    }

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation()
        duplicateBlock(block.id)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        removeBlock(block.id)
    }

    // Check if this is a container or columns block that can have children
    const canHaveChildren = block.type === 'container' || block.type === 'columns'

    if (isPreviewMode) {
        return (
            <div className="w-full">
                <EmailBlockRenderer block={block} />
            </div>
        )
    }

    // Render nested blocks for containers and columns
    if (canHaveChildren) {
        return (
            <NestedBlockContainer
                block={block as ContainerBlock | ColumnsBlock}
                isSelected={isSelected}
                isPreviewMode={isPreviewMode}
                style={style}
                isDragging={isDragging}
                attributes={attributes}
                listeners={listeners}
                setNodeRef={setNodeRef}
                onSelect={handleSelect}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
            />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative transition-all duration-200',
                isDragging && 'opacity-50 scale-105 rotate-1 z-50'
            )}
        >
            {/* Selection Outline */}
            <div
                onClick={handleSelect}
                className={cn(
                    'relative border-2 border-transparent rounded-lg cursor-pointer transition-all',
                    isSelected && 'border-blue-500 ring-2 ring-blue-200',
                    !isSelected && 'hover:border-gray-300'
                )}
            >
                {/* Block Content */}
                <div className="relative">
                    <EmailBlockRenderer block={block} />

                    {/* Hover Overlay */}
                    <div
                        className={cn(
                            'absolute inset-0 bg-blue-500 bg-opacity-5 rounded transition-opacity',
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}
                    />
                </div>

                {/* Controls Toolbar */}
                <div
                    className={cn(
                        'absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl shadow-xl shadow-slate-400/30 flex items-center space-x-1 px-3 py-2 text-xs transition-all backdrop-blur-sm',
                        isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                    )}
                >
                    {/* Drag Handle */}
                    <div
                        className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200"
                        {...listeners}
                        {...attributes}
                    >
                        <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Block Type Label */}
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-semibold capitalize backdrop-blur-sm">
                        {block.type}
                    </span>

                    {/* Action Buttons */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white hover:bg-white/10 hover:scale-105 transition-all duration-200"
                        onClick={handleDuplicate}
                        title="Duplicate block"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white hover:bg-red-500/20 hover:scale-105 transition-all duration-200"
                        onClick={handleDelete}
                        title="Delete block"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                    <div className="absolute -inset-1 border-2 border-blue-500 rounded-lg pointer-events-none animate-pulse" />
                )}
            </div>
        </div>
    )
}

// Nested Block Container for Container and Columns blocks
interface NestedBlockContainerProps {
    block: ContainerBlock | ColumnsBlock
    isSelected: boolean
    isPreviewMode: boolean
    style: any
    isDragging: boolean
    attributes: any
    listeners: any
    setNodeRef: any
    onSelect: (e: React.MouseEvent) => void
    onDuplicate: (e: React.MouseEvent) => void
    onDelete: (e: React.MouseEvent) => void
}

const NestedBlockContainer: React.FC<NestedBlockContainerProps> = ({
    block,
    isSelected,
    isPreviewMode,
    style,
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    onSelect,
    onDuplicate,
    onDelete,
}) => {
    const { activeId, overId } = useDragDropContext()
    const children = block.children || []

    // Setup drop zone for this container
    const { isOver, setNodeRef: setDropRef } = useDroppable({
        id: `${block.id}-dropzone`,
        data: {
            type: 'container',
            containerId: block.id,
            accepts: ['block-library', 'block'],
        },
    })

    const isDropping = isOver && activeId && activeId !== block.id

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative transition-all duration-200',
                isDragging && 'opacity-50 scale-105 rotate-1 z-50'
            )}
        >
            {/* Container Selection Outline */}
            <div
                onClick={onSelect}
                className={cn(
                    'relative border-2 border-dashed rounded-xl cursor-pointer transition-all min-h-[80px] backdrop-blur-sm',
                    isSelected && 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-lg shadow-blue-200/30',
                    !isSelected && 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50',
                    isDropping && 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50/50 shadow-lg shadow-emerald-200/30'
                )}
            >
                {/* Container Header */}
                <div className="relative">
                    {/* Container Type Label */}
                    <div
                        className={cn(
                            'absolute -top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded z-10 transition-opacity capitalize',
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}
                    >
                        {block.type} container
                    </div>

                    {/* Container Controls Toolbar */}
                    <div
                        className={cn(
                            'absolute -top-3 right-2 bg-blue-600 text-white rounded-md shadow-lg flex items-center space-x-1 px-2 py-1 text-xs transition-all z-10',
                            isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                        )}
                    >
                        {/* Drag Handle */}
                        <div
                            className="cursor-grab active:cursor-grabbing p-1 hover:bg-blue-700 rounded"
                            {...listeners}
                            {...attributes}
                        >
                            <GripVertical className="w-3 h-3" />
                        </div>

                        {/* Block Type Label */}
                        <span className="px-2 py-1 bg-blue-700 rounded text-xs font-medium capitalize">
                            {block.type}
                        </span>

                        {/* Action Buttons */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-blue-700"
                            onClick={onDuplicate}
                            title="Duplicate container"
                        >
                            <Copy className="w-3 h-3" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-red-600"
                            onClick={onDelete}
                            title="Delete container"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                {/* Nested Content Area */}
                <div
                    ref={setDropRef}
                    className={cn(
                        'p-4 min-h-[60px] rounded-lg transition-all',
                        isDropping && 'bg-green-100 border-green-300'
                    )}
                >
                    {/* Column Layout for Columns Block */}
                    {block.type === 'columns' ? (
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${(block as ColumnsBlock).props.columns}, 1fr)` }}>
                            {Array.from({ length: (block as ColumnsBlock).props.columns }, (_, columnIndex) => {
                                const columnChildren = children.filter((_, i) => i % (block as ColumnsBlock).props.columns === columnIndex)

                                return (
                                    <div
                                        key={columnIndex}
                                        className={cn(
                                            'min-h-[40px] border border-dashed border-gray-200 rounded p-2',
                                            isDropping && 'border-green-300'
                                        )}
                                    >
                                        {columnChildren.length > 0 ? (
                                            <div className="space-y-2">
                                                {columnChildren.map((child, index) => (
                                                    <React.Fragment key={child.id}>
                                                        {index === 0 && (
                                                            <DropIndicator
                                                                blockId={child.id}
                                                                position="before"
                                                                isVisible={overId === child.id && activeId !== child.id}
                                                            />
                                                        )}
                                                        <DraggableBlock
                                                            block={child}
                                                            isSelected={false}
                                                            isPreviewMode={isPreviewMode}
                                                        />
                                                        <DropIndicator
                                                            blockId={child.id}
                                                            position="after"
                                                            isVisible={overId === child.id && activeId !== child.id}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-12 text-gray-400 text-xs">
                                                <Plus className="w-4 h-4 mr-1" />
                                                Drop here
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        /* Container Layout */
                        <div className="space-y-2">
                            {children.length > 0 ? (
                                children.map((child, index) => (
                                    <React.Fragment key={child.id}>
                                        {index === 0 && (
                                            <DropIndicator
                                                blockId={child.id}
                                                position="before"
                                                isVisible={overId === child.id && activeId !== child.id}
                                            />
                                        )}
                                        <DraggableBlock
                                            block={child}
                                            isSelected={false}
                                            isPreviewMode={isPreviewMode}
                                        />
                                        <DropIndicator
                                            blockId={child.id}
                                            position="after"
                                            isVisible={overId === child.id && activeId !== child.id}
                                        />
                                    </React.Fragment>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Drop blocks here
                                </div>
                            )}
                        </div>
                    )}

                    {/* Drop Indicator for Container */}
                    {isDropping && (
                        <div className="absolute inset-2 pointer-events-none">
                            <div className="w-full h-full border-2 border-green-400 border-dashed rounded-lg animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                    <div className="absolute -inset-1 border-2 border-blue-500 rounded-lg pointer-events-none animate-pulse" />
                )}
            </div>
        </div>
    )
}

// Wrapper for blocks that can contain children
interface ContainerBlockWrapperProps {
    block: EmailBlock
    isSelected: boolean
    isPreviewMode: boolean
    children: React.ReactNode
}

export const ContainerBlockWrapper: React.FC<ContainerBlockWrapperProps> = ({
    block,
    isSelected,
    isPreviewMode,
    children,
}) => {
    const { selectBlock } = useEmailBuilder()

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!isPreviewMode) {
            selectBlock(isSelected ? null : block.id)
        }
    }

    return (
        <div
            onClick={handleSelect}
            className={cn(
                'relative min-h-[60px] border-2 border-dashed border-transparent rounded-lg transition-all',
                isSelected && 'border-blue-300 bg-blue-50',
                !isSelected && !isPreviewMode && 'hover:border-gray-300',
                isPreviewMode && 'border-none'
            )}
        >
            {/* Container Label */}
            {!isPreviewMode && (
                <div
                    className={cn(
                        'absolute -top-2 left-2 bg-gray-600 text-white text-xs px-2 py-1 rounded transition-opacity capitalize',
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                >
                    {block.type} container
                </div>
            )}

            {/* Container Content */}
            <div className="min-h-[inherit] p-2">
                {children}

                {/* Empty State for Containers */}
                {(!block.children || block.children.length === 0) && !isPreviewMode && (
                    <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
                        Drop blocks here
                    </div>
                )}
            </div>
        </div>
    )
}