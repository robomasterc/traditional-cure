import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

// Define role-based access for different routes
const roleBasedAccess = {
  '/admin': ['admin'],
  '/doctor': ['admin', 'doctor'],
  '/pharmacy': ['admin', 'doctor', 'pharmacist'],
  '/cash': ['admin', 'cash_manager'],
  '/patients': ['admin', 'case_manager'],
  '/stock': ['admin', 'doctor', 'pharmacist', 'stock_manager'],
};

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signin-sqlite',
  '/auth/error',
  '/unauthorized',
  '/dashboard/test',
  '/dashboard',
];

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Allow access to public routes
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    // Determine sign-in URL based on DATABASE_PROVIDER environment variable
    const databaseProvider = process.env.DATABASE_PROVIDER || 'googlesheets';
    const signInPath = databaseProvider === 'sqlite' ? '/auth/signin-sqlite' : '/auth/signin';
    
    const url = new URL(signInPath, request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Check role-based access for protected routes
  for (const [route, allowedRoles] of Object.entries(roleBasedAccess)) {
    if (path.startsWith(route)) {
      const userRoles = token.roles as string[];
      const hasAccess = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      break;
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 