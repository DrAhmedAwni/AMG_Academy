import type { AuthUser } from '@amg/shared';
import {
  baseTabRoutes,
  canAccessRoute,
  canAccessScanner,
  getVisibleTabRoutes,
  scannerTabRoute,
} from '../auth.types';

const user = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'user-1',
  email: 'student@example.com',
  name: 'Student',
  role: 'user',
  avatarUrl: null,
  emailVerified: true,
  permissions: [],
  ...overrides,
});

describe('role-aware mobile navigation', () => {
  it('hides scanner navigation for normal users', () => {
    expect(canAccessScanner(user())).toBe(false);
    expect(getVisibleTabRoutes(user()).map((route) => route.name)).toEqual(
      baseTabRoutes.map((route) => route.name),
    );
  });

  it('shows scanner navigation for scanner permission', () => {
    const routes = getVisibleTabRoutes(user({ permissions: ['scanner:use'] }));

    expect(canAccessScanner(user({ permissions: ['scanner:use'] }))).toBe(true);
    expect(routes.map((route) => route.name)).toContain('staff');
  });

  it('allows wildcard admins into scanner route guards', () => {
    const admin = user({ role: 'admin', permissions: ['*:*'] });

    expect(canAccessRoute(admin, scannerTabRoute)).toBe(true);
  });

  it('requires an authenticated user for protected routes', () => {
    const homeRoute = baseTabRoutes.find((route) => route.name === 'home');

    expect(homeRoute).toBeDefined();
    expect(canAccessRoute(null, homeRoute!)).toBe(false);
    expect(canAccessRoute(user(), homeRoute!)).toBe(true);
  });
});
