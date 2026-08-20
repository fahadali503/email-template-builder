import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { EmailTemplate } from '@/components/email-components/email-template'
import { z } from 'zod'

const testEmailSchema = z.object({
    templateId: z.string(),
    recipient: z.string().email(),
    variables: z.record(z.string()).optional(),
})

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await request.json()
        const { templateId, recipient, variables = {} } = testEmailSchema.parse(json)

        // Get template from database
        const template = await prisma.template.findFirst({
            where: {
                id: templateId,
                OR: [
                    { userId: session.user.id },
                    { isPublic: true }
                ]
            }
        })

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        // Render email HTML
        const emailHtml = await render(
            EmailTemplate({
                content: template.content,
                variables: { ...template.variables, ...variables }
            })
        )

        // In a real implementation, you would use a service like:
        // - Nodemailer with SMTP
        // - SendGrid
        // - AWS SES
        // - Resend
        // - Postmark

        // For demo purposes, we'll just log the email
        console.log('Test email would be sent to:', recipient)
        console.log('Subject:', `Test: ${template.name}`)
        console.log('HTML Content length:', emailHtml.length)

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Here's how you might integrate with a real email service:
        /*
        const nodemailer = require('nodemailer')
        
        const transporter = nodemailer.createTransporter({
          service: 'gmail', // or your email service
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        })
    
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: recipient,
          subject: `Test: ${template.name}`,
          html: emailHtml
        })
        */

        return NextResponse.json({
            message: 'Test email sent successfully',
            recipient,
            templateName: template.name
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Test email error:', error)
        return NextResponse.json(
            { error: 'Failed to send test email' },
            { status: 500 }
        )
    }
}