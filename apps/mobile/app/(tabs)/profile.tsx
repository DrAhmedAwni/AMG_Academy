import React, { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { Badge, Button, GlassCard } from '../../src/components/ui';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { useLogoutMutation } from '../../src/features/auth/auth.hooks';
import { canAccessScanner } from '../../src/features/auth/auth.types';
import { useProfileQuery } from '../../src/features/profile/profile.hooks';
import { useAuth } from '../../src/lib/auth';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function ProfileLink({
  icon,
  label,
  helper,
  onPress,
}: {
  icon: IconName;
  label: string;
  helper: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed ? styles.pressed : null]}
    >
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={20} color={colors.accent.primary} />
      </View>
      <View style={styles.linkCopy}>
        <Text style={styles.linkLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.linkHelper}>{helper}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
    </Pressable>
  );
}

export default function ProfileTab() {
  const router = useRouter();
  const { user } = useAuth();
  const logoutMutation = useLogoutMutation();
  const profileQuery = useProfileQuery();
  const profile = profileQuery.data;
  const scannerAccess = canAccessScanner(user);
  const detailItems = [
    profile?.phone ? ['Phone', profile.phone] : null,
    profile?.specialty ? ['Specialty', profile.specialty] : null,
    profile?.clinic ? ['Clinic', profile.clinic] : null,
    profile?.city ? ['City', profile.city] : null,
  ].filter((item): item is string[] => Boolean(item));

  return (
    <SessionGate>
      <Screen contentStyle={styles.screen}>
        <Header title="Profile" subtitle="Account, role, and secure session controls." />

        <GlassCard style={styles.profileCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatar} accessibilityLabel="Profile initials">
              <Text style={styles.avatarText}>
                {(profile?.name ?? user?.name ?? 'A').slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.identity}>
              <Text numberOfLines={2} style={styles.name}>
                {profile?.name ?? user?.name ?? 'AMG Academy user'}
              </Text>
              <Text numberOfLines={1} style={styles.email}>{profile?.email ?? user?.email}</Text>
            </View>
          </View>

          <View style={styles.badges}>
            <Badge label={`Role: ${user?.role ?? profile?.role ?? 'unknown'}`} />
            <Badge
              label={scannerAccess ? 'Scanner access' : 'Standard access'}
              foreground={scannerAccess ? colors.accent.primary : colors.text.secondary}
              background={scannerAccess ? 'rgba(84, 217, 232, 0.14)' : undefined}
              border={scannerAccess ? 'rgba(84, 217, 232, 0.34)' : undefined}
            />
          </View>

          {detailItems.length > 0 ? (
            <View style={styles.detailGrid}>
              {detailItems.map(([label, value]) => (
                <View key={label} style={styles.detailPill}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text numberOfLines={1} style={styles.detailValue}>{value}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.profileHint}>
              Add clinic, city, and specialty details so your AMG profile is easier to manage.
            </Text>
          )}

          <Button
            label="Edit Profile"
            variant="secondary"
            size="sm"
            onPress={() => { router.push('/profile/edit' as never); }}
          />
        </GlassCard>

        <View style={styles.section}>
          <SectionHeader title="Quick links" />
          <View style={styles.links}>
            <ProfileLink
              icon="notifications-outline"
              label="Notifications"
              helper="Inbox and announcements"
              onPress={() => { router.push('/notifications' as never); }}
            />
            <ProfileLink
              icon="settings-outline"
              label="Settings"
              helper="Preferences and security"
              onPress={() => { router.push('/settings' as never); }}
            />
            <ProfileLink
              icon="school-outline"
              label="My Courses"
              helper="Enrollments and progress"
              onPress={() => { router.push('/courses/my-courses' as never); }}
            />
            <ProfileLink
              icon="calendar-outline"
              label="My Reservations"
              helper="Event registration status"
              onPress={() => { router.push('/events/reservations' as never); }}
            />
          </View>
        </View>

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
  screen: {
    gap: spacing.lg,
  },
  profileCard: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(84, 217, 232, 0.34)',
    backgroundColor: colors.interactive.pressed,
  },
  avatarText: {
    color: colors.accent.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  identity: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  name: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: '700',
    lineHeight: typography.lineHeight.lg,
  },
  email: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: '400',
    lineHeight: typography.lineHeight.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  detailPill: {
    minWidth: '48%',
    flexGrow: 1,
    gap: spacing.xxs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailLabel: textStyles.caption,
  detailValue: {
    ...textStyles.label,
    color: colors.text.primary,
  },
  profileHint: textStyles.body,
  section: {
    gap: spacing.sm,
  },
  links: {
    gap: spacing.sm,
  },
  linkRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  linkIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.interactive.pressed,
  },
  linkCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  linkLabel: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  linkHelper: textStyles.caption,
});
