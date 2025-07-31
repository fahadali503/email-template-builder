import { User, Template, Role } from '@prisma/client'

export type { User, Template, Role }

export interface UserWithTemplates extends User {
    templates: Template[]
}

export interface TemplateWithUser extends Template {
    user: User
}

export interface AuthUser {
    id: string
    email: string
    name?: string | null
    role: Role
}

export interface TemplateVariable {
    key: string
    value: string
    type: 'text' | 'number' | 'email' | 'date'
}

export interface EmailComponent {
    id: string
    type: 'text' | 'image' | 'button' | 'divider' | 'spacer'
    props: Record<string, any>
    children?: EmailComponent[]
}

export interface SubscriptionPlan {
    id: string
    name: string
    description: string
    price: number
    interval: 'month' | 'year'
    features: string[]
    stripePriceId: string
}

export interface EditorState {
    content: string
    variables: TemplateVariable[]
    previewData: Record<string, any>
    isMobilePreview: boolean
}