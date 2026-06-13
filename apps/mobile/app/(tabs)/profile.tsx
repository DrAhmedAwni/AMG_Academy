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
        <Header
          title="Profile"
          subtitle="Manage your learning, events, certificates, and account."
        />

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
              label={scannerAccess ? 'Scanner tools' : 'Learner account'}
              foreground={scannerAccess ? colors.accent.primary : colors.text.secondary}
              background={scannerAccess ? colors.accent.goldMuted : undefined}
              border={scannerAccess ? 'rgba(212, 175, 55, 0.36)' : undefined}
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
            label="Edit profile"
            variant="secondary"
            size="sm"
            onPress={() => { router.push('/profile/edit' as never); }}
          />
        </GlassCard>

        <View style={styles.section}>
          <SectionHeader title="Learning" />
          <View style={styles.links}>
            <ProfileLink
              icon="school-outline"
              label="My Courses"
              helper="Enrollments and progress"
              onPress={() => { router.push('/courses/my-courses' as never); }}
            />
            <ProfileLink
              icon="ribbon-outline"
              label="Certificates"
              helper="Released achievements and PDFs"
              onPress={() => { router.push('/certificates' as never); }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Events & Tickets" />
          <View style={styles.links}>
            <ProfileLink
              icon="calendar-outline"
              label="My Reservations"
              helper="Event registration status"
              onPress={() => { router.push('/events/reservations' as never); }}
            />
            <ProfileLink
              icon="qr-code-outline"
              label="My Tickets"
              helper="Event entry QR codes"
              onPress={() => { router.push('/(tabs)/tickets' as never); }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Community" />
          <View style={styles.links}>
            <ProfileLink
              icon="chatbubbles-outline"
              label="Case Discussions"
              helper="Clinical cases and replies"
              onPress={() => { router.push('/(tabs)/cases' as never); }}
            />
            <ProfileLink
              icon="people-outline"
              label="Study Groups"
              helper="Peer and instructor-led groups"
              onPress={() => { router.push('/(tabs)/study-groups' as never); }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account" />
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
            {scannerAccess ? (
              <ProfileLink
                icon="scan-outline"
                label="Scanner"
                helper="Attendance check-in tools"
                onPress={() => { router.push('/scanner' as never); }}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Session" subtitle="You will be signed out from this device." />
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
    gap: spacing.lg,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    backgroundColor: colors.surface.base,
    padding: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.36)',
    backgroundColor: colors.accent.goldMuted,
  },
  avatarText: {
    color: colors.accent.gold,
    fontSize: 28,
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
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.glass,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  linkIcon: {
    width: 44,
    height: 44,
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
