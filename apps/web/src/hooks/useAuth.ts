'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import type { AuthUser } from '@amg/shared';
import { api } from '@/lib/api';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type LoginValues = {
  email: string;
  password: string;
};

type GoogleProfile = {
  email: string;
  name?: string;
  phone?: string;
  specialty?: string;
  clinic?: string;
  city?: string;
  professionalTitle?: string;
  practiceType?: string;
  yearsOfExperience?: number;
  avatarUrl?: string | null;
};

type GoogleAuthResult =
  | { needsProfile: true; profile: GoogleProfile }
  | { user: AuthUser };

type GoogleProfileValues = {
  idToken: string;
  name: string;
  phone: string;
  specialty: string;
  clinic: string;
  city: string;
  professionalTitle?: string;
  practiceType?: string;
  yearsOfExperience?: number;
};

const ADMIN_PANEL_ROLES = new Set(['super_admin', 'amg_admin', 'scanner', 'instructor']);
const PUBLIC_AUTH_ROUTES = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]);

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const shouldCheckSession = !PUBLIC_AUTH_ROUTES.has(pathname);

  const authQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<AuthUser>>('/auth/me', {
        headers: { 'x-skip-auth-redirect': '1' },
      });
      return response.data.data;
    },
    retry: false,
    enabled: shouldCheckSession,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await api.post<ApiEnvelope<null>>('/auth/refresh');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      values,
      redirectTo,
    }: {
      values: LoginValues;
      redirectTo?: string | null;
    }) => {
      await api.post('/auth/login', values);
      const response = await api.get<ApiEnvelope<AuthUser>>('/auth/me', {
        headers: { 'x-skip-auth-redirect': '1' },
      });
      return { redirectTo, user: response.data.data };
    },
    onSuccess: async ({ redirectTo, user }) => {
      queryClient.setQueryData(['auth', 'me'], user);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push(redirectTo || (ADMIN_PANEL_ROLES.has(user.role) ? '/admin/dashboard' : '/dashboard'));
      router.refresh();
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async ({
      idToken,
      redirectTo,
    }: {
      idToken: string;
      redirectTo?: string | null;
    }) => {
      const response = await api.post<ApiEnvelope<GoogleAuthResult>>('/auth/google', {
        idToken,
        client: 'web',
      });

      return { redirectTo, result: response.data.data };
    },
    onSuccess: async ({ redirectTo, result }) => {
      if ('needsProfile' in result) {
        return;
      }

      queryClient.setQueryData(['auth', 'me'], result.user);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push(redirectTo || (ADMIN_PANEL_ROLES.has(result.user.role) ? '/admin/dashboard' : '/dashboard'));
      router.refresh();
    },
  });

  const googleProfileMutation = useMutation({
    mutationFn: async ({
      values,
      redirectTo,
    }: {
      values: GoogleProfileValues;
      redirectTo?: string | null;
    }) => {
      const response = await api.post<ApiEnvelope<{ user: AuthUser }>>('/auth/google/complete-profile', {
        ...values,
        client: 'web',
      });
      return { redirectTo, user: response.data.data.user };
    },
    onSuccess: async ({ redirectTo, user }) => {
      queryClient.setQueryData(['auth', 'me'], user);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push(redirectTo || (ADMIN_PANEL_ROLES.has(user.role) ? '/admin/dashboard' : '/dashboard'));
      router.refresh();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: async () => {
      await queryClient.setQueryData(['auth', 'me'], null);
      router.push('/login');
      router.refresh();
    },
  });

  useEffect(() => {
    if (!authQuery.data) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void refreshMutation.mutateAsync().catch(() => undefined);
    }, 10 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, [authQuery.data, refreshMutation]);

  return {
    user: authQuery.data ?? null,
    isLoading: authQuery.isLoading,
    isAuthenticated: Boolean(authQuery.data),
    login: loginMutation.mutateAsync,
    loginWithGoogle: googleLoginMutation.mutateAsync,
    completeGoogleProfile: googleProfileMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshSession: refreshMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    googleLoginPending: googleLoginMutation.isPending,
    googleProfilePending: googleProfileMutation.isPending,
    logoutPending: logoutMutation.isPending,
  };
}
