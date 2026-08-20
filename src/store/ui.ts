import { create } from 'zustand'

interface UIStore {
    sidebarOpen: boolean
    theme: 'light' | 'dark'
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void
    setTheme: (theme: 'light' | 'dark') => void
    toggleTheme: () => void
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: true,
    theme: 'light',

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
    })),

    setTheme: (theme) => set({ theme }),

    toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
    })),
}))