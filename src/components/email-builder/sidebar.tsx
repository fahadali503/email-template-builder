'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEmailBuilder } from '@/store/email-builder'
import { BlockLibrary, DraggableBlockItem, BLOCK_LIBRARY, getBlocksByCategory } from './block-library'
import { PropertyPanel } from './property-panel'
import { TemplateSettings } from './template-settings'
import { cn } from '@/lib/utils'
import {
  Layers,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Hook to detect scroll position for fade indicators and enable mouse wheel scrolling
const useScrollIndicators = (ref: React.RefObject<HTMLElement>) => {
  const [scrollState, setScrollState] = useState({
    isAtStart: true,
    isAtEnd: false
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element
      setScrollState({
        isAtStart: scrollLeft <= 0,
        isAtEnd: scrollLeft >= scrollWidth - clientWidth - 1
      })
    }

    // Handle horizontal mouse wheel scrolling
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Already scrolling horizontally, let it proceed
        return
      }

      if (e.deltaY !== 0) {
        // Convert vertical scroll to horizontal
        e.preventDefault()
        element.scrollLeft += e.deltaY
      }
    }

    // Initial check
    handleScroll()

    element.addEventListener('scroll', handleScroll)
    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('scroll', handleScroll)
      element.removeEventListener('wheel', handleWheel)
    }
  }, [ref])

  return scrollState
}

interface DraggableLibraryBlockProps {
  block: any
}

const DraggableLibraryBlock: React.FC<DraggableLibraryBlockProps> = ({ block }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: block.type,
    data: {
      type: 'block-library',
      blockType: block.type,
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
    >
      <DraggableBlockItem block={block} isDragging={isDragging} />
    </div>
  )
}

