import { create } from 'zustand'
import { EditorState, TemplateVariable } from '@/types'

interface EditorStore extends EditorState {
    setContent: (content: string) => void
    setVariables: (variables: TemplateVariable[]) => void
    setPreviewData: (data: Record<string, any>) => void
    toggleMobilePreview: () => void
    addVariable: (variable: TemplateVariable) => void
    removeVariable: (key: string) => void
    updateVariable: (key: string, variable: Partial<TemplateVariable>) => void
    reset: () => void
}

const initialState: EditorState = {
    content: '',
    variables: [],
    previewData: {},
    isMobilePreview: false,
}

export const useEditorStore = create<EditorStore>((set, get) => ({
    ...initialState,

    setContent: (content) => set({ content }),

    setVariables: (variables) => set({ variables }),

    setPreviewData: (previewData) => set({ previewData }),

    toggleMobilePreview: () => set((state) => ({
        isMobilePreview: !state.isMobilePreview
    })),

    addVariable: (variable) => set((state) => ({
        variables: [...state.variables, variable]
    })),

    removeVariable: (key) => set((state) => ({
        variables: state.variables.filter(v => v.key !== key)
    })),

    updateVariable: (key, updates) => set((state) => ({
        variables: state.variables.map(v =>
            v.key === key ? { ...v, ...updates } : v
        )
    })),

    reset: () => set(initialState),
}))