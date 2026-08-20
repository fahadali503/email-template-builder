'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface DropIndicatorProps {
  blockId: string
  position: 'before' | 'after' | 'inside'
  isVisible: boolean
  className?: string
}

export const DropIndicator: React.FC<DropIndicatorProps> = ({
  blockId,
  position,
  isVisible,
  className,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `${blockId}-${position}`,
    data: {
      type: 'drop-indicator',
      blockId,
      position,
    },
  })

  if (!isVisible && !isOver) {
    return null
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative transition-all duration-200',
        position === 'inside' ? 'min-h-[40px] my-1' : 'h-1 my-1',
        className
      )}
    >
      {/* Drop Line */}
      <div
        className={cn(
          'absolute inset-x-0 bg-blue-500 rounded-full transition-all duration-200',
          position === 'inside' 
            ? 'inset-y-0 border-2 border-blue-500 border-dashed bg-blue-50 rounded-lg'
            : 'h-0.5 top-1/2 -translate-y-1/2',
          isOver && 'bg-blue-600 shadow-lg',
          isVisible || isOver ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      />

      {/* Drop Indicator Dots */}
      {(isVisible || isOver) && position !== 'inside' && (
        <>
          <div
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full transition-all duration-200',
              isOver && 'bg-blue-600 scale-125'
            )}
          />
          <div
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full transition-all duration-200',
              isOver && 'bg-blue-600 scale-125'
            )}
          />
        </>
      )}

      {/* Drop Zone Label for Container Drops */}
      {position === 'inside' && (isVisible || isOver) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'bg-blue-500 text-white text-xs px-3 py-1 rounded-full transition-all duration-200',
              isOver && 'bg-blue-600 scale-110'
            )}
          >
            Drop inside container
          </div>
        </div>
      )}
    </div>
  )
}

// Simplified drop indicator for mobile or compact views
export const CompactDropIndicator: React.FC<Omit<DropIndicatorProps, 'className'>> = (props) => {
  return (
    <DropIndicator
      {...props}
      className="h-0.5 my-0.5"
    />
  )
}

// Drop zone for canvas
interface CanvasDropZoneProps {
  isEmpty: boolean
  isOver: boolean
  children?: React.ReactNode
}

export const CanvasDropZone: React.FC<CanvasDropZoneProps> = ({
  isEmpty,
  isOver,
  children,
}) => {
  return (
    <div
      className={cn(
        'relative min-h-96 w-full transition-all duration-300 rounded-lg',
        isEmpty && 'border-2 border-dashed border-gray-300',
        isOver && 'border-blue-400 bg-blue-50',
        isEmpty && isOver && 'border-blue-500 bg-blue-100'
      )}
    >
      {children}
      
      {/* Empty state with drop indicator */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'text-center transition-all duration-300',
              isOver ? 'text-blue-600 scale-110' : 'text-gray-500'
            )}
          >
            <div className="text-lg font-medium mb-2">
              {isOver ? 'Drop your component here' : 'Start building your email'}
            </div>
            <div className="text-sm opacity-75">
              {isOver ? 'Release to add the component' : 'Drag components from the sidebar to get started'}
            </div>
          </div>
        </div>
      )}
      
      {/* Global drop overlay */}
      {isOver && !isEmpty && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none">
          <div className="absolute inset-2 border-2 border-blue-400 border-dashed rounded animate-pulse" />
        </div>
      )}
    </div>
  )
}