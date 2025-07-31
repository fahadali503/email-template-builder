'use client'

import React from 'react'
import { useEmailBuilder } from '@/store/email-builder'
import { EmailBlock, EmailStyle } from '@/types/email-builder'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/editor/rich-text-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Palette,
  Type,
  Move,
  ExternalLink,
  Image as ImageIcon,
  Code,
} from 'lucide-react'

interface PropertyPanelProps {
  block?: EmailBlock
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ block }) => {
  const { updateBlock, selectedBlockId, getSelectedBlock } = useEmailBuilder()
  
  const selectedBlock = block || getSelectedBlock()

  if (!selectedBlock) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <Type className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm">
            Select a block to edit its properties
          </p>
        </div>
      </div>
    )
  }

  const updateBlockProp = (path: string, value: any) => {
    const updates: any = {}
    
    if (path.startsWith('style.')) {
      const styleProp = path.replace('style.', '')
      updates.style = {
        ...selectedBlock.style,
        [styleProp]: value,
      }
    } else if (path.startsWith('props.')) {
      const prop = path.replace('props.', '')
      updates.props = {
        ...selectedBlock.props,
        [prop]: value,
      }
    }
    
    updateBlock(selectedBlock.id, updates)
  }

  const renderTextProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          Text Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="content">Content</Label>
          <RichTextEditor
            content={selectedBlock.props.content || ''}
            onChange={(content) => updateBlockProp('props.content', content)}
            className="mt-1"
            placeholder="Enter your text content..."
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderHeadingProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          Heading Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="content">Content</Label>
          <Input
            id="content"
            value={selectedBlock.props.content || ''}
            onChange={(e) => updateBlockProp('props.content', e.target.value)}
            placeholder="Enter heading text"
          />
        </div>
        <div>
          <Label htmlFor="level">Heading Level</Label>
          <select
            id="level"
            value={selectedBlock.props.level || 'h1'}
            onChange={(e) => updateBlockProp('props.level', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="h1">H1 - Largest</option>
            <option value="h2">H2 - Large</option>
            <option value="h3">H3 - Medium</option>
            <option value="h4">H4 - Small</option>
            <option value="h5">H5 - Smaller</option>
            <option value="h6">H6 - Smallest</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )

  const renderButtonProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Button Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="text">Button Text</Label>
          <Input
            id="text"
            value={selectedBlock.props.text || ''}
            onChange={(e) => updateBlockProp('props.text', e.target.value)}
            placeholder="Button text"
          />
        </div>
        <div>
          <Label htmlFor="href">Link URL</Label>
          <Input
            id="href"
            value={selectedBlock.props.href || ''}
            onChange={(e) => updateBlockProp('props.href', e.target.value)}
            placeholder="https://example.com"
            type="url"
          />
        </div>
        <div>
          <Label htmlFor="target">Link Target</Label>
          <select
            id="target"
            value={selectedBlock.props.target || '_blank'}
            onChange={(e) => updateBlockProp('props.target', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="_blank">New Tab (_blank)</option>
            <option value="_self">Same Tab (_self)</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )

  const renderImageProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Image Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="src">Image URL</Label>
          <Input
            id="src"
            value={selectedBlock.props.src || ''}
            onChange={(e) => updateBlockProp('props.src', e.target.value)}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
        </div>
        <div>
          <Label htmlFor="alt">Alt Text</Label>
          <Input
            id="alt"
            value={selectedBlock.props.alt || ''}
            onChange={(e) => updateBlockProp('props.alt', e.target.value)}
            placeholder="Describe the image"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              type="number"
              value={selectedBlock.props.width || ''}
              onChange={(e) => updateBlockProp('props.width', parseInt(e.target.value) || undefined)}
              placeholder="400"
            />
          </div>
          <div>
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={selectedBlock.props.height || ''}
              onChange={(e) => updateBlockProp('props.height', parseInt(e.target.value) || undefined)}
              placeholder="200"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderDividerProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle>Divider Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="thickness">Thickness (px)</Label>
          <Input
            id="thickness"
            type="number"
            value={selectedBlock.props.thickness || 1}
            onChange={(e) => updateBlockProp('props.thickness', parseInt(e.target.value) || 1)}
            min="1"
            max="10"
          />
        </div>
        <div>
          <Label htmlFor="style">Line Style</Label>
          <select
            id="style"
            value={selectedBlock.props.style || 'solid'}
            onChange={(e) => updateBlockProp('props.style', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )

  const renderSpacerProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          Spacer Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            value={selectedBlock.props.height || 20}
            onChange={(e) => updateBlockProp('props.height', parseInt(e.target.value) || 20)}
            min="1"
            max="200"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderHtmlProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          HTML Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="content">HTML Content</Label>
          <Textarea
            id="content"
            value={selectedBlock.props.content || ''}
            onChange={(e) => updateBlockProp('props.content', e.target.value)}
            placeholder="<p>Enter your HTML content here...</p>"
            rows={10}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderStyleProperties = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Styling
        </CardTitle>
        <CardDescription>
          Customize the appearance of your block
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="backgroundColor">Background</Label>
            <Input
              id="backgroundColor"
              type="color"
              value={selectedBlock.style?.backgroundColor || '#ffffff'}
              onChange={(e) => updateBlockProp('style.backgroundColor', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="color">Text Color</Label>
            <Input
              id="color"
              type="color"
              value={selectedBlock.style?.color || '#000000'}
              onChange={(e) => updateBlockProp('style.color', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="fontSize">Font Size</Label>
          <Input
            id="fontSize"
            value={selectedBlock.style?.fontSize || ''}
            onChange={(e) => updateBlockProp('style.fontSize', e.target.value)}
            placeholder="16px"
          />
        </div>

        <div>
          <Label htmlFor="fontWeight">Font Weight</Label>
          <select
            id="fontWeight"
            value={selectedBlock.style?.fontWeight || 'normal'}
            onChange={(e) => updateBlockProp('style.fontWeight', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Lighter</option>
            <option value="bolder">Bolder</option>
          </select>
        </div>

        <div>
          <Label htmlFor="textAlign">Text Alignment</Label>
          <select
            id="textAlign"
            value={selectedBlock.style?.textAlign || 'left'}
            onChange={(e) => updateBlockProp('style.textAlign', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>

        <div>
          <Label htmlFor="padding">Padding</Label>
          <Input
            id="padding"
            value={selectedBlock.style?.padding || ''}
            onChange={(e) => updateBlockProp('style.padding', e.target.value)}
            placeholder="10px or 10px 20px"
          />
        </div>

        <div>
          <Label htmlFor="margin">Margin</Label>
          <Input
            id="margin"
            value={selectedBlock.style?.margin || ''}
            onChange={(e) => updateBlockProp('style.margin', e.target.value)}
            placeholder="10px or 10px 20px"
          />
        </div>

        <div>
          <Label htmlFor="borderRadius">Border Radius</Label>
          <Input
            id="borderRadius"
            value={selectedBlock.style?.borderRadius || ''}
            onChange={(e) => updateBlockProp('style.borderRadius', e.target.value)}
            placeholder="4px"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderBlockProperties = () => {
    switch (selectedBlock.type) {
      case 'text':
        return renderTextProperties()
      case 'heading':
        return renderHeadingProperties()
      case 'button':
        return renderButtonProperties()
      case 'image':
        return renderImageProperties()
      case 'divider':
        return renderDividerProperties()
      case 'spacer':
        return renderSpacerProperties()
      case 'html':
        return renderHtmlProperties()
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="text-center mb-4">
        <h3 className="text-sm font-medium text-gray-900 capitalize">
          {selectedBlock.type} Block
        </h3>
        <p className="text-xs text-gray-500">
          ID: {selectedBlock.id}
        </p>
      </div>

      {renderBlockProperties()}
      
      <Separator />
      
      {renderStyleProperties()}
    </div>
  )
}