import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Button,
    Hr,
} from '@react-email/components'

interface EmailTemplateProps {
    content: string
    variables?: Record<string, string>
}

// Parse HTML content and convert to react-email components
function parseContent(content: string, variables: Record<string, string> = {}) {
    // Replace variables in content
    let processedContent = content
    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        processedContent = processedContent.replace(regex, value)
    })

    // For now, return the content as HTML
    // In a full implementation, you'd parse HTML and convert to React components
    return processedContent
}

export function EmailTemplate({ content, variables = {} }: EmailTemplateProps) {
    const processedContent = parseContent(content, variables)

    return (
        <Html>
            <Head />
            <Preview>Email Template Preview</Preview>
            <Body style={main}>
                <Container style={container}>
                    <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                </Container>
            </Body>
        </Html>
    )
}

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '580px',
}