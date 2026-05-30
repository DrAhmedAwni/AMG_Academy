import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { Badge, Button, GlassCard } from '../../src/components/ui';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { useLogoutMutation } from '../../src/features/auth/auth.hooks';
import { canAccessScanner } from '../../src/features/auth/auth.types';
import { useProfileQuery } from '../../src/features/profile/profile.hooks';
import { useAuth } from '../../src/lib/auth';
import { colors, spacing, textStyles } from '../../src/theme';

export default function ProfileTab() {
  const router = useRouter();
  const { user } = useAuth();
  const logoutMutation = useLogoutMutation();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;

  return (
    <SessionGate>
      <Screen>
        <Header title="Profile" subtitle="Account, role, and secure session controls." />
        <GlassCard style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.avatar} accessibilityLabel="Profile initials">
              <Text style={styles.avatarText}>
                {(profile?.name ?? user?.name ?? 'A').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.identity}>
              <Text style={styles.name}>{profile?.name ?? user?.name ?? 'AMG Academy user'}</Text>
              <Text style={styles.email}>{profile?.email ?? user?.email}</Text>
            </View>
          </View>

          {profile ? (
            <View style={styles.detailRow}>
              {profile.phone ? (
                <Text style={styles.detailText}>Phone: {profile.phone}</Text>
              ) : null}
              {profile.specialty ? (
                <Text style={styles.detailText}>Specialty: {profile.specialty}</Text>
              ) : null}
              {profile.clinic ? (
                <Text style={styles.detailText}>Clinic: {profile.clinic}</Text>
              ) : null}
              {profile.city ? (
                <Text style={styles.detailText}>City: {profile.city}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.badges}>
            <Badge label={`Role: ${user?.role ?? profile?.role ?? 'unknown'}`} />
            <Badge
              label={canAccessScanner(user) ? 'Scanner access' : 'Standard access'}
              foreground={canAccessScanner(user) ? colors.accent.primary : colors.text.secondary}
              background={canAccessScanner(user) ? 'rgba(84, 217, 232, 0.14)' : undefined}
              border={canAccessScanner(user) ? 'rgba(84, 217, 232, 0.34)' : undefined}
            />
          </View>

          <Button
            label="Edit Profile"
            variant="secondary"
            onPress={() => { router.push('/profile/edit' as never); }}
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <SectionHeader title="Quick Links" />
          <View style={styles.links}>
            <Button
              label="Notifications"
              variant="secondary"
              onPress={() => { router.push('/notifications' as never); }}
            />
            <Button
              label="Settings"
              variant="secondary"
              onPress={() => { router.push('/settings' as never); }}
            />
            <Button
              label="My Courses"
              variant="secondary"
              onPress={() => { router.push('/courses/my-courses' as never); }}
            />
            <Button
              label="My Reservations"
              variant="secondary"
              onPress={() => { router.push('/events/reservations' as never); }}
            />
          </View>
        </GlassCard>

        <View style={styles.section}>
          <SectionHeader title="Session" subtitle="Logout clears SecureStore and private query cache." />
          <Button
            label="Log out"
            variant="danger"
            loading={logoutMutation.isPending}
            onPress={() => { void logoutMutation.mutateAsync(); }}
          />
        </View>
      </Screen>
    </SessionGate>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.elevated,
  },
  avatarText: {
    color: colors.accent.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  identity: {
    flex: 1,
    gap: spacing.xxs,
  },
  name: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  email: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  detailRow: {
    gap: spacing.xxs,
  },
  detailText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  links: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
});
