'use client'

import { usePathname } from 'next/navigation'
import { Sidebar, SidebarToggle } from '@/components/ui/sidebar'

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isBuilderPage = pathname?.includes('/builder')

    // For builder page, use minimal layout to allow full height
    if (isBuilderPage) {
        return (
            <div className="h-screen w-full bg-gray-50">
                {children}
            </div>
        )
    }

    // Regular layout for other pages
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <SidebarToggle />
                        <div className="flex items-center space-x-4">
                            {/* Add any top bar items here */}
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}