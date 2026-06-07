import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { ApiClientError } from '../../lib/api';
import { getSessionMaterial } from '../../lib/storage';
import type {
  ForgotPasswordFormValues,
  GoogleProfileCompletionValues,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';
import * as authApi from './auth.api';
import type { MobileAuthResponse } from '../../types/api';

export const authQueryKeys = {
  me: ['auth', 'me'] as const,
};

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: authApi.currentUser,
    enabled,
  });
}

export function useLoginMutation() {
  const auth = useAuth();

  return useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: async (response) => {
      ensureMobileTokens(response);
      await auth.setAuthenticatedSession(response);
    },
  });
}

export function useGoogleLoginMutation() {
  const auth = useAuth();

  return useMutation({
    mutationFn: (idToken: string) => authApi.loginWithGoogle(idToken),
    onSuccess: async (response) => {
      if ('user' in response) {
        ensureMobileTokens(response);
        await auth.setAuthenticatedSession(response);
      }
    },
  });
}

export function useCompleteGoogleProfileMutation() {
  const auth = useAuth();

  return useMutation({
    mutationFn: (values: GoogleProfileCompletionValues) => authApi.completeGoogleProfile(values),
    onSuccess: async (response) => {
      ensureMobileTokens(response);
      await auth.setAuthenticatedSession(response);
    },
  });
}

function ensureMobileTokens(response: MobileAuthResponse) {
  if (!response.tokens?.accessToken) {
    throw new ApiClientError({
      code: 'MOBILE_TOKENS_MISSING',
      message: 'The server did not return a mobile session token. Please redeploy the API and try again.',
      status: 0,
    });
  }
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (values: RegisterFormValues) => authApi.register(values),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => authApi.forgotPassword(values),
  });
}

export function useRefreshSessionMutation() {
  const auth = useAuth();

  return useMutation({
    mutationFn: async () => {
      const material = await getSessionMaterial();
      return authApi.refresh(material?.refreshToken);
    },
    onSuccess: async () => {
      await auth.refresh();
    },
  });
}

export function useLogoutMutation() {
  const auth = useAuth();

  return useMutation({
    mutationFn: auth.logout,
  });
}
