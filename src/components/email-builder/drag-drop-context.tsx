'use client'

import React, { createContext, useContext } from 'react'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    closestCorners,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useEmailBuilder } from '@/store/email-builder'
import { DragItem, EmailBlockType } from '@/types/email-builder'
import { getBlockDefinition } from './block-library'
import { DraggableBlockItem } from './block-library'

interface DragDropContextValue {
    activeId: string | null
    overId: string | null
}

const DragDropContext = createContext<DragDropContextValue>({
    activeId: null,
    overId: null,
})

export const useDragDropContext = () => useContext(DragDropContext)

interface EmailBuilderDragDropProviderProps {
    children: React.ReactNode
}

export const EmailBuilderDragDropProvider: React.FC<EmailBuilderDragDropProviderProps> = ({
    children,
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null)
    const [overId, setOverId] = React.useState<string | null>(null)

    const {
        template,
        addBlock,
        moveBlock,
        setDraggedItem,
        draggedItem,
    } = useEmailBuilder()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)

        // Determine if it's a new block from library or existing block
        const isNewBlock = active.data.current?.type === 'block-library'
        const blockType = active.data.current?.blockType as EmailBlockType

        if (isNewBlock && blockType) {
            setDraggedItem({
                id: active.id as string,
                type: blockType,
                isNew: true,
            })
        } else {
            setDraggedItem({
                id: active.id as string,
                type: 'text', // Will be determined from existing block
                isNew: false,
            })
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event
        setOverId(over?.id as string || null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveId(null)
            setOverId(null)
            setDraggedItem(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string
        const isNewBlock = active.data.current?.type === 'block-library'
        const blockType = active.data.current?.blockType as EmailBlockType

        if (isNewBlock && blockType) {
            // Adding new block from library
            const blockDefinition = getBlockDefinition(blockType)
            if (blockDefinition) {
                const newBlock = {
                    type: blockType,
                    props: blockDefinition.defaultProps,
                    style: blockDefinition.defaultStyle,
                }

                // Check if dropping into a container
                const isDroppingIntoContainer = over.data.current?.type === 'container'
                const containerId = over.data.current?.containerId

                if (isDroppingIntoContainer && containerId) {
                    // Add to container
                    addBlock(newBlock, containerId, 'inside')
                } else {
                    // Regular position-based drop
                    const position = over.data.current?.position || 'after'
                    const targetId = overId === 'canvas' ? undefined : overId
                    addBlock(newBlock, targetId, position)
                }
            }
        } else {
            // Moving existing block
            if (activeId !== overId) {
                // Check if dropping into a container
                const isDroppingIntoContainer = over.data.current?.type === 'container'
                const containerId = over.data.current?.containerId

                if (isDroppingIntoContainer && containerId) {
                    // Move to container
                    moveBlock(activeId, containerId, 'inside')
                } else {
                    // Regular position-based move
                    const position = over.data.current?.position || 'after'
                    moveBlock(activeId, overId, position)
                }
            }
        }

        setActiveId(null)
        setOverId(null)
        setDraggedItem(null)
    }

    const handleDragCancel = () => {
        setActiveId(null)
        setOverId(null)
        setDraggedItem(null)
    }

    // Get the dragged block for overlay
    const getDraggedBlock = () => {
        if (!draggedItem) return null

        if (draggedItem.isNew) {
            const blockDefinition = getBlockDefinition(draggedItem.type)
            return blockDefinition ? (
                <DraggableBlockItem block={blockDefinition} isDragging />
            ) : null
        }

        // For existing blocks, we could render a preview here
        return (
            <div className="p-4 bg-white border rounded-lg shadow-lg opacity-80">
                Moving block...
            </div>
        )
    }

    return (
        <DragDropContext.Provider value={{ activeId, overId }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
                <SortableContext
                    items={template.blocks.map(block => block.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {children}
                </SortableContext>

                <DragOverlay>
                    {activeId ? getDraggedBlock() : null}
                </DragOverlay>
            </DndContext>
        </DragDropContext.Provider>
    )
}