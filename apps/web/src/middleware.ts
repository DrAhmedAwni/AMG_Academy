import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  verifyAccessToken,
} from '@/lib/auth';
import {
  ADMIN_PROTECTED_PREFIXES,
  AUTH_ROUTES,
  SCANNER_PROTECTED_PREFIXES,
  USER_PROTECTED_PREFIXES,
} from '@/constants/routes';

const matchesPrefix = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const adminRoutePermissions: Array<{ prefix: string; permission: string }> = [
  { prefix: '/admin/users', permission: 'users:read' },
  { prefix: '/admin/roles', permission: 'roles:read' },
  { prefix: '/admin/announcements', permission: 'announcements:read' },
  { prefix: '/admin/audit-logs', permission: 'audit_logs:read' },
  { prefix: '/admin/events', permission: 'events:read' },
  { prefix: '/admin/registrations', permission: 'registrations:read' },
  { prefix: '/admin/payments', permission: 'payments:read' },
  { prefix: '/admin/certificates', permission: 'certificates:read' },
  { prefix: '/admin/courses', permission: 'courses:read' },
  { prefix: '/admin/lessons', permission: 'courses:read' },
  { prefix: '/admin/reports', permission: 'reports:read' },
  { prefix: '/admin/exports', permission: 'exports:create' },
  { prefix: '/admin/content-pages', permission: 'content_pages:read' },
  { prefix: '/admin/attendance', permission: 'attendance:read' },
  { prefix: '/admin/qr-scanner', permission: 'scanner:use' },
  { prefix: '/admin/cases', permission: 'cases:moderate' },
];

const hasUserPermission = (user: { permissions?: string[] }, permission: string) =>
  Boolean(user.permissions?.includes('*:*') || user.permissions?.includes(permission));

const resolveAdminPermission = (pathname: string) =>
  adminRoutePermissions.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`))?.permission;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const needsUserAuth = matchesPrefix(pathname, USER_PROTECTED_PREFIXES);
  const needsAdminAuth = matchesPrefix(pathname, ADMIN_PROTECTED_PREFIXES);
  const needsScannerAuth = matchesPrefix(pathname, SCANNER_PROTECTED_PREFIXES);
  const needsAuth = needsUserAuth || needsAdminAuth || needsScannerAuth;

  if (!needsAuth && !isAuthRoute) {
    return NextResponse.next();
  }

  if (!token) {
    if (needsAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const user = await verifyAccessToken(token);

    // Reject tokens without tokenVersion (legacy tokens issued before fix)
    if (typeof (user as any).tokenVersion !== 'number') {
      throw new Error('Token missing tokenVersion');
    }

    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (needsAdminAuth) {
      if (!['super_admin', 'amg_admin', 'scanner', 'instructor'].includes(user.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (user.role === 'scanner' && !matchesPrefix(pathname, ['/admin/attendance', '/admin/qr-scanner'])) {
        return NextResponse.redirect(new URL('/admin/qr-scanner', request.url));
      }

      if (user.role === 'instructor' && !matchesPrefix(pathname, ['/admin/courses', '/admin/lessons'])) {
        return NextResponse.redirect(new URL('/admin/courses', request.url));
      }

      const requiredPermission = resolveAdminPermission(pathname);
      if (requiredPermission && !hasUserPermission(user, requiredPermission)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    if (needsScannerAuth && !['scanner', 'super_admin', 'amg_admin'].includes(user.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch {
    // If already on an auth route and token is invalid, just clear the cookie and proceed
    // instead of redirecting to login again (which causes an infinite loop)
    if (isAuthRoute) {
      const response = NextResponse.next();
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      return response;
    }

    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/scanner/:path*', '/profile/:path*', '/settings/:path*', '/notifications/:path*', '/my-reservations/:path*', '/my-qr-tickets/:path*', '/my-courses/:path*', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'],
};
