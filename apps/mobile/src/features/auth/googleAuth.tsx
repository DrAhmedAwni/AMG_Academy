import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import * as Google from 'expo-auth-session/providers/google';
import type { AuthSessionResult } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import {
  useCompleteGoogleProfileMutation,
  useGoogleLoginMutation,
} from './auth.hooks';
import type {
  GoogleProfileCompletionValues,
  GoogleProfileSeed,
} from './auth.types';
import { mapApiErrorToUi, type UiErrorState } from '../../lib/errors';

interface GoogleProfileStep {
  idToken: string;
  profile: GoogleProfileSeed;
}

interface GoogleAuthContextValue {
  requestReady: boolean;
  loading: boolean;
  profileStep: GoogleProfileStep | null;
  error: UiErrorState | null;
  start: () => Promise<void>;
  completeProfile: (values: GoogleProfileCompletionValues) => Promise<void>;
  cancelProfile: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextValue | undefined>(undefined);

function getIdToken(response: AuthSessionResult | null | undefined) {
  if (response?.type !== 'success') {
    return undefined;
  }

  return response.authentication?.idToken ?? response.params?.id_token;
}

function getResponseKey(response: AuthSessionResult | null | undefined) {
  if (response?.type !== 'success') {
    return undefined;
  }

  return response.url ?? response.params?.code ?? response.authentication?.idToken;
}

export function GoogleAuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const googleMutation = useGoogleLoginMutation();
  const googleProfileMutation = useCompleteGoogleProfileMutation();
  const processedResponseKeyRef = useRef<string | null>(null);
  const [profileStep, setProfileStep] = useState<GoogleProfileStep | null>(null);

  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
  }, {
    native: 'com.amgacademy.mobile:/oauthredirect',
  });

  useEffect(() => {
    const responseKey = getResponseKey(googleResponse);
    const idToken = getIdToken(googleResponse);

    if (!responseKey || !idToken || processedResponseKeyRef.current === responseKey) {
      return;
    }

    processedResponseKeyRef.current = responseKey;

    void googleMutation.mutateAsync(idToken).then((response) => {
      if ('needsProfile' in response) {
        setProfileStep({ idToken, profile: response.profile });
        router.replace('/oauthredirect' as never);
        return;
      }

      router.replace('/(tabs)/home' as never);
    }).catch(() => {
      router.replace('/oauthredirect' as never);
    });
  }, [googleMutation, googleResponse, router]);

  const start = useCallback(async () => {
    setProfileStep(null);
    googleMutation.reset();
    googleProfileMutation.reset();
    await promptGoogle();
  }, [googleMutation, googleProfileMutation, promptGoogle]);

  const completeProfile = useCallback(
    async (values: GoogleProfileCompletionValues) => {
      await googleProfileMutation.mutateAsync(values);
      setProfileStep(null);
      router.replace('/(tabs)/home' as never);
    },
    [googleProfileMutation, router],
  );

  const cancelProfile = useCallback(() => {
    setProfileStep(null);
    router.replace('/(auth)/login' as never);
  }, [router]);

  const error = useMemo(
    () => (googleMutation.error || googleProfileMutation.error
      ? mapApiErrorToUi(googleMutation.error ?? googleProfileMutation.error)
      : null),
    [googleMutation.error, googleProfileMutation.error],
  );

  const value = useMemo<GoogleAuthContextValue>(
    () => ({
      requestReady: Boolean(googleRequest),
      loading: googleMutation.isPending || googleProfileMutation.isPending,
      profileStep,
      error,
      start,
      completeProfile,
      cancelProfile,
    }),
    [
      cancelProfile,
      completeProfile,
      error,
      googleMutation.isPending,
      googleProfileMutation.isPending,
      googleRequest,
      profileStep,
      start,
    ],
  );

  return React.createElement(GoogleAuthContext.Provider, { value }, children);
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuth must be used inside GoogleAuthProvider');
  }

  return context;
}
