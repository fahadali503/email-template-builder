'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, Search, Edit3, Eye, Trash2, MoreHorizontal } from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Template } from '@/types'

async function fetchTemplates(page: number, search: string) {
    const response = await axios.get(`/api/templates?page=${page}&search=${search}`)
    return response.data
}

async function deleteTemplate(id: string) {
    await axios.delete(`/api/templates/${id}`)
}

export default function TemplatesPage() {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const queryClient = useQueryClient()

    const { data: templatesData, isLoading } = useQuery({
        queryKey: ['templates', page, search],
        queryFn: () => fetchTemplates(page, search),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] })
        },
    })

    const templates = templatesData?.templates || []
    const pagination = templatesData?.pagination

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your email templates
                    </p>
                </div>
                <Link href="/builder">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Templates grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                                    <div className="flex space-x-2">
                                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : templates.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template: Template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                                {template.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Updated {new Date(template.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {template.isPublic && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Public
                                                </span>
                                            )}
                                        </div>
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(template.id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.pages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {search ? 'No templates found' : 'No templates yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {search
                                ? 'Try adjusting your search terms.'
                                : 'Get started by creating your first email template.'
                            }
                        </p>
                        {!search && (
                            <Link href="/builder">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Template
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}