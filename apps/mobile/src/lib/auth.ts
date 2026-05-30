import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { AuthUser, LoginResponse } from '@amg/shared';
import { apiRequest, setApiAuthFailureHandler, setApiAuthTokenProvider } from './api';
import { clearPrivateQueryCache, queryClient } from './queryClient';
import {
  clearSessionStorage,
  getSessionMaterial,
  saveSessionMaterial,
} from './storage';
import type { MobileAuthResponse, MobileAuthTokens } from '../types/api';
import type { MobileSession, SessionStatus } from '../types/domain';

const anonymousSession: MobileSession = {
  status: 'anonymous',
  user: null,
  lastValidatedAt: null,
};

const loadingSession: MobileSession = {
  status: 'loading',
  user: null,
  lastValidatedAt: null,
};

export interface AuthContextValue extends MobileSession {
  bootstrap: () => Promise<MobileSession>;
  refresh: () => Promise<MobileSession>;
  logout: () => Promise<void>;
  expire: () => Promise<void>;
  setAuthenticatedSession: (response: LoginResponse | MobileAuthResponse) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function asAuthenticatedSession(user: AuthUser, tokens?: MobileAuthTokens): MobileSession {
  return {
    status: 'authenticated',
    user,
    tokens,
    lastValidatedAt: new Date().toISOString(),
  };
}

function hasMobileTokens(response: LoginResponse | MobileAuthResponse): response is MobileAuthResponse {
  return 'tokens' in response && Boolean(response.tokens?.accessToken);
}

export async function bootstrapSession(): Promise<MobileSession> {
  const material = await getSessionMaterial();
  if (!material?.accessToken && !material?.refreshToken) {
    return anonymousSession;
  }

  try {
    const user = await apiRequest<AuthUser>('/auth/me', {
      authFailureMode: 'ignore',
    });
    return asAuthenticatedSession(user, material ?? undefined);
  } catch {
    return refreshSession();
  }
}

export async function refreshSession(): Promise<MobileSession> {
  const material = await getSessionMaterial();
  if (!material?.refreshToken) {
    await clearSessionStorage();
    return { ...anonymousSession, status: 'expired' };
  }

  try {
    const refreshed = await apiRequest<{ tokens?: MobileAuthTokens } | null>('/auth/refresh', {
      method: 'POST',
      body: {
        client: 'mobile',
        refreshToken: material.refreshToken,
      },
      authFailureMode: 'ignore',
    });

    if (refreshed?.tokens) {
      await saveSessionMaterial(refreshed.tokens);
    }

    const user = await apiRequest<AuthUser>('/auth/me', {
      authFailureMode: 'ignore',
    });
    return asAuthenticatedSession(user, refreshed?.tokens ?? material);
  } catch {
    await clearSessionStorage();
    return { ...anonymousSession, status: 'expired' };
  }
}

export async function logoutSession() {
  try {
    await apiRequest<null>('/auth/logout', {
      method: 'POST',
      authFailureMode: 'ignore',
    });
  } catch {
    // Local cleanup is the source of truth for ending the native session.
  } finally {
    await clearSessionStorage();
    await clearPrivateQueryCache(queryClient);
  }
}

export async function handleSessionExpired() {
  await clearSessionStorage();
  await clearPrivateQueryCache(queryClient);
}

export function canUseScanner(user: AuthUser | null | undefined) {
  if (!user) {
    return false;
  }

  return (
    user.permissions.includes('*:*') ||
    user.permissions.includes('scanner:use') ||
    ['admin', 'staff', 'scanner'].includes(user.role)
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<MobileSession>(loadingSession);

  const expire = useCallback(async () => {
    await handleSessionExpired();
    setSession({ ...anonymousSession, status: 'expired' });
  }, []);

  const bootstrap = useCallback(async () => {
    const nextSession = await bootstrapSession();
    setSession(nextSession);
    return nextSession;
  }, []);

  const refresh = useCallback(async () => {
    const nextSession = await refreshSession();
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(async () => {
    await logoutSession();
    setSession(anonymousSession);
  }, []);

  const setAuthenticatedSession = useCallback(
    async (response: LoginResponse | MobileAuthResponse) => {
      if (hasMobileTokens(response) && response.tokens) {
        await saveSessionMaterial(response.tokens);
      }

      setSession(asAuthenticatedSession(response.user, hasMobileTokens(response) ? response.tokens : undefined));
    },
    [],
  );

  useEffect(() => {
    setApiAuthTokenProvider(async () => {
      const material = await getSessionMaterial();
      return material?.accessToken ?? null;
    });
    setApiAuthFailureHandler(expire);
    void bootstrap();

    return () => {
      setApiAuthFailureHandler(undefined);
      setApiAuthTokenProvider(undefined);
    };
  }, [bootstrap, expire]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...session,
      bootstrap,
      refresh,
      logout,
      expire,
      setAuthenticatedSession,
      hasPermission: (permission: string) =>
        session.user?.permissions.includes('*:*') ||
        session.user?.permissions.includes(permission) ||
        false,
    }),
    [bootstrap, expire, logout, refresh, session, setAuthenticatedSession],
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export function isAuthenticatedStatus(status: SessionStatus) {
  return status === 'authenticated';
}
