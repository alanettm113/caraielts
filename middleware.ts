import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('sb-access-token')?.value

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/ielts')

    // Redirect authenticated users away from login/register
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
}
export const config = {
    matcher: ['/dashboard/:path*', '/ielts/:path*', '/auth/:path*']
}