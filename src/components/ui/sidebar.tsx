'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
    LayoutDashboard,
    FileText,
    Edit3,
    Settings,
    Users,
    BarChart3,
    CreditCard,
    LogOut,
    Menu,
    X
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui'

interface SidebarProps {
    className?: string
}

const userNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Templates',
        href: '/templates',
        icon: FileText,
    },
    {
        title: 'Editor',
        href: '/builder',
        icon: Edit3,
    },
    {
        title: 'Account',
        href: '/account',
        icon: Settings,
    },
]

const adminNavItems = [
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Templates',
        href: '/admin/templates',
        icon: FileText,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Billing',
        href: '/admin/billing',
        icon: CreditCard,
    },
]

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { sidebarOpen, setSidebarOpen } = useUIStore()

    const isAdmin = session?.user?.role === 'ADMIN'
    const navItems = isAdmin ? adminNavItems : userNavItems

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                className
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                            Builderly
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.title}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User info and logout */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {session?.user?.name || session?.user?.email}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {session?.user?.role?.toLowerCase()}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => signOut()}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export function SidebarToggle() {
    const { setSidebarOpen } = useUIStore()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
        >
            <Menu className="h-6 w-6" />
        </Button>
    )
}