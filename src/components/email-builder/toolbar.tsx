'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useEmailBuilder, useBuilderHistory } from '@/store/email-builder'
import { 
  Save,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Monitor,
  Smartphone,
  Menu,
  Download,
  Upload,
  Play,
  Settings,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailBuilderToolbarProps {
  onSave?: () => void
  onPreview?: () => void
  showSidebarToggle?: boolean
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  className?: string
}

export const EmailBuilderToolbar: React.FC<EmailBuilderToolbarProps> = ({
  onSave,
  onPreview,
  showSidebarToggle = true,
  sidebarCollapsed = false,
  onToggleSidebar,
  className,
}) => {
  const {
    template,
    isPreviewMode,
    previewDevice,
    togglePreviewMode,
    setPreviewDevice,
    resetTemplate,
    exportToJson,
  } = useEmailBuilder()

  const { canUndo, canRedo, undo, redo } = useBuilderHistory()

  const handleExport = () => {
    const json = exportToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name || 'email-template'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the template? This action cannot be undone.')) {
      resetTemplate()
    }
  }

  return (
    <div className={cn(
      'h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between',
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center space-x-2">
        {/* Sidebar Toggle */}
        {showSidebarToggle && onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="w-4 h-4" />
          </Button>
        )}

        {/* Template Name */}
        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-gray-900 truncate max-w-48">
            {template.name || 'Untitled Template'}
          </h1>
          <p className="text-xs text-gray-500">
            {template.blocks?.length || 0} blocks
          </p>
        </div>
      </div>

      {/* Center Section - History Controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        {/* Preview Controls */}
        <div className="flex items-center space-x-1">
          <Button
            variant={isPreviewMode ? "default" : "ghost"}
            size="sm"
            onClick={togglePreviewMode}
            className="h-8"
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Preview</span>
              </>
            )}
          </Button>

          {/* Device Toggle (only in preview mode) */}
          {isPreviewMode && (
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant={previewDevice === 'desktop' ? "default" : "ghost"}
                size="icon"
                onClick={() => setPreviewDevice('desktop')}
                className="h-8 w-8"
                title="Desktop Preview"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              
              <Button
                variant={previewDevice === 'mobile' ? "default" : "ghost"}
                size="icon"
                onClick={() => setPreviewDevice('mobile')}
                className="h-8 w-8"
                title="Mobile Preview"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Action Buttons */}
        <div className="hidden sm:flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            className="h-8 w-8"
            title="Export Template"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8"
            title="Reset Template"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Primary Actions */}
        <div className="flex items-center space-x-2">
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="h-8"
            >
              <Play className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Test</span>
            </Button>
          )}

          {onSave && (
            <Button
              size="sm"
              onClick={onSave}
              className="h-8"
            >
              <Save className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Compact toolbar for mobile
export const CompactToolbar: React.FC<EmailBuilderToolbarProps> = (props) => {
  const { isPreviewMode, togglePreviewMode } = useEmailBuilder()
  const { canUndo, canRedo, undo, redo } = useBuilderHistory()

  return (
    <div className="h-12 bg-white border-b border-gray-200 px-2 flex items-center justify-between">
      {/* Essential Controls Only */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8"
        >
          <Undo className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8"
        >
          <Redo className="w-3 h-3" />
        </Button>
      </div>

      <Button
        variant={isPreviewMode ? "default" : "outline"}
        size="sm"
        onClick={togglePreviewMode}
        className="h-8"
      >
        {isPreviewMode ? (
          <EyeOff className="w-3 h-3" />
        ) : (
          <Eye className="w-3 h-3" />
        )}
      </Button>

      <div className="flex items-center space-x-1">
        {props.onSave && (
          <Button
            size="sm"
            onClick={props.onSave}
            className="h-8 px-2"
          >
            <Save className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
}