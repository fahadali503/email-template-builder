import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
    EmailTemplate,
    EmailBlock,
    EmailBlockType,
    BuilderState,
    DragItem,
    emailTemplateSchema
} from '@/types/email-builder'

interface EmailBuilderActions {
    // Template management
    setTemplate: (template: EmailTemplate) => void
    updateTemplate: (updates: Partial<EmailTemplate>) => void
    resetTemplate: () => void

    // Block management
    addBlock: (block: Omit<EmailBlock, 'id'>, targetId?: string, position?: 'before' | 'after' | 'inside') => void
    removeBlock: (blockId: string) => void
    duplicateBlock: (blockId: string) => void
    updateBlock: (blockId: string, updates: Partial<EmailBlock>) => void
    moveBlock: (blockId: string, targetId: string, position: 'before' | 'after' | 'inside') => void

    // Selection management
    selectBlock: (blockId: string | null) => void
    getSelectedBlock: () => EmailBlock | null

    // Drag and drop
    setDraggedItem: (item: DragItem | null) => void

    // History management
    undo: () => void
    redo: () => void
    saveToHistory: () => void
    canUndo: () => boolean
    canRedo: () => boolean

    // Preview management
    togglePreviewMode: () => void
    setPreviewDevice: (device: 'desktop' | 'mobile') => void

    // Validation
    validateTemplate: () => { success: boolean; errors: string[] }

    // Export
    exportToJson: () => string
    importFromJson: (json: string) => void
}

type EmailBuilderStore = BuilderState & EmailBuilderActions

const createDefaultTemplate = (): EmailTemplate => ({
    name: 'Untitled Template',
    subject: '',
    blocks: [],
    variables: {},
    settings: {
        previewText: '',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        width: 600,
    },
    metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
})

const findBlockById = (blocks: EmailBlock[], id: string): EmailBlock | null => {
    for (const block of blocks) {
        if (block.id === id) return block
        if (block.children) {
            const found = findBlockById(block.children, id)
            if (found) return found
        }
    }
    return null
}

const removeBlockById = (blocks: EmailBlock[], id: string): EmailBlock[] => {
    return blocks.filter(block => {
        if (block.id === id) return false
        if (block.children) {
            block.children = removeBlockById(block.children, id)
        }
        return true
    })
}

const insertBlock = (
    blocks: EmailBlock[],
    newBlock: EmailBlock,
    targetId?: string,
    position: 'before' | 'after' | 'inside' = 'after'
): EmailBlock[] => {
    if (!targetId) {
        return [...blocks, newBlock]
    }

    const insertRecursive = (blockList: EmailBlock[]): EmailBlock[] => {
        for (let i = 0; i < blockList.length; i++) {
            const block = blockList[i]

            if (block.id === targetId) {
                switch (position) {
                    case 'before':
                        return [
                            ...blockList.slice(0, i),
                            newBlock,
                            ...blockList.slice(i)
                        ]
                    case 'after':
                        return [
                            ...blockList.slice(0, i + 1),
                            newBlock,
                            ...blockList.slice(i + 1)
                        ]
                    case 'inside':
                        if (!block.children) block.children = []
                        block.children.push(newBlock)
                        return blockList
                }
            }

            if (block.children) {
                block.children = insertRecursive(block.children)
            }
        }
        return blockList
    }

    return insertRecursive(blocks)
}

