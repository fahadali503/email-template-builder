'use client'

import { Button, Heading, Text, Section, Hr, Img } from '@react-email/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Type, Image, Minus, Square, MousePointer } from 'lucide-react'

export interface EmailBlock {
    id: string
    name: string
    icon: React.ReactNode
    description: string
    category: 'text' | 'media' | 'layout' | 'button'
    component: React.ComponentType<any>
    defaultProps?: Record<string, any>
}

// Email component definitions
export const TextBlock = ({ children, style, ...props }: any) => (
    <Text style={{ margin: '16px 0', fontSize: '14px', lineHeight: '24px', ...style }} {...props}>
        {children || 'Add your text here...'}
    </Text>
)

export const HeadingBlock = ({ children, level = 1, style, ...props }: any) => {
    const headingStyle = {
        margin: '16px 0',
        fontWeight: 'bold',
        ...(level === 1 && { fontSize: '32px', lineHeight: '40px' }),
        ...(level === 2 && { fontSize: '24px', lineHeight: '32px' }),
        ...(level === 3 && { fontSize: '18px', lineHeight: '28px' }),
        ...style
    }

    return (
        <Heading as={`h${level}` as any} style={headingStyle} {...props}>
            {children || `Heading ${level}`}
        </Heading>
    )
}

export const ButtonBlock = ({ children, href = '#', style, ...props }: any) => (
    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
            href={href}
            style={{
                backgroundColor: '#000',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '16px',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'inline-block',
                padding: '12px 24px',
                ...style
            }}
            {...props}
        >
            {children || 'Click Me'}
        </Button>
    </Section>
)

export const ImageBlock = ({ src, alt = 'Image', width = 400, style, ...props }: any) => (
    <Section style={{ margin: '16px 0' }}>
        <Img
            src={src || 'https://via.placeholder.com/400x200'}
            alt={alt}
            width={width}
            style={{ width: '100%', height: 'auto', ...style }}
            {...props}
        />
    </Section>
)

export const DividerBlock = ({ style, ...props }: any) => (
    <Hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '32px 0', ...style }} {...props} />
)

export const SpacerBlock = ({ height = 32, ...props }: any) => (
    <Section style={{ height: `${height}px` }} {...props} />
)

// Block definitions for the component library
export const EMAIL_BLOCKS: EmailBlock[] = [
    {
        id: 'text',
        name: 'Text',
        icon: <Type className="w-5 h-5" />,
        description: 'Add paragraph text to your email',
        category: 'text',
        component: TextBlock,
        defaultProps: {
            children: 'This is a paragraph of text. You can edit this content to match your needs.'
        }
    },
    {
        id: 'heading',
        name: 'Heading',
        icon: <Type className="w-5 h-5" />,
        description: 'Add a heading to your email',
        category: 'text',
        component: HeadingBlock,
        defaultProps: {
            level: 1,
            children: 'Your Heading Here'
        }
    },
    {
        id: 'button',
        name: 'Button',
        icon: <MousePointer className="w-5 h-5" />,
        description: 'Add a call-to-action button',
        category: 'button',
        component: ButtonBlock,
        defaultProps: {
            href: 'https://example.com',
            children: 'Call to Action'
        }
    },
    {
        id: 'image',
        name: 'Image',
        icon: <Image className="w-5 h-5" />,
        description: 'Add an image to your email',
        category: 'media',
        component: ImageBlock,
        defaultProps: {
            src: 'https://via.placeholder.com/400x200',
            alt: 'Placeholder image',
            width: 400
        }
    },
    {
        id: 'divider',
        name: 'Divider',
        icon: <Minus className="w-5 h-5" />,
        description: 'Add a horizontal line divider',
        category: 'layout',
        component: DividerBlock,
        defaultProps: {}
    },
    {
        id: 'spacer',
        name: 'Spacer',
        icon: <Square className="w-5 h-5" />,
        description: 'Add vertical spacing',
        category: 'layout',
        component: SpacerBlock,
        defaultProps: {
            height: 32
        }
    },
]

interface EmailBlocksLibraryProps {
    onBlockSelect: (block: EmailBlock) => void
}

export function EmailBlocksLibrary({ onBlockSelect }: EmailBlocksLibraryProps) {
    const categories = Array.from(new Set(EMAIL_BLOCKS.map(block => block.category)))

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Email Components</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Click on any component to add it to your email template.
                </p>
            </div>

            {categories.map(category => (
                <div key={category}>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                        {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                        {EMAIL_BLOCKS.filter(block => block.category === category).map(block => (
                            <Card
                                key={block.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => onBlockSelect(block)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 text-gray-500">
                                            {block.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-medium text-gray-900">
                                                {block.name}
                                            </h5>
                                            <p className="text-xs text-gray-500 truncate">
                                                {block.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}