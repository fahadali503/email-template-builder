'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Smartphone, Monitor, Settings, Variable } from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RichTextEditor } from '@/components/editor/rich-text-editor'
import { EmailBlocksLibrary, EmailBlock } from '@/components/email-components/email-blocks'
import { useEditorStore } from '@/store/editor'
import { EmailBuilder } from '@/components/email-builder'
import { EmailTemplate } from '@/types/email-builder'
import { TemplateVariable } from '@/types'
import { cn } from '@/lib/utils'

const templateSchema = z.object({
    name: z.string().min(1, 'Template name is required'),
    content: z.string(),
    isPublic: z.boolean(),
    variables: z.record(z.string(), z.string()).optional(),
})

type TemplateForm = z.infer<typeof templateSchema>

async function fetchTemplate(id: string) {
    if (id === 'new') return null
    const response = await axios.get(`/api/templates/${id}`)
    return response.data
}

async function saveTemplate(data: TemplateForm & { id?: string }) {
    if (data.id && data.id !== 'new') {
        const response = await axios.put(`/api/templates/${data.id}`, data)
        return response.data
    } else {
        const response = await axios.post('/api/templates', data)
        return response.data
    }
}

export default function BuilerPage() {
    const params = useParams()
    const router = useRouter()
    const queryClient = useQueryClient()
    const templateId = params.id?.[0] || 'new'

    const [isSaving, setIsSaving] = useState(false)
    const [showVariables, setShowVariables] = useState(false)
    const [showComponents, setShowComponents] = useState(false)
    const [builderMode, setBuilderMode] = useState<'visual' | 'code'>('visual')
    const [newVariable, setNewVariable] = useState({ key: '', value: '', type: 'text' as TemplateVariable['type'] })
    const templateLoadedRef = useRef<string | null>(null)

    const {
        content,
        setContent,
        variables,
        setVariables,
        isMobilePreview,
        toggleMobilePreview,
        addVariable,
        removeVariable,
        previewData,
        setPreviewData
    } = useEditorStore()

    const { data: template, isLoading } = useQuery(
        ['template', templateId],
        () => fetchTemplate(templateId),
        {
            enabled: templateId !== 'new',
        }
    )

    const saveMutation = useMutation(
        saveTemplate,
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries(['templates'])
                if (templateId === 'new') {
                    router.push(`/builder/${data.id}`)
                }
            },
        }
    )

    const form = useForm<TemplateForm>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            content: '',
            isPublic: false,
        },
    })

    // Load template data when available
    useEffect(() => {
        if (template && templateLoadedRef.current !== template.id) {
            templateLoadedRef.current = template.id

            form.reset({
                name: template.name,
                content: template.content,
                isPublic: template.isPublic,
            })
            setContent(template.content)
            if (template.variables) {
                // Convert JSON object to TemplateVariable array
                const variablesArray = Object.entries(template.variables).map(([key, value]) => ({
                    key,
                    value: String(value),
                    type: 'text' as TemplateVariable['type']
                }))
                setVariables(variablesArray)
            }
        }
    }, [template, form])

    const onSave = async (formData: TemplateForm) => {
        setIsSaving(true)
        try {
            // Convert variables array back to JSON object for database
            const variablesObject = variables.reduce((acc, variable) => {
                acc[variable.key] = variable.value
                return acc
            }, {} as Record<string, string>)

            const finalContent = builderMode === 'visual'
                ? content // Will be updated by email builder
                : content

            await saveMutation.mutateAsync({
                ...formData,
                content: finalContent,
                variables: variablesObject,
                id: templateId,
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleEmailBuilderSave = (builderTemplate: EmailTemplate) => {
        const convertedData = convertFromEmailBuilderTemplate(builderTemplate)

        form.setValue('name', convertedData.name)
        setContent(convertedData.content)

        // Convert variables back to array format
        const variablesArray = Object.entries(convertedData.variables).map(([key, value]) => ({
            key,
            value: String(value),
            type: 'text' as TemplateVariable['type']
        }))
        setVariables(variablesArray)

        // Save to database
        onSave(convertedData as TemplateForm)
    }

    const handleEmailBuilderPreview = async (html: string) => {
        // Handle preview - could open in new window or show in modal
        console.log('Preview HTML:', html)
    }

    const handleAddVariable = () => {
        if (newVariable.key && newVariable.value) {
            addVariable(newVariable)
            setPreviewData({
                ...previewData,
                [newVariable.key]: newVariable.value
            })
            setNewVariable({ key: '', value: '', type: 'text' })
        }
    }

    const handleBlockSelect = (block: EmailBlock) => {
        // Insert the block's HTML into the editor
        const blockHtml = `<div class="email-block" data-block-type="${block.id}">
            ${block.name} component - customize this content
        </div>`
        setContent(content + blockHtml)
        setShowComponents(false)
    }

    const parseVariables = (content: string, data: Record<string, string>) => {
        return content.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match)
    }

    // Convert template to email builder format
    const convertToEmailBuilderTemplate = (template: Record<string, unknown>): EmailTemplate | null => {
        try {
            return {
                id: typeof template.id === 'string' ? template.id : undefined,
                name: typeof template.name === 'string' ? template.name : 'Untitled Template',
                subject: typeof template.subject === 'string' ? template.subject : '',
                blocks: Array.isArray(template.blocks) ? template.blocks : [],
                variables: typeof template.variables === 'object' && template.variables !== null
                    ? template.variables as Record<string, string>
                    : {},
                settings: {
                    previewText: '',
                    backgroundColor: '#ffffff',
                    fontFamily: 'Arial, sans-serif',
                    width: 600,
                },
                metadata: {
                    version: '1.0.0',
                    createdAt: template.createdAt ? new Date(template.createdAt as string) : new Date(),
                    updatedAt: template.updatedAt ? new Date(template.updatedAt as string) : new Date(),
                }
            }
        } catch (error) {
            console.error('Failed to convert template:', error)
            return null
        }
    }

    // Convert email builder template back to database format
    const convertFromEmailBuilderTemplate = (builderTemplate: EmailTemplate) => {
        return {
            name: builderTemplate.name,
            subject: builderTemplate.subject || '',
            content: builderTemplate.blocks ? JSON.stringify(builderTemplate.blocks) : content,
            variables: builderTemplate.variables || {},
            isPublic: false,
        }
    }

    const previewContent = parseVariables(content, previewData)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <>
            {builderMode === 'visual' ? (
                // Visual Email Builder - Full Page
                <div className="h-screen w-full">
                    <EmailBuilder
                        defaultTemplate={template ? convertToEmailBuilderTemplate(template) : undefined}
                        onSave={handleEmailBuilderSave}
                        onPreview={handleEmailBuilderPreview}
                        className="h-full w-full"
                    />
                </div>
            ) : (
                // Code Mode - Traditional Layout
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {templateId === 'new' ? 'Create Template' : 'Edit Template'}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Build your email template with our visual editor
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 border rounded-lg p-1">
                                <Button
                                    // @ts-ignore - TypeScript is incorrectly flagging this comparison
                                    variant={builderMode === 'visual' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setBuilderMode('visual')}
                                    className="h-8"
                                >
                                    🎨 Visual
                                </Button>
                                <Button
                                    // @ts-ignore - TypeScript is incorrectly flagging this comparison
                                    variant={builderMode === 'code' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setBuilderMode('code')}
                                    className="h-8"
                                >
                                    📝 Code
                                </Button>
                            </div>

                            {builderMode === 'code' && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowComponents(!showComponents)}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Components
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowVariables(!showVariables)}
                                    >
                                        <Variable className="mr-2 h-4 w-4" />
                                        Variables
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={toggleMobilePreview}
                                    >
                                        {isMobilePreview ? (
                                            <Monitor className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Smartphone className="mr-2 h-4 w-4" />
                                        )}
                                        {isMobilePreview ? 'Desktop' : 'Mobile'}
                                    </Button>
                                </>
                            )}

                            <Button
                                onClick={form.handleSubmit(onSave)}
                                disabled={isSaving || saveMutation.isPending}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving || saveMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                // Code Mode Layout
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        {/* Editor Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Template Settings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Template Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter template name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="isPublic"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <input
                                                                type="checkbox"
                                                                checked={field.value}
                                                                onChange={field.onChange}
                                                                className="rounded"
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal">
                                                            Make this template public
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </Form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Content Editor</CardTitle>
                                    <CardDescription>
                                        Create your email content using our rich text editor
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RichTextEditor
                                        content={content}
                                        onChange={(newContent) => {
                                            setContent(newContent)
                                            form.setValue('content', newContent)
                                        }}
                                        placeholder="Start writing your email template..."
                                        className="min-h-96"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Preview and Variables Section */}
                        <div className="space-y-6">
                            {/* Email Components Panel */}
                            {showComponents && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Email Components</CardTitle>
                                        <CardDescription>
                                            Click components to add to your template
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EmailBlocksLibrary onBlockSelect={handleBlockSelect} />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Variables Panel */}
                            {showVariables && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Variables</CardTitle>
                                        <CardDescription>
                                            Manage dynamic content variables
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="Variable key (e.g., userName)"
                                                value={newVariable.key}
                                                onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
                                            />
                                            <Input
                                                placeholder="Preview value"
                                                value={newVariable.value}
                                                onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                                            />
                                            <Button onClick={handleAddVariable} className="w-full">
                                                Add Variable
                                            </Button>
                                        </div>

                                        {variables.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium">Current Variables:</h4>
                                                {variables.map((variable) => (
                                                    <div key={variable.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <span className="text-sm">
                                                            <code>{`{{${variable.key}}}`}</code>
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeVariable(variable.key)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                    <CardDescription>
                                        See how your email will look
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn(
                                        "border rounded-lg overflow-hidden",
                                        isMobilePreview ? "max-w-sm mx-auto" : "w-full"
                                    )}>
                                        <div
                                            className="p-4 bg-white min-h-96 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: previewContent }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}