export const useEmailBuilder = create<EmailBuilderStore>()(
    subscribeWithSelector(
        immer((set, get) => ({
            // Initial state
            template: createDefaultTemplate(),
            selectedBlockId: null,
            draggedItem: null,
            history: [createDefaultTemplate()],
            historyIndex: 0,
            isPreviewMode: false,
            previewDevice: 'desktop',

            // Template management
            setTemplate: (template) => {
                set((state) => {
                    state.template = template
                    state.selectedBlockId = null
                    state.history = [template]
                    state.historyIndex = 0
                })
            },

            updateTemplate: (updates) => {
                set((state) => {
                    Object.assign(state.template, updates)
                    if (state.template.metadata) {
                        state.template.metadata.updatedAt = new Date()
                    }
                })
                get().saveToHistory()
            },

            resetTemplate: () => {
                const newTemplate = createDefaultTemplate()
                set((state) => {
                    state.template = newTemplate
                    state.selectedBlockId = null
                    state.history = [newTemplate]
                    state.historyIndex = 0
                })
            },

            // Block management
            addBlock: (block, targetId, position = 'after') => {
                set((state) => {
                    const newBlock: EmailBlock = {
                        ...block,
                        id: uuidv4(),
                    } as EmailBlock

                    state.template.blocks = insertBlock(
                        state.template.blocks,
                        newBlock,
                        targetId,
                        position
                    )

                    state.selectedBlockId = newBlock.id

                    if (state.template.metadata) {
                        state.template.metadata.updatedAt = new Date()
                    }
                })
                get().saveToHistory()
            },

            removeBlock: (blockId) => {
                set((state) => {
                    state.template.blocks = removeBlockById(state.template.blocks, blockId)
                    if (state.selectedBlockId === blockId) {
                        state.selectedBlockId = null
                    }
                    if (state.template.metadata) {
                        state.template.metadata.updatedAt = new Date()
                    }
                })
                get().saveToHistory()
            },

            duplicateBlock: (blockId) => {
                const block = get().getSelectedBlock()
                if (block) {
                    const duplicatedBlock = {
                        ...block,
                        id: uuidv4(),
                    }
                    get().addBlock(duplicatedBlock, blockId, 'after')
                }
            },

            updateBlock: (blockId, updates) => {
                set((state) => {
                    const updateRecursive = (blocks: EmailBlock[]): void => {
                        for (const block of blocks) {
                            if (block.id === blockId) {
                                Object.assign(block, updates)
                                return
                            }
                            if (block.children) {
                                updateRecursive(block.children)
                            }
                        }
                    }

                    updateRecursive(state.template.blocks)

                    if (state.template.metadata) {
                        state.template.metadata.updatedAt = new Date()
                    }
                })
                get().saveToHistory()
            },

            moveBlock: (blockId, targetId, position) => {
                const block = findBlockById(get().template.blocks, blockId)
                if (block && blockId !== targetId) {
                    get().removeBlock(blockId)
                    get().addBlock(block, targetId, position)
                }
            },

            // Selection management
            selectBlock: (blockId) => {
                set((state) => {
                    state.selectedBlockId = blockId
                })
            },

            getSelectedBlock: () => {
                const { selectedBlockId, template } = get()
                if (!selectedBlockId) return null
                return findBlockById(template.blocks, selectedBlockId)
            },

            // Drag and drop
            setDraggedItem: (item) => {
                set((state) => {
                    state.draggedItem = item
                })
            },

            // History management
            saveToHistory: () => {
                set((state) => {
                    const currentTemplate = JSON.parse(JSON.stringify(state.template))
                    state.history = [
                        ...state.history.slice(0, state.historyIndex + 1),
                        currentTemplate
                    ]
                    state.historyIndex = state.history.length - 1

                    // Limit history to 50 items
                    if (state.history.length > 50) {
                        state.history = state.history.slice(-50)
                        state.historyIndex = state.history.length - 1
                    }
                })
            },

            undo: () => {
                const { historyIndex, history } = get()
                if (historyIndex > 0) {
                    set((state) => {
                        state.historyIndex--
                        state.template = JSON.parse(JSON.stringify(history[state.historyIndex]))
                        state.selectedBlockId = null
                    })
                }
            },

            redo: () => {
                const { historyIndex, history } = get()
                if (historyIndex < history.length - 1) {
                    set((state) => {
                        state.historyIndex++
                        state.template = JSON.parse(JSON.stringify(history[state.historyIndex]))
                        state.selectedBlockId = null
                    })
                }
            },

            canUndo: () => get().historyIndex > 0,
            canRedo: () => get().historyIndex < get().history.length - 1,

            // Preview management
            togglePreviewMode: () => {
                set((state) => {
                    state.isPreviewMode = !state.isPreviewMode
                    if (state.isPreviewMode) {
                        state.selectedBlockId = null
                    }
                })
            },

            setPreviewDevice: (device) => {
                set((state) => {
                    state.previewDevice = device
                })
            },

            // Validation
            validateTemplate: () => {
                try {
                    emailTemplateSchema.parse(get().template)
                    return { success: true, errors: [] }
                } catch (error: any) {
                    return {
                        success: false,
                        errors: error.errors?.map((e: any) => e.message) || ['Invalid template structure']
                    }
                }
            },

            // Export/Import
            exportToJson: () => {
                return JSON.stringify(get().template, null, 2)
            },

            importFromJson: (json) => {
                try {
                    const template = JSON.parse(json)
                    const validatedTemplate = emailTemplateSchema.parse(template)
                    get().setTemplate(validatedTemplate)
                } catch (error) {
                    console.error('Failed to import template:', error)
                    throw new Error('Invalid template JSON')
                }
            },
        }))
    )
)

// Selectors for optimized re-renders
export const useSelectedBlock = () => useEmailBuilder((state) => state.getSelectedBlock())
export const useTemplateBlocks = () => useEmailBuilder((state) => state.template.blocks)
export const useTemplateSettings = () => useEmailBuilder((state) => state.template.settings)

// Create stable selectors to prevent infinite re-renders
export const useBuilderHistory = () => {
    const canUndo = useEmailBuilder((state) => state.canUndo())
    const canRedo = useEmailBuilder((state) => state.canRedo())
    const undo = useEmailBuilder((state) => state.undo)
    const redo = useEmailBuilder((state) => state.redo)

    // Use useMemo to prevent creating new object on every render
    return useMemo(() => ({
        canUndo,
        canRedo,
        undo,
        redo
    }), [canUndo, canRedo, undo, redo])
}