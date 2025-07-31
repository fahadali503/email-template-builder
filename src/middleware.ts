import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAuth = !!token
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/signup')
        const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
        const isApiRoute = req.nextUrl.pathname.startsWith('/api')

        // Allow API routes to handle their own auth
        if (isApiRoute) {
            return NextResponse.next()
        }

        // Redirect authenticated users away from auth pages
        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
            return NextResponse.next()
        }

        // Protect admin routes
        if (isAdminPage) {
            if (!isAuth) {
                return NextResponse.redirect(new URL('/login', req.url))
            }

            if (token?.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }

        // Protect all other authenticated routes
        if (!isAuth) {
            let from = req.nextUrl.pathname
            if (req.nextUrl.search) {
                from += req.nextUrl.search
            }

            return NextResponse.redirect(
                new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
            )
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                    req.nextUrl.pathname.startsWith('/signup')
                const isPublicPage = req.nextUrl.pathname === '/' ||
                    req.nextUrl.pathname.startsWith('/pricing')
                const isApiRoute = req.nextUrl.pathname.startsWith('/api')

                // Allow access to auth pages, public pages, and API routes without token
                if (isAuthPage || isPublicPage || isApiRoute) {
                    return true
                }

                // Require token for all other routes
                return !!token
            },
        },
    }
)

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}