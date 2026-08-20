import Stripe from 'stripe'

if (!process.env.STRIPE_API_KEY) {
    throw new Error('STRIPE_API_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: '2024-06-20',
})

export const SUBSCRIPTION_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        interval: 'month' as const,
        features: [
            'Up to 5 templates',
            'Basic editor',
            'Email preview',
            'Community support'
        ],
        stripePriceId: null,
        maxTemplates: 5,
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        description: 'For growing businesses',
        price: 29,
        interval: 'month' as const,
        features: [
            'Unlimited templates',
            'Advanced editor',
            'Variable system',
            'Email analytics',
            'Priority support',
            'Team collaboration'
        ],
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
        maxTemplates: -1, // unlimited
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 99,
        interval: 'month' as const,
        features: [
            'Everything in Pro',
            'Advanced analytics',
            'Custom integrations',
            'Dedicated support',
            'SLA guarantee',
            'Custom branding'
        ],
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        maxTemplates: -1, // unlimited
    },
}

export async function createCheckoutSession({
    userId,
    priceId,
    successUrl,
    cancelUrl,
}: {
    userId: string
    priceId: string
    successUrl: string
    cancelUrl: string
}) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
        },
        allow_promotion_codes: true,
    })

    return session
}

export async function createBillingPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string
    returnUrl: string
}) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    })

    return session
}

export async function createCustomer({
    email,
    name,
    userId,
}: {
    email: string
    name?: string
    userId: string
}) {
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            userId,
        },
    })

    return customer
}