import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoadingState } from '../src/components/states/LoadingState';
import { Screen } from '../src/components/layout/Screen';
import { useAuth } from '../src/lib/auth';

export default function BootstrapRoute() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)/home' as never);
    }

    if (status === 'anonymous' || status === 'expired') {
      router.replace('/(auth)/login' as never);
    }
  }, [router, status]);

  return (
    <Screen scroll={false}>
      <LoadingState title="Opening AMG Academy" message="Checking your secure session." />
    </Screen>
  );
}
