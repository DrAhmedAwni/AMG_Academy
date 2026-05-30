import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { canAccessScanner } from './auth.types';

export interface ProtectedRouteOptions {
  requireScanner?: boolean;
  redirectTo?: string;
}

export function useProtectedRoute({
  requireScanner = false,
  redirectTo = '/(auth)/login',
}: ProtectedRouteOptions = {}) {
  const router = useRouter();
  const auth = useAuth();
  const isAuthenticated = auth.status === 'authenticated';
  const isAllowed = isAuthenticated && (!requireScanner || canAccessScanner(auth.user));

  useEffect(() => {
    if (auth.status === 'anonymous' || auth.status === 'expired') {
      router.replace(redirectTo as never);
    }
  }, [auth.status, redirectTo, router]);

  return {
    status: auth.status,
    user: auth.user,
    isAuthenticated,
    isAllowed,
    isLoading: auth.status === 'loading',
    isExpired: auth.status === 'expired',
  };
}
