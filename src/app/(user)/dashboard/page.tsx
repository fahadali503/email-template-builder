'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, FileText, Edit3, Eye } from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Template } from '@/types'

async function fetchTemplates() {
    const response = await axios.get('/api/templates?limit=5')
    return response.data
}

export default function DashboardPage() {
    const { data: session } = useSession()

    const { data: templatesData, isLoading } = useQuery({
        queryKey: ['templates', 'recent'],
        queryFn: fetchTemplates,
    })

    const templates = templatesData?.templates || []

    return (
        <div className="space-y-8">
            {/* Welcome section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {session?.user?.name || 'User'}!
                </h1>
                <p className="mt-2 text-gray-600">
                    Here's what's happening with your email templates today.
                </p>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Create Template</CardTitle>
                        <CardDescription>
                            Start building a new email template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/builder">
                            <Button className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                New Template
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Browse Templates</CardTitle>
                        <CardDescription>
                            View and manage your templates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/templates">
                            <Button variant="outline" className="w-full">
                                <FileText className="mr-2 h-4 w-4" />
                                View All
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Account Settings</CardTitle>
                        <CardDescription>
                            Manage your account preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/account">
                            <Button variant="outline" className="w-full">
                                <Edit3 className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent templates */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Recent Templates
                    </h2>
                    <Link href="/templates">
                        <Button variant="ghost">View all</Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-20 bg-gray-200 rounded"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template: Template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Updated {new Date(template.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {template.isPublic && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Public
                                            </span>
                                        )}
                                    </div>

                                    {template.preview && (
                                        <div className="mb-4 h-20 bg-gray-100 rounded overflow-hidden">
                                            <div
                                                className="text-xs text-gray-600 p-2 truncate"
                                                dangerouslySetInnerHTML={{ __html: template.preview }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex space-x-2">
                                        <Link href={`/builder/${template.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Edit3 className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>
                                        </Link>
                                        <Link href={`/templates/${template.id}/preview`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Eye className="mr-1 h-3 w-3" />
                                                Preview
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No templates yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Get started by creating your first email template.
                            </p>
                            <Link href="/builder">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Template
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}