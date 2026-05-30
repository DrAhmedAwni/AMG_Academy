import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Screen } from '../src/components/layout';
import { Button, GlassCard } from '../src/components/ui';
import { useLogoutMutation } from '../src/features/auth/auth.hooks';
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../src/features/notifications/notifications.hooks';
import { colors, spacing, textStyles, typography } from '../src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const prefsQuery = useNotificationPreferencesQuery();
  const updatePrefsMutation = useUpdateNotificationPreferencesMutation();

  const preferences = prefsQuery.data ?? {};

  const togglePreference = (key: string) => {
    const current = preferences[key] ?? false;
    void updatePrefsMutation.mutateAsync({ ...preferences, [key]: !current }).catch(() => {});
  };

  return (
    <Screen>
      <Header
        title="Settings"
        subtitle="Notification preferences, password, and account actions."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>

        {prefsQuery.isLoading ? (
          <Text style={styles.loadingText}>Loading preferences...</Text>
        ) : Object.keys(preferences).length === 0 ? (
          <Text style={styles.emptyText}>No notification preferences available.</Text>
        ) : (
          Object.entries(preferences).map(([key, value]) => (
            <View key={key} style={styles.prefRow}>
              <Text style={styles.prefLabel}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
              <Switch
                value={!!value}
                onValueChange={() => togglePreference(key)}
                trackColor={{ false: colors.surface.elevated, true: colors.accent.primary + '66' }}
                thumbColor={value ? colors.accent.primary : colors.text.muted}
              />
            </View>
          ))
        )}
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Button
          label="Change Password"
          variant="secondary"
          onPress={() => {
            router.push('/auth/change-password' as never);
          }}
        />

        <View style={styles.logoutSection}>
          <Text style={styles.logoutHint}>
            Logout clears SecureStore and private query cache.
          </Text>
          <Button
            label="Log out"
            variant="danger"
            loading={logoutMutation.isPending}
            onPress={() => { void logoutMutation.mutateAsync(); }}
          />
        </View>
      </GlassCard>

      <Text style={styles.disclaimer}>
        Push notification delivery requires a production Expo push token and
        backend provider configuration. Preparation is included.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  prefLabel: {
    ...textStyles.body,
    flex: 1,
  },
  loadingText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  emptyText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  logoutSection: {
    gap: spacing.sm,
  },
  logoutHint: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  disclaimer: {
    ...textStyles.caption,
    color: colors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
