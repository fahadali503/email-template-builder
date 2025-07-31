import { z } from 'zod'

// Base styling schema
export const emailStyleSchema = z.object({
    backgroundColor: z.string().optional(),
    color: z.string().optional(),
    fontSize: z.string().optional(),
    fontFamily: z.string().optional(),
    fontWeight: z.string().optional(),
    textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
    padding: z.string().optional(),
    margin: z.string().optional(),
    borderRadius: z.string().optional(),
    border: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
})

// Email block types
export const emailBlockTypeSchema = z.enum([
    'text',
    'heading',
    'button',
    'image',
    'divider',
    'spacer',
    'container',
    'columns',
    'html'
])

// Base email block schema
export const baseEmailBlockSchema = z.object({
    id: z.string(),
    type: emailBlockTypeSchema,
    style: emailStyleSchema.optional(),
    children: z.array(z.lazy(() => emailBlockSchema)).optional(),
})

// Text block schema
export const textBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('text'),
    props: z.object({
        content: z.string(),
        tag: z.enum(['p', 'span', 'div']).default('p'),
    }),
})

// Heading block schema
export const headingBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('heading'),
    props: z.object({
        content: z.string(),
        level: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).default('h1'),
    }),
})

// Button block schema
export const buttonBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('button'),
    props: z.object({
        text: z.string(),
        href: z.string().url().optional(),
        target: z.enum(['_blank', '_self']).default('_blank'),
    }),
})

// Image block schema
export const imageBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('image'),
    props: z.object({
        src: z.string().url(),
        alt: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
    }),
})

// Divider block schema
export const dividerBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('divider'),
    props: z.object({
        thickness: z.number().default(1),
        style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
    }),
})

// Spacer block schema
export const spacerBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('spacer'),
    props: z.object({
        height: z.number().default(20),
    }),
})

// Container block schema
export const containerBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('container'),
    props: z.object({
        maxWidth: z.number().default(600),
    }),
})

// Columns block schema
export const columnsBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('columns'),
    props: z.object({
        columns: z.number().min(1).max(4).default(2),
        gap: z.number().default(16),
    }),
})

// HTML block schema
export const htmlBlockSchema = baseEmailBlockSchema.extend({
    type: z.literal('html'),
    props: z.object({
        content: z.string(),
    }),
})

// Union of all email block schemas
export const emailBlockSchema: z.ZodType<EmailBlock> = z.discriminatedUnion('type', [
    textBlockSchema,
    headingBlockSchema,
    buttonBlockSchema,
    imageBlockSchema,
    dividerBlockSchema,
    spacerBlockSchema,
    containerBlockSchema,
    columnsBlockSchema,
    htmlBlockSchema,
])

// Email template schema
export const emailTemplateSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Template name is required'),
    subject: z.string().optional(),
    blocks: z.array(emailBlockSchema),
    variables: z.record(z.string(), z.string()).optional(),
    settings: z.object({
        previewText: z.string().optional(),
        backgroundColor: z.string().default('#ffffff'),
        fontFamily: z.string().default('Arial, sans-serif'),
        width: z.number().default(600),
    }).optional(),
    metadata: z.object({
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        version: z.string().default('1.0.0'),
    }).optional(),
})

// TypeScript types inferred from schemas
export type EmailStyle = z.infer<typeof emailStyleSchema>
export type EmailBlockType = z.infer<typeof emailBlockTypeSchema>
export type BaseEmailBlock = z.infer<typeof baseEmailBlockSchema>

export type TextBlock = z.infer<typeof textBlockSchema>
export type HeadingBlock = z.infer<typeof headingBlockSchema>
export type ButtonBlock = z.infer<typeof buttonBlockSchema>
export type ImageBlock = z.infer<typeof imageBlockSchema>
export type DividerBlock = z.infer<typeof dividerBlockSchema>
export type SpacerBlock = z.infer<typeof spacerBlockSchema>
export type ContainerBlock = z.infer<typeof containerBlockSchema>
export type ColumnsBlock = z.infer<typeof columnsBlockSchema>
export type HtmlBlock = z.infer<typeof htmlBlockSchema>

export type EmailBlock =
    | TextBlock
    | HeadingBlock
    | ButtonBlock
    | ImageBlock
    | DividerBlock
    | SpacerBlock
    | ContainerBlock
    | ColumnsBlock
    | HtmlBlock

export type EmailTemplate = z.infer<typeof emailTemplateSchema>

// Builder-specific types
export interface DragItem {
    id: string
    type: EmailBlockType
    isNew?: boolean
}

export interface DropResult {
    draggedId: string
    targetId?: string
    position: 'before' | 'after' | 'inside'
}

// Block library definitions
export interface BlockDefinition {
    type: EmailBlockType
    name: string
    description: string
    icon: React.ReactNode
    category: 'basic' | 'layout' | 'advanced'
    defaultProps: Record<string, any>
    defaultStyle?: EmailStyle
}

// Builder state
export interface BuilderState {
    template: EmailTemplate
    selectedBlockId: string | null
    draggedItem: DragItem | null
    history: EmailTemplate[]
    historyIndex: number
    isPreviewMode: boolean
    previewDevice: 'desktop' | 'mobile'
}