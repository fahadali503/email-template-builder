'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, User, Settings, Bell } from 'lucide-react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function AccountPage() {
    const { data: session, update } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [billingLoading, setBillingLoading] = useState(false)

    const form = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
        },
    })

    const onSubmit = async (data: ProfileForm) => {
        setIsLoading(true)
        try {
            // API call to update profile would go here
            console.log('Profile update:', data)
            await update()
            alert('Profile updated successfully!')
        } catch (error) {
            console.error('Profile update error:', error)
            alert('Failed to update profile. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleManageBilling = async () => {
        setBillingLoading(true)
        try {
            const response = await axios.post('/api/stripe/portal')
            if (response.data.url) {
                window.location.href = response.data.url
            }
        } catch (error) {
            console.error('Billing portal error:', error)
            alert('Failed to open billing portal. Please try again.')
        } finally {
            setBillingLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="mt-2 text-gray-600">
                    Manage your account settings and billing information
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-2">
                    <nav className="space-y-1">
                        <a
                            href="#profile"
                            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
                        >
                            <User className="mr-3 h-4 w-4" />
                            Profile
                        </a>
                        <a
                            href="#billing"
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                            <CreditCard className="mr-3 h-4 w-4" />
                            Billing
                        </a>
                        <a
                            href="#preferences"
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                            <Settings className="mr-3 h-4 w-4" />
                            Preferences
                        </a>
                        <a
                            href="#notifications"
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                        >
                            <Bell className="mr-3 h-4 w-4" />
                            Notifications
                        </a>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Section */}
                    <Card id="profile">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your account profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter your full name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        {...field}
                                                        disabled
                                                    />
                                                </FormControl>
                                                <p className="text-xs text-gray-500">
                                                    Contact support to change your email address
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Billing Section */}
                    <Card id="billing">
                        <CardHeader>
                            <CardTitle>Billing & Subscription</CardTitle>
                            <CardDescription>
                                Manage your subscription and billing information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Current Plan</h3>
                                    <p className="text-sm text-gray-600">
                                        {session?.user?.role === 'ADMIN' ? 'Admin Account' : 'Free Plan'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">$0/month</p>
                                    <p className="text-sm text-gray-600">Free forever</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleManageBilling}
                                    disabled={billingLoading}
                                    className="flex-1"
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {billingLoading ? 'Loading...' : 'Manage Billing'}
                                </Button>
                                <Button className="flex-1">
                                    Upgrade Plan
                                </Button>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 mb-2">Usage</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Templates created</span>
                                        <span className="font-medium">0 / 5</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences Section */}
                    <Card id="preferences">
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>
                                Customize your account preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Theme</h3>
                                    <p className="text-sm text-gray-600">Choose your preferred theme</p>
                                </div>
                                <select className="border rounded-md px-3 py-2">
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Language</h3>
                                    <p className="text-sm text-gray-600">Select your preferred language</p>
                                </div>
                                <select className="border rounded-md px-3 py-2">
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications Section */}
                    <Card id="notifications">
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>
                                Choose what notifications you want to receive
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Email updates', description: 'Receive email updates about new features' },
                                { name: 'Marketing emails', description: 'Receive marketing and promotional emails' },
                                { name: 'Template sharing', description: 'Get notified when someone shares a template with you' },
                                { name: 'Account security', description: 'Important security and account notifications' },
                            ].map((notification) => (
                                <div key={notification.name} className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{notification.name}</h3>
                                        <p className="text-sm text-gray-600">{notification.description}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        defaultChecked={notification.name === 'Account security'}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}