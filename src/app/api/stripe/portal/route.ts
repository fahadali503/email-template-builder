import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 400 }
            )
        }

        // Create billing portal session
        const portalSession = await createBillingPortalSession({
            customerId: user.stripeCustomerId,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error('Stripe portal error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}