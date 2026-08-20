import React from 'react'
import {
    Text as ReactEmailText,
    Heading as ReactEmailHeading,
    Button as ReactEmailButton,
    Img as ReactEmailImg,
    Hr as ReactEmailHr,
    Container as ReactEmailContainer,
    Column as ReactEmailColumn,
    Row as ReactEmailRow,
    Html as ReactEmailHtml,
    Head as ReactEmailHead,
    Body as ReactEmailBody,
} from '@react-email/components'
import {
    EmailBlock,
    TextBlock,
    HeadingBlock,
    ButtonBlock,
    ImageBlock,
    DividerBlock,
    SpacerBlock,
    ContainerBlock,
    ColumnsBlock,
    HtmlBlock,
    EmailStyle
} from '@/types/email-builder'

// Utility function to convert style object to CSS string
const styleToCss = (style: EmailStyle = {}): React.CSSProperties => {
    return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        textAlign: style.textAlign as any,
        padding: style.padding,
        margin: style.margin,
        borderRadius: style.borderRadius,
        border: style.border,
        width: style.width,
        height: style.height,
    }
}

// Text Block Component
export const TextBlockComponent: React.FC<{ block: TextBlock }> = ({ block }) => {
    const style = styleToCss(block.style)

    return (
        <ReactEmailText style={style}>
            <div dangerouslySetInnerHTML={{ __html: block.props.content }} />
        </ReactEmailText>
    )
}

// Heading Block Component
export const HeadingBlockComponent: React.FC<{ block: HeadingBlock }> = ({ block }) => {
    const style = styleToCss(block.style)

    return (
        <ReactEmailHeading as={block.props.level} style={style}>
            <div dangerouslySetInnerHTML={{ __html: block.props.content }} />
        </ReactEmailHeading>
    )
}

// Button Block Component
export const ButtonBlockComponent: React.FC<{ block: ButtonBlock }> = ({ block }) => {
    const style = styleToCss(block.style)

    return (
        <ReactEmailButton
            href={block.props.href}
            target={block.props.target}
            style={{
                backgroundColor: '#000',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
                ...style,
            }}
        >
            {block.props.text}
        </ReactEmailButton>
    )
}

// Image Block Component
export const ImageBlockComponent: React.FC<{ block: ImageBlock }> = ({ block }) => {
    const style = styleToCss(block.style)

    return (
        <ReactEmailImg
            src={block.props.src}
            alt={block.props.alt || ''}
            width={block.props.width}
            height={block.props.height}
            style={{
                maxWidth: '100%',
                height: 'auto',
                ...style,
            }}
        />
    )
}

// Divider Block Component
export const DividerBlockComponent: React.FC<{ block: DividerBlock }> = ({ block }) => {
    const style = styleToCss(block.style)

    return (
        <ReactEmailHr
            style={{
                border: 'none',
                borderTop: `${block.props.thickness}px ${block.props.style} #e5e7eb`,
                margin: '16px 0',
                ...style,
            }}
        />
    )
}

// Spacer Block Component
export const SpacerBlockComponent: React.FC<{ block: SpacerBlock }> = ({ block }) => {
    return (
        <div
            style={{
                height: `${block.props.height}px`,
                lineHeight: `${block.props.height}px`,
                fontSize: '1px',
            }}
        >
            &nbsp;
        </div>
    )
}

// Container Block Component
export const ContainerBlockComponent: React.FC<{ block: ContainerBlock }> = ({ block }) => {
    const style = styleToCss(block.style)

    return (
        <ReactEmailContainer
            style={{
                maxWidth: `${block.props.maxWidth}px`,
                margin: '0 auto',
                ...style,
            }}
        >
            {block.children?.map((child) => (
                <EmailBlockRenderer key={child.id} block={child} />
            ))}
        </ReactEmailContainer>
    )
}

// Columns Block Component
export const ColumnsBlockComponent: React.FC<{ block: ColumnsBlock }> = ({ block }) => {
    const style = styleToCss(block.style)
    const columnWidth = `${Math.floor(100 / block.props.columns)}%`

    return (
        <ReactEmailRow style={style}>
            {Array.from({ length: block.props.columns }, (_, index) => {
                const columnBlocks = block.children?.filter((_, i) => i % block.props.columns === index) || []

                return (
                    <ReactEmailColumn
                        key={index}
                        style={{
                            width: columnWidth,
                            paddingRight: index < block.props.columns - 1 ? `${block.props.gap}px` : '0',
                        }}
                    >
                        {columnBlocks.map((child) => (
                            <EmailBlockRenderer key={child.id} block={child} />
                        ))}
                    </ReactEmailColumn>
                )
            })}
        </ReactEmailRow>
    )
}

// HTML Block Component
export const HtmlBlockComponent: React.FC<{ block: HtmlBlock }> = ({ block }) => {
    return <div dangerouslySetInnerHTML={{ __html: block.props.content }} />
}

// Main Email Block Renderer
export const EmailBlockRenderer: React.FC<{ block: EmailBlock }> = ({ block }) => {
    switch (block.type) {
        case 'text':
            return <TextBlockComponent block={block as TextBlock} />
        case 'heading':
            return <HeadingBlockComponent block={block as HeadingBlock} />
        case 'button':
            return <ButtonBlockComponent block={block as ButtonBlock} />
        case 'image':
            return <ImageBlockComponent block={block as ImageBlock} />
        case 'divider':
            return <DividerBlockComponent block={block as DividerBlock} />
        case 'spacer':
            return <SpacerBlockComponent block={block as SpacerBlock} />
        case 'container':
            return <ContainerBlockComponent block={block as ContainerBlock} />
        case 'columns':
            return <ColumnsBlockComponent block={block as ColumnsBlock} />
        case 'html':
            return <HtmlBlockComponent block={block as HtmlBlock} />
        default:
            return null
    }
}

// Complete Email Template Renderer
interface EmailTemplateRendererProps {
    blocks: EmailBlock[]
    settings?: {
        backgroundColor?: string
        fontFamily?: string
        width?: number
    }
}

export const EmailTemplateRenderer: React.FC<EmailTemplateRendererProps> = ({
    blocks,
    settings = {},
}) => {
    return (
        <ReactEmailHtml>
            <ReactEmailHead />
            <ReactEmailBody
                style={{
                    backgroundColor: settings.backgroundColor || '#ffffff',
                    fontFamily: settings.fontFamily || 'Arial, sans-serif',
                    margin: 0,
                    padding: 0,
                }}
            >
                <ReactEmailContainer
                    style={{
                        maxWidth: `${settings.width || 600}px`,
                        margin: '0 auto',
                        padding: '20px',
                    }}
                >
                    {blocks.map((block) => (
                        <EmailBlockRenderer key={block.id} block={block} />
                    ))}
                </ReactEmailContainer>
            </ReactEmailBody>
        </ReactEmailHtml>
    )
}