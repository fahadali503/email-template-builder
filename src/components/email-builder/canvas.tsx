'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEmailBuilder } from '@/store/email-builder'
import { DraggableBlock } from './draggable-block'
import { DropIndicator } from './drop-indicator'
import { useDragDropContext } from './drag-drop-context'
import { cn } from '@/lib/utils'

interface EmailCanvasProps {
    className?: string
    showGrid?: boolean
}

export const EmailCanvas: React.FC<EmailCanvasProps> = ({
    className,
    showGrid = false,
}) => {
    const { template, selectedBlockId, isPreviewMode } = useEmailBuilder()
    const { activeId, overId } = useDragDropContext()

    const { isOver, setNodeRef } = useDroppable({
        id: 'canvas',
        data: {
            type: 'canvas',
            accepts: ['block-library', 'block'],
        },
    })

    const blocks = template.blocks || []
    const isEmpty = blocks.length === 0
    const isDropping = isOver && activeId

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'relative w-full transition-all duration-300',
                // Height handling
                className?.includes('min-h-full') ? 'min-h-full' : 'min-h-96',
                // Base styles
                'bg-white border-2 border-dashed border-slate-200 rounded-xl shadow-lg shadow-slate-200/30',
                // Grid background (optional)
                showGrid && 'bg-grid-pattern',
                // Drop states
                isDropping && 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-xl shadow-blue-200/30',
                // Preview mode adjustments
                isPreviewMode && 'border-solid border-slate-300 shadow-xl',
                className
            )}
            style={{
                backdropFilter: 'blur(10px)',
                backgroundImage: showGrid
                    ? 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)'
                    : undefined,
                backgroundSize: showGrid ? '20px 20px' : undefined,
            }}
        >
            {/* Empty state */}
            {isEmpty && !isDropping && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-slate-500 space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-slate-700">
                                Start building your email
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                Drag components from the sidebar to get started
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Drop indicator for empty canvas */}
            {isEmpty && isDropping && (
                <div className="absolute inset-4 flex items-center justify-center">
                    <div className="text-center text-blue-600 space-y-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                        <div className="text-lg font-semibold">
                            Drop your component here
                        </div>
                    </div>
                </div>
            )}

            {/* Blocks */}
            {!isEmpty && (
                <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
                    <div className="p-4 space-y-2">
                        {blocks.map((block, index) => (
                            <React.Fragment key={block.id}>
                                {/* Drop indicator before first block */}
                                {index === 0 && (
                                    <DropIndicator
                                        blockId={block.id}
                                        position="before"
                                        isVisible={overId === block.id && activeId !== block.id}
                                    />
                                )}

                                {/* The actual block */}
                                <DraggableBlock
                                    block={block}
                                    isSelected={selectedBlockId === block.id && !isPreviewMode}
                                    isPreviewMode={isPreviewMode}
                                />

                                {/* Drop indicator after each block */}
                                <DropIndicator
                                    blockId={block.id}
                                    position="after"
                                    isVisible={overId === block.id && activeId !== block.id}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                </SortableContext>
            )}

            {/* Global drop indicator for canvas */}
            {isDropping && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full border-2 border-blue-400 rounded-lg animate-pulse" />
                </div>
            )}
        </div>
    )
}

// Enhanced Canvas with Responsive Preview
interface ResponsiveCanvasProps extends EmailCanvasProps {
    device?: 'desktop' | 'mobile'
}

export const ResponsiveCanvas: React.FC<ResponsiveCanvasProps> = ({
    device = 'desktop',
    ...props
}) => {
    return (
        <div
            className={cn(
                'mx-auto transition-all duration-300',
                device === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
            )}
        >
            <EmailCanvas {...props} />
        </div>
    )
}

// Canvas with Template Settings Preview
export const PreviewCanvas: React.FC<EmailCanvasProps> = (props) => {
    const { template } = useEmailBuilder()
    const settings = template.settings

    return (
        <div
            className="w-full"
            style={{
                backgroundColor: settings?.backgroundColor || '#f3f4f6',
                fontFamily: settings?.fontFamily || 'Arial, sans-serif',
            }}
        >
            <div
                className="mx-auto"
                style={{
                    maxWidth: `${settings?.width || 600}px`,
                }}
            >
                <EmailCanvas
                    {...props}
                    className={cn(
                        'border-none rounded-none',
                        props.className
                    )}
                />
            </div>
        </div>
    )
}