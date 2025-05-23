import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that don't require authentication
const publicPaths = ['/login', '/signup'];
// List of paths that should be ignored by the middleware
const ignoredPaths = ['/api', '/_next', '/static', '/images', '/favicon.ico'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignore certain paths
    if (ignoredPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check if the path is public
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    // Get the session token from cookies - better-auth uses 'better-auth.session_token' by default
    const sessionToken = request.cookies.get(
        'better-auth.session_token',
    )?.value;

    // If no session token and trying to access a protected route
    if (!sessionToken && !isPublicPath) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If has session token and trying to access login/signup pages
    if (sessionToken && isPublicPath) {
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
