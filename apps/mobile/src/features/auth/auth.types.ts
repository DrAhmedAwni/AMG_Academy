import type { AuthUser } from '@amg/shared';

export type AuthFlowStatus = 'idle' | 'submitting' | 'success' | 'error';

export type AuthRoute = '/(auth)/login' | '/(auth)/register' | '/(auth)/forgot-password';
export type ProtectedRoute = '/(tabs)/home' | '/(tabs)/profile';

export interface AuthFormErrors {
  [field: string]: string | undefined;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialty?: string;
  clinic?: string;
  city?: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface MobileRegisterResponse {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
  verificationUrl?: string;
}

export interface MobileMessageResponse {
  message: string;
}

export const scannerPermissionKeys = ['*:*', 'scanner:use'] as const;
export const scannerRoleSlugs = ['admin', 'staff', 'scanner'] as const;

export function canAccessScanner(user: AuthUser | null | undefined) {
  if (!user) {
    return false;
  }

  return (
    scannerRoleSlugs.includes(user.role as (typeof scannerRoleSlugs)[number]) ||
    scannerPermissionKeys.some((permission) => user.permissions.includes(permission))
  );
}

export interface TabRouteConfig {
  name: 'home' | 'courses' | 'events' | 'community' | 'profile' | 'staff';
  label: string;
  protected: true;
  requiresScanner?: boolean;
}

export const baseTabRoutes: TabRouteConfig[] = [
  { name: 'home', label: 'Home', protected: true },
  { name: 'courses', label: 'Courses', protected: true },
  { name: 'events', label: 'Events', protected: true },
  { name: 'community', label: 'Community', protected: true },
  { name: 'profile', label: 'Profile', protected: true },
];

export const scannerTabRoute: TabRouteConfig = {
  name: 'staff',
  label: 'Scanner',
  protected: true,
  requiresScanner: true,
};

export function getVisibleTabRoutes(_user: AuthUser | null | undefined) {
  return baseTabRoutes;
}

export function canAccessRoute(
  user: AuthUser | null | undefined,
  route: Pick<TabRouteConfig, 'requiresScanner'>,
) {
  if (!route.requiresScanner) {
    return Boolean(user);
  }

  return canAccessScanner(user);
}