interface EmailBuilderSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export const EmailBuilderSidebar: React.FC<EmailBuilderSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  const { selectedBlockId, getSelectedBlock } = useEmailBuilder()
  const selectedBlock = getSelectedBlock()
  const tabScrollRef = useRef<HTMLDivElement>(null)
  const scrollState = useScrollIndicators(tabScrollRef)

  if (isCollapsed) {
    return (
      <div className={cn('w-12 bg-gray-50 border-r border-gray-200 flex flex-col', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="m-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('w-80 bg-white/95 border-r border-slate-200 flex flex-col shadow-xl shadow-slate-200/30', className)} style={{ backdropFilter: 'blur(10px)' }}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/70">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Email Builder</h2>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="blocks" className="h-full flex flex-col">
          <div className="relative mx-4 mt-4 mb-2">
            {/* Scroll Left Button */}
            {!scrollState.isAtStart && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 bg-white/90 backdrop-blur-sm shadow-md border border-slate-200/50 hover:bg-white"
                onClick={() => {
                  if (tabScrollRef.current) {
                    tabScrollRef.current.scrollLeft -= 100
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            {/* Scroll Right Button */}
            {!scrollState.isAtEnd && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 bg-white/90 backdrop-blur-sm shadow-md border border-slate-200/50 hover:bg-white"
                onClick={() => {
                  if (tabScrollRef.current) {
                    tabScrollRef.current.scrollLeft += 100
                  }
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {/* Scrollable Tabs Container */}
            <div
              ref={tabScrollRef}
              className="overflow-x-auto scrollbar-hide horizontal-scroll"
            >
              <TabsList className="flex w-max bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 shadow-lg rounded-lg p-1">
                <TabsTrigger value="blocks" className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap rounded-md text-sm">
                  <Layers className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Blocks</span>
                </TabsTrigger>
                <TabsTrigger value="properties" className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap rounded-md text-sm">
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Properties</span>
                </TabsTrigger>
                <TabsTrigger value="template" className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 whitespace-nowrap rounded-md text-sm">
                  <Palette className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Template</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Gradient overlays for visual scroll indicators */}
            {!scrollState.isAtStart && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent pointer-events-none z-10" />
            )}
            {!scrollState.isAtEnd && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10" />
            )}
          </div>

          {/* Block Library Tab */}
          <TabsContent value="blocks" className="flex-1 m-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 px-4 blocks-scroll">
                <div className="space-y-6 py-4">
                  {/* Basic Blocks */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Basic Elements
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {getBlocksByCategory('basic').map((block) => (
                        <DraggableLibraryBlock key={block.type} block={block} />
                      ))}
                    </div>
                  </div>

                  {/* Layout Blocks */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Layout
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {getBlocksByCategory('layout').map((block) => (
                        <DraggableLibraryBlock key={block.type} block={block} />
                      ))}
                    </div>
                  </div>

                  {/* Advanced Blocks */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Advanced
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {getBlocksByCategory('advanced').map((block) => (
                        <DraggableLibraryBlock key={block.type} block={block} />
                      ))}
                    </div>
                  </div>

                  {/* Add some bottom padding for better scrolling */}
                  <div className="h-4"></div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 blocks-scroll">
                <div className="p-4">
                  {selectedBlock ? (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="sticky top-0 bg-white pb-2 z-10 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <h3 className="text-sm font-medium text-gray-900">Properties</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Editing: {selectedBlock.type}
                        </p>
                      </div>

                      {/* Content */}
                      <PropertyPanel block={selectedBlock} />

                      {/* Bottom spacing */}
                      <div className="h-4"></div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="space-y-3">
                        <Settings className="w-12 h-12 mx-auto text-gray-300" />
                        <div>
                          <p className="text-sm font-medium">No Block Selected</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Select a block to edit its properties
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Template Settings Tab */}
          <TabsContent value="template" className="flex-1 m-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 blocks-scroll">
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="sticky top-0 bg-white pb-2 z-10 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-600" />
                        <h3 className="text-sm font-medium text-gray-900">Template Settings</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Configure global template properties
                      </p>
                    </div>

                    {/* Content */}
                    <TemplateSettings />

                    {/* Bottom spacing */}
                    <div className="h-4"></div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Compact sidebar for mobile or small screens
export const CompactSidebar: React.FC<EmailBuilderSidebarProps> = ({
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState('blocks')
  const { selectedBlockId, getSelectedBlock } = useEmailBuilder()
  const selectedBlock = getSelectedBlock()
  const compactTabScrollRef = useRef<HTMLDivElement>(null)
  const compactScrollState = useScrollIndicators(compactTabScrollRef)

  return (
    <div className={cn('w-full bg-white border-t border-gray-200', className)}>
      <div className="relative border-b border-gray-200">
        {/* Scroll Left Button */}
        {!compactScrollState.isAtStart && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-6 w-6 bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200/50 hover:bg-white"
            onClick={() => {
              if (compactTabScrollRef.current) {
                compactTabScrollRef.current.scrollLeft -= 80
              }
            }}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
        )}

        {/* Scroll Right Button */}
        {!compactScrollState.isAtEnd && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-6 w-6 bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200/50 hover:bg-white"
            onClick={() => {
              if (compactTabScrollRef.current) {
                compactTabScrollRef.current.scrollLeft += 80
              }
            }}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}

        {/* Scrollable Tabs Container */}
        <div
          ref={compactTabScrollRef}
          className="overflow-x-auto scrollbar-hide horizontal-scroll"
        >
          <div className="flex w-max">
            <button
              onClick={() => setActiveTab('blocks')}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === 'blocks'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Layers className="w-4 h-4 flex-shrink-0" />
              Blocks
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === 'properties'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Properties
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === 'template'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Palette className="w-4 h-4 flex-shrink-0" />
              Template
            </button>
          </div>
        </div>

        {/* Gradient overlays for visual scroll indicators */}
        {!compactScrollState.isAtStart && (
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10" />
        )}
        {!compactScrollState.isAtEnd && (
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10" />
        )}
      </div>

      <ScrollArea className="h-64 blocks-scroll">
        {activeTab === 'blocks' && (
          <div className="p-4">
            <div className="space-y-4">
              {/* Basic Blocks */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Basic Elements
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {getBlocksByCategory('basic').map((block) => (
                    <DraggableLibraryBlock key={block.type} block={block} />
                  ))}
                </div>
              </div>

              {/* Layout Blocks */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Layout
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {getBlocksByCategory('layout').map((block) => (
                    <DraggableLibraryBlock key={block.type} block={block} />
                  ))}
                </div>
              </div>

              {/* Advanced Blocks */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Advanced
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {getBlocksByCategory('advanced').map((block) => (
                    <DraggableLibraryBlock key={block.type} block={block} />
                  ))}
                </div>
              </div>

              {/* Bottom padding for better scrolling */}
              <div className="h-2"></div>
            </div>
          </div>
        )}
        {activeTab === 'properties' && (
          <div className="p-4">
            {selectedBlock ? (
              <PropertyPanel block={selectedBlock} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="space-y-3">
                  <Settings className="w-8 h-8 mx-auto text-gray-300" />
                  <div>
                    <p className="text-sm font-medium">No Block Selected</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Select a block to edit its properties
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'template' && (
          <div className="p-4">
            <TemplateSettings />
          </div>
        )}
      </ScrollArea>
    </div>
  )
}