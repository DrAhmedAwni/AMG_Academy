import React, { type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { LoadingState } from '../../components/states/LoadingState';
import { PermissionDeniedState } from '../../components/states/PermissionDeniedState';
import { SessionExpiredState } from '../../components/states/SessionExpiredState';
import { useAuth } from '../../lib/auth';
import { canAccessScanner } from './auth.types';

export interface SessionGateProps {
  children: ReactNode;
  requireScanner?: boolean;
  loadingTitle?: string;
}

export function SessionGate({
  children,
  requireScanner = false,
  loadingTitle = 'Checking access',
}: SessionGateProps) {
  const router = useRouter();
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <Screen scroll={false}>
        <LoadingState title={loadingTitle} message="Confirming your AMG Academy session." />
      </Screen>
    );
  }

  if (status === 'expired') {
    return (
      <Screen scroll={false}>
        <SessionExpiredState onSignIn={() => router.replace('/(auth)/login' as never)} />
      </Screen>
    );
  }

  if (status === 'anonymous') {
    return (
      <Screen scroll={false}>
        <SessionExpiredState onSignIn={() => router.replace('/(auth)/login' as never)} />
      </Screen>
    );
  }

  if (requireScanner && !canAccessScanner(user)) {
    return (
      <Screen scroll={false}>
        <PermissionDeniedState
          title="Scanner access required"
          message="Scanner mode is available only to authorized AMG Academy staff."
          action={{
            label: 'Back to profile',
            onPress: () => router.replace('/(tabs)/profile' as never),
          }}
        />
      </Screen>
    );
  }

  return <>{children}</>;
}
