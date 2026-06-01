import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/lib/auth';

export default function AuthLayout() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)/home' as never);
    }
  }, [router, status]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.main },
        animation: 'fade_from_bottom',
      }}
    />
  );
}
