import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Edit3, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Builderly</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Build Beautiful Email Templates
            <span className="text-blue-600"> Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create stunning, responsive email templates with our powerful visual editor.
            No coding required. Perfect for marketing campaigns, newsletters, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Building Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="text-center">
            <CardHeader>
              <Edit3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Visual Editor</CardTitle>
              <CardDescription>
                Drag-and-drop email builder with real-time preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create professional emails without any coding knowledge using our intuitive visual editor.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Dynamic Variables</CardTitle>
              <CardDescription>
                Personalize emails with dynamic content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Insert variables for personalized content and create templates that scale.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>
                Share templates and collaborate with your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Work together on email templates with role-based access and sharing features.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Email Marketing?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of marketers who trust Builderly for their email campaigns.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">Builderly</span>
            </div>
            <p className="text-gray-600">
              © 2024 Builderly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}