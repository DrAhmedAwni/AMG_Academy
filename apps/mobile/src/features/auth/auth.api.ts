import type { AuthUser } from '@amg/shared';
import {
  forgotPasswordSchema,
  loginSchema,
  googleMobileAuthSchema,
  googleCompleteProfileSchema,
  registerSchema,
} from '@amg/shared';
import { ApiClientError, apiRequest } from '../../lib/api';
import type { MobileAuthResponse, MobileAuthTokens } from '../../types/api';
import type {
  ForgotPasswordFormValues,
  GoogleAuthResponse,
  GoogleProfileCompletionValues,
  LoginFormValues,
  MobileMessageResponse,
  MobileRegisterResponse,
  RegisterFormValues,
} from './auth.types';

export const mobileClient = 'mobile' as const;

export function buildMobileLoginPayload(values: LoginFormValues) {
  return {
    ...values,
    client: mobileClient,
  };
}

export function validateLoginInput(values: LoginFormValues) {
  return loginSchema.parse(buildMobileLoginPayload(values));
}

export function validateRegisterInput(values: RegisterFormValues) {
  return registerSchema.parse(values);
}

export function validateForgotPasswordInput(values: ForgotPasswordFormValues) {
  return forgotPasswordSchema.parse(values);
}

export async function login(values: LoginFormValues) {
  return apiRequest<MobileAuthResponse>('/auth/login', {
    method: 'POST',
    body: validateLoginInput(values),
    authFailureMode: 'ignore',
  });
}

export async function loginWithGoogle(idToken: string) {
  return apiRequest<GoogleAuthResponse>('/auth/google/mobile', {
    method: 'POST',
    body: googleMobileAuthSchema.parse({ idToken, client: mobileClient }),
    authFailureMode: 'ignore',
  });
}

export async function completeGoogleProfile(values: GoogleProfileCompletionValues) {
  const payload = googleCompleteProfileSchema.safeParse({ ...values, client: mobileClient });

  if (!payload.success) {
    throw new ApiClientError({
      code: 'VALIDATION_ERROR',
      message: payload.error.issues[0]?.message ?? 'Please check your profile details.',
      status: 400,
      details: payload.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return apiRequest<MobileAuthResponse>('/auth/google/complete-profile', {
    method: 'POST',
    body: payload.data,
    authFailureMode: 'ignore',
  });
}

export async function register(values: RegisterFormValues) {
  return apiRequest<MobileRegisterResponse>('/auth/register', {
    method: 'POST',
    body: validateRegisterInput(values),
    authFailureMode: 'ignore',
  });
}

export async function forgotPassword(values: ForgotPasswordFormValues) {
  return apiRequest<MobileMessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: validateForgotPasswordInput(values),
    authFailureMode: 'ignore',
  });
}

export async function refresh(refreshToken?: string) {
  return apiRequest<{ tokens?: MobileAuthTokens } | null>('/auth/refresh', {
    method: 'POST',
    body: {
      client: mobileClient,
      refreshToken,
    },
    authFailureMode: 'ignore',
  });
}

export async function logout() {
  return apiRequest<null>('/auth/logout', {
    method: 'POST',
    authFailureMode: 'ignore',
  });
}

export async function currentUser() {
  return apiRequest<AuthUser>('/auth/me', {
    method: 'GET',
  });
}
