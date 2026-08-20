import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTemplateSchema = z.object({
    name: z.string().min(1).max(100),
    content: z.string(),
    preview: z.string().optional(),
    isPublic: z.boolean().default(false),
    variables: z.any().optional(),
})

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search')

        const where = {
            userId: session.user.id,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { content: { contains: search, mode: 'insensitive' as const } },
                ]
            } : {})
        }

        const [templates, total] = await Promise.all([
            prisma.template.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { updatedAt: 'desc' },
            }),
            prisma.template.count({ where })
        ])

        return NextResponse.json({
            templates,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Templates GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await request.json()
        const body = createTemplateSchema.parse(json)

        const template = await prisma.template.create({
            data: {
                ...body,
                userId: session.user.id,
            },
        })

        return NextResponse.json(template, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Templates POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}