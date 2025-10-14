import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production-min-32-characters-long'
);

// Public routes that don't require authentication
const publicRoutes = ['/', '/signin', '/signup'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow /test/mbti with valid token parameter (public test link)
  if (pathname.startsWith('/test/mbti')) {
    const token = request.nextUrl.searchParams.get('token');
    if (token) {
      // Allow access with token (token will be validated by the API)
      return NextResponse.next();
    }
  }

  // Allow /test/riasec with valid token parameter (public test link)
  if (pathname.startsWith('/test/riasec')) {
    const token = request.nextUrl.searchParams.get('token');
    if (token) {
      // Allow access with token (token will be validated by the API)
      return NextResponse.next();
    }
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // If it's a public route and user is authenticated, redirect to dashboard
  if (isPublicRoute && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      // User is authenticated, redirect to dashboard
      if (pathname === '/signin' || pathname === '/signup') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token, continue to public route
    }
  }

  // If it's a protected route and user is not authenticated, redirect to signin
  if (!isPublicRoute && !token) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If user has token but it's invalid, clear it and redirect to signin
  if (!isPublicRoute && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (error) {
      const response = NextResponse.redirect(new URL('/signin', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
