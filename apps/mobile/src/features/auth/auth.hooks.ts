import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { getSessionMaterial } from '../../lib/storage';
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
} from './auth.types';
import * as authApi from './auth.api';

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
      await auth.setAuthenticatedSession(response);
    },
  });
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
