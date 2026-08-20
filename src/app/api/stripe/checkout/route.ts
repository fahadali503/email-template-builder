import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, createCustomer } from '@/lib/stripe'
import { z } from 'zod'

const checkoutSchema = z.object({
    priceId: z.string(),
})

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await request.json()
        const { priceId } = checkoutSchema.parse(json)

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        let customerId = user.stripeCustomerId

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await createCustomer({
                email: user.email,
                name: user.name || undefined,
                userId: user.id,
            })

            customerId = customer.id

            // Update user with customer ID
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId }
            })
        }

        // Create checkout session
        const checkoutSession = await createCheckoutSession({
            userId: user.id,
            priceId,
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}