'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Eye, Code, Download, Send, ArrowLeft } from 'lucide-react'
import { render } from '@react-email/render'
import Link from 'next/link'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailTemplate } from '@/components/email-components/email-template'
import { Template } from '@/types'

async function fetchTemplate(id: string) {
    const response = await axios.get(`/api/templates/${id}`)
    return response.data
}

export default function TemplatePreviewPage() {
    const params = useParams()
    const templateId = params.id as string
    const [view, setView] = useState<'preview' | 'html'>('preview')
    const [htmlContent, setHtmlContent] = useState('')

    const { data: template, isLoading, error } = useQuery({
        queryKey: ['template', templateId],
        queryFn: () => fetchTemplate(templateId),
    })

    useEffect(() => {
        if (template) {
            // Render the template to HTML using react-email
            const html = render(
                EmailTemplate({
                    content: template.content,
                    variables: template.variables || {}
                })
            )
            setHtmlContent(html)
        }
    }, [template])

    const downloadHtml = () => {
        if (htmlContent) {
            const blob = new Blob([htmlContent], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${template?.name || 'template'}.html`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }

    const sendTestEmail = async () => {
        try {
            await axios.post('/api/email/test', {
                templateId: template?.id,
                recipient: 'test@example.com'
            })
            alert('Test email sent successfully!')
        } catch (error) {
            console.error('Failed to send test email:', error)
            alert('Failed to send test email. Please try again.')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !template) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h1>
                <p className="text-gray-600 mb-6">
                    The template you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Link href="/templates">
                    <Button>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Templates
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/templates">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
                        <p className="text-gray-600">Template Preview</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant={view === 'preview' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('preview')}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </Button>
                    <Button
                        variant={view === 'html' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('html')}
                    >
                        <Code className="mr-2 h-4 w-4" />
                        HTML
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadHtml}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={sendTestEmail}>
                        <Send className="mr-2 h-4 w-4" />
                        Test Email
                    </Button>
                    <Link href={`/builder/${template.id}`}>
                        <Button size="sm">
                            Edit Template
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Preview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Preview */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    {view === 'preview' ? 'Email Preview' : 'HTML Source'}
                                </CardTitle>
                                <div className="text-sm text-gray-500">
                                    Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {view === 'preview' ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <iframe
                                        srcDoc={htmlContent}
                                        className="w-full h-[600px] border-0"
                                        title="Email Preview"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {htmlContent}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Template Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <p className="text-sm text-gray-900">{template.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Created</label>
                                <p className="text-sm text-gray-900">
                                    {new Date(template.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${template.isPublic
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {template.isPublic ? 'Public' : 'Private'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Variables */}
                    {template.variables && Object.keys(template.variables).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Variables</CardTitle>
                                <CardDescription>
                                    Dynamic content in this template
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(template.variables).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {`{{${key}}}`}
                                            </code>
                                            <span className="text-sm text-gray-600 truncate ml-2">
                                                {String(value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href={`/builder/${template.id}`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    Edit Template
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => navigator.clipboard.writeText(window.location.href)}
                            >
                                Copy Preview Link
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={downloadHtml}
                            >
                                Download HTML
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}