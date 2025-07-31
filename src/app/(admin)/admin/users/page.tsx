'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, MoreHorizontal, Shield, User as UserIcon } from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@/types'

async function fetchUsers() {
    const response = await axios.get('/api/admin/users')
    return response.data
}

export default function AdminUsersPage() {
    const [search, setSearch] = useState('')

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin', 'users'],
        queryFn: fetchUsers,
    })

    const filteredUsers = users.filter((user: User) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-2 text-gray-600">
                        Manage all users in your system
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <UserIcon className="h-8 w-8 text-blue-600 ml-auto" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Admins</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: User) => u.role === 'ADMIN').length}
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-red-600 ml-auto" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: User) => u.role === 'USER').length}
                                </p>
                            </div>
                            <UserIcon className="h-8 w-8 text-green-600 ml-auto" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-600">This Month</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: User) => {
                                        const userDate = new Date(u.createdAt)
                                        const now = new Date()
                                        return userDate.getMonth() === now.getMonth() &&
                                            userDate.getFullYear() === now.getFullYear()
                                    }).length}
                                </p>
                            </div>
                            <UserIcon className="h-8 w-8 text-purple-600 ml-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        A list of all users in your system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Templates</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user: User & { _count?: { templates: number } }) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {user.name || 'Unnamed User'}
                                                    </div>
                                                    <div className="text-sm text-gray-600">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {user._count?.templates || 0}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}