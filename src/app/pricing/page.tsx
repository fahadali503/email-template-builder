'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowRight, Star } from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'

export default function PricingPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleSubscribe = async (priceId: string, planId: string) => {
        if (!session) {
            router.push('/login')
            return
        }

        if (planId === 'free') {
            router.push('/dashboard')
            return
        }

        setLoading(planId)

        try {
            const response = await axios.post('/api/stripe/checkout', {
                priceId,
            })

            if (response.data.url) {
                window.location.href = response.data.url
            }
        } catch (error) {
            console.error('Subscription error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">Builderly</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            {session ? (
                                <Link href="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost">Sign In</Button>
                                    </Link>
                                    <Link href="/signup">
                                        <Button>Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Pricing Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Start free and scale as you grow. All plans include our core features
                        with different limits and advanced capabilities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.id === 'pro'
                                    ? 'border-blue-500 shadow-lg scale-105'
                                    : 'border-gray-200'
                                }`}
                        >
                            {plan.id === 'pro' && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                                        <Star className="w-4 h-4 mr-1" />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <CardHeader className="text-center pb-8">
                                <CardTitle className="text-2xl font-bold">
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    {plan.description}
                                </CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">
                                        ${plan.price}
                                    </span>
                                    <span className="text-gray-600">
                                        /{plan.interval}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    variant={plan.id === 'pro' ? 'default' : 'outline'}
                                    onClick={() => handleSubscribe(plan.stripePriceId || '', plan.id)}
                                    disabled={loading === plan.id}
                                >
                                    {loading === plan.id ? (
                                        'Processing...'
                                    ) : plan.id === 'free' ? (
                                        'Get Started Free'
                                    ) : (
                                        <>
                                            Subscribe to {plan.name}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                Can I change plans anytime?
                            </h3>
                            <p className="text-gray-600">
                                Yes, you can upgrade or downgrade your plan at any time.
                                Changes take effect immediately and we'll prorate the charges.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                Is there a free trial?
                            </h3>
                            <p className="text-gray-600">
                                Yes, our Free plan gives you access to core features forever.
                                You can upgrade when you need more advanced capabilities.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600">
                                We accept all major credit cards (Visa, MasterCard, American Express)
                                and PayPal through our secure Stripe integration.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">
                                Can I cancel anytime?
                            </h3>
                            <p className="text-gray-600">
                                Absolutely. You can cancel your subscription at any time from your
                                account settings. You'll retain access until the end of your billing period.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center mt-20 bg-blue-600 rounded-2xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Build Amazing Email Templates?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of marketers who trust Builderly for their email campaigns.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/login" className="text-white hover:underline">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}