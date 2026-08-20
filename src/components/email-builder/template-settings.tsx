'use client'

import React from 'react'
import { useEmailBuilder } from '@/store/email-builder'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Palette,
  Settings,
  FileText,
  Download,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react'

export const TemplateSettings: React.FC = () => {
  const {
    template,
    updateTemplate,
    exportToJson,
    importFromJson,
    validateTemplate,
    isPreviewMode,
    togglePreviewMode,
  } = useEmailBuilder()

  const [importValue, setImportValue] = React.useState('')
  const [validationResult, setValidationResult] = React.useState<{ success: boolean; errors: string[] } | null>(null)

  const handleTemplateChange = (field: string, value: any) => {
    updateTemplate({ [field]: value })
  }

  const handleSettingsChange = (field: string, value: any) => {
    updateTemplate({
      settings: {
        ...template.settings,
        [field]: value,
      }
    })
  }

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

  const handleImport = () => {
    try {
      importFromJson(importValue)
      setImportValue('')
      setValidationResult({ success: true, errors: [] })
    } catch (error: any) {
      setValidationResult({ success: false, errors: [error.message] })
    }
  }

  const handleValidate = () => {
    const result = validateTemplate()
    setValidationResult(result)
  }

  return (
    <div className="space-y-4 p-4">
      {/* Template Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Template Information
          </CardTitle>
          <CardDescription>
            Basic information about your email template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={template.name || ''}
              onChange={(e) => handleTemplateChange('name', e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={template.subject || ''}
              onChange={(e) => handleTemplateChange('subject', e.target.value)}
              placeholder="Enter email subject line"
            />
          </div>

          <div>
            <Label htmlFor="preview-text">Preview Text</Label>
            <Input
              id="preview-text"
              value={template.settings?.previewText || ''}
              onChange={(e) => handleSettingsChange('previewText', e.target.value)}
              placeholder="Text shown in email preview"
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Styling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Template Styling
          </CardTitle>
          <CardDescription>
            Global styling for your email template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="background-color"
                type="color"
                value={template.settings?.backgroundColor || '#ffffff'}
                onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={template.settings?.backgroundColor || '#ffffff'}
                onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="font-family">Font Family</Label>
            <select
              id="font-family"
              value={template.settings?.fontFamily || 'Arial, sans-serif'}
              onChange={(e) => handleSettingsChange('fontFamily', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Tahoma, sans-serif">Tahoma</option>
            </select>
          </div>

          <div>
            <Label htmlFor="template-width">Template Width (px)</Label>
            <Input
              id="template-width"
              type="number"
              value={template.settings?.width || 600}
              onChange={(e) => handleSettingsChange('width', parseInt(e.target.value) || 600)}
              min="320"
              max="800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={togglePreviewMode}
            variant={isPreviewMode ? "default" : "outline"}
            className="w-full"
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Enter Preview Mode
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Template Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Template Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Validation */}
          <div>
            <Button onClick={handleValidate} variant="outline" className="w-full">
              Validate Template
            </Button>
            {validationResult && (
              <div className={`mt-2 p-2 rounded text-sm ${
                validationResult.success 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {validationResult.success ? (
                  'Template is valid!'
                ) : (
                  <div>
                    <div className="font-medium">Validation Errors:</div>
                    <ul className="list-disc list-inside mt-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export */}
          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Template
          </Button>

          {/* Import */}
          <div className="space-y-2">
            <Label htmlFor="import-json">Import Template JSON</Label>
            <Textarea
              id="import-json"
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              placeholder="Paste template JSON here..."
              rows={4}
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleImport} 
              disabled={!importValue.trim()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <div>Blocks: {template.blocks?.length || 0}</div>
          <div>Variables: {Object.keys(template.variables || {}).length}</div>
          <div>Version: {template.metadata?.version || '1.0.0'}</div>
          {template.metadata?.createdAt && (
            <div>Created: {new Date(template.metadata.createdAt).toLocaleDateString()}</div>
          )}
          {template.metadata?.updatedAt && (
            <div>Updated: {new Date(template.metadata.updatedAt).toLocaleDateString()}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}