import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTemplateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    content: z.string().optional(),
    preview: z.string().optional(),
    isPublic: z.boolean().optional(),
    variables: z.any().optional(),
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const template = await prisma.template.findFirst({
            where: {
                id: resolvedParams.id,
                OR: [
                    { userId: session.user.id },
                    { isPublic: true }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        return NextResponse.json(template)
    } catch (error) {
        console.error('Template GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await request.json()
        const body = updateTemplateSchema.parse(json)
        const resolvedParams = await params

        // Check if user owns the template
        const existingTemplate = await prisma.template.findFirst({
            where: {
                id: resolvedParams.id,
                userId: session.user.id
            }
        })

        if (!existingTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        const template = await prisma.template.update({
            where: { id: resolvedParams.id },
            data: body,
        })

        return NextResponse.json(template)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Template PUT error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params

        // Check if user owns the template
        const existingTemplate = await prisma.template.findFirst({
            where: {
                id: resolvedParams.id,
                userId: session.user.id
            }
        })

        if (!existingTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 })
        }

        await prisma.template.delete({
            where: { id: resolvedParams.id }
        })

        return NextResponse.json({ message: 'Template deleted successfully' })
    } catch (error) {
        console.error('Template DELETE error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}