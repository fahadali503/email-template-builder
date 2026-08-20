'use client'

import React from 'react'
import { EmailBuilderDragDropProvider } from './drag-drop-context'
import { EmailBuilderSidebar } from './sidebar'
import { EmailCanvas, ResponsiveCanvas, PreviewCanvas } from './canvas'
import { EmailBuilderToolbar } from './toolbar'
import { useEmailBuilder } from '@/store/email-builder'
import { EmailTemplateRenderer } from './blocks'
import { cn } from '@/lib/utils'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable'

interface EmailBuilderProps {
  className?: string
  defaultTemplate?: any
  onSave?: (template: any) => void
  onPreview?: (html: string) => void
}

export const EmailBuilder: React.FC<EmailBuilderProps> = ({
  className,
  defaultTemplate,
  onSave,
  onPreview,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const {
    template,
    isPreviewMode,
    previewDevice,
    setTemplate
  } = useEmailBuilder()

  // Initialize template if provided
  React.useEffect(() => {
    if (defaultTemplate) {
      setTemplate(defaultTemplate)
    }
  }, [defaultTemplate, setTemplate])

  // Handle save
  const handleSave = React.useCallback(() => {
    if (onSave) {
      onSave(template)
    }
  }, [template, onSave])

  // Generate preview HTML
  const generatePreviewHtml = React.useCallback(async () => {
    try {
      // This would integrate with @react-email/render to generate final HTML
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${template.subject || 'Email Preview'}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: ${template.settings?.fontFamily || 'Arial, sans-serif'};">
            <div style="background-color: ${template.settings?.backgroundColor || '#ffffff'}; min-height: 100vh; padding: 20px;">
              <div style="max-width: ${template.settings?.width || 600}px; margin: 0 auto; background: white;">
                ${template.blocks.map(block => '<!-- Block content would be rendered here -->').join('\n')}
              </div>
            </div>
          </body>
        </html>
      `

      if (onPreview) {
        onPreview(html)
      }

      return html
    } catch (error) {
      console.error('Failed to generate preview HTML:', error)
      return ''
    }
  }, [template, onPreview])

  if (isPreviewMode) {
    return (
      <div className={cn('h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30', className)}>
        <EmailBuilderToolbar
          onSave={handleSave}
          onPreview={generatePreviewHtml}
          showSidebarToggle={false}
          sidebarCollapsed={false}
          onToggleSidebar={() => { }}
        />

        <div className="flex-1 overflow-auto p-6 min-h-0">
          <ResponsiveCanvas
            device={previewDevice}
            showGrid={false}
            className="min-h-full shadow-2xl shadow-slate-300/20 border-0"
          />
        </div>
      </div>
    )
  }

  return (
    <EmailBuilderDragDropProvider>
      <div className={cn('h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20', className)}>
        {/* Toolbar */}
        <EmailBuilderToolbar
          onSave={handleSave}
          onPreview={generatePreviewHtml}
          showSidebarToggle={true}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {/* Desktop Layout */}
          <div className="hidden lg:block h-full">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Sidebar */}
              <ResizablePanel
                defaultSize={sidebarCollapsed ? 5 : 25}
                minSize={5}
                maxSize={40}
                className="min-w-[60px] h-full"
              >
                <EmailBuilderSidebar
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-full"
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Canvas Area */}
              <ResizablePanel defaultSize={75} minSize={50} className="h-full">
                <div className="h-full bg-white/50 backdrop-blur-sm flex flex-col">
                  {/* Canvas Container */}
                  <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-4xl mx-auto h-full">
                      <EmailCanvas
                        showGrid={true}
                        className="min-h-full w-full shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden h-full flex flex-col">
            {/* Canvas Area */}
            <div className="flex-1 bg-white/50 backdrop-blur-sm overflow-auto p-4 min-h-0">
              <EmailCanvas
                showGrid={true}
                className="min-h-full w-full shadow-sm max-w-lg mx-auto"
              />
            </div>

            {/* Bottom Sidebar */}
            <div className="h-80 border-t bg-white overflow-hidden flex-shrink-0">
              <EmailBuilderSidebar className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </EmailBuilderDragDropProvider>
  )
}

// Compact version for mobile or embedded use
export const CompactEmailBuilder: React.FC<EmailBuilderProps> = ({
  className,
  ...props
}) => {
  const { isPreviewMode } = useEmailBuilder()

  return (
    <EmailBuilderDragDropProvider>
      <div className={cn('h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20', className)}>
        <EmailBuilderToolbar {...props} />

        {isPreviewMode ? (
          <div className="flex-1 overflow-auto p-4 min-h-0">
            <ResponsiveCanvas device="mobile" className="min-h-full" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto p-4 min-h-0">
              <EmailCanvas className="min-h-full w-full" />
            </div>

            {/* Mobile sidebar at bottom */}
            <div className="border-t bg-white/95 backdrop-blur-sm flex-shrink-0">
              <EmailBuilderSidebar className="h-64" />
            </div>
          </>
        )}
      </div>
    </EmailBuilderDragDropProvider>
  )
}

// Export all components
export * from './blocks'
export * from './block-library'
export * from './canvas'
export * from './drag-drop-context'
export * from './draggable-block'
export * from './drop-indicator'
export * from './property-panel'
export * from './sidebar'
export * from './template-settings'
export * from './toolbar'