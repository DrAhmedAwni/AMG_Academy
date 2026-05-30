import React, { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PaymentStatus, RegistrationStatus } from '@amg/shared';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { Badge, GlassCard } from '../../src/components/ui';
import { useEnrollmentsQuery } from '../../src/features/courses/courses.hooks';
import { useReservationsQuery } from '../../src/features/events/events.hooks';
import { useTicketsQuery, getTicketWalletState } from '../../src/features/tickets/tickets.hooks';
import { useAuth } from '../../src/lib/auth';
import { colors, radius, spacing, textStyles, typography } from '../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type RouteTarget =
  | '/(tabs)/events'
  | '/(tabs)/tickets'
  | '/(tabs)/courses'
  | '/(tabs)/profile'
  | '/events/reservations'
  | '/courses/my-courses';

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function SummaryCard({
  icon,
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  icon: IconName;
  label: string;
  value: string;
  helper: string;
  tone?: 'accent' | 'success' | 'warning' | 'neutral';
}) {
  const toneColor =
    tone === 'success'
      ? colors.status.success
      : tone === 'warning'
        ? colors.status.warning
        : tone === 'accent'
          ? colors.accent.primary
          : colors.text.secondary;

  return (
    <GlassCard style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { borderColor: toneColor, backgroundColor: `${toneColor}1F` }]}>
        <Ionicons name={icon} size={20} color={toneColor} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text numberOfLines={2} style={styles.summaryHelper}>{helper}</Text>
    </GlassCard>
  );
}

function QuickAction({
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
      style={({ pressed }) => [styles.quickAction, pressed ? styles.pressed : null]}
    >
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={colors.accent.primary} />
      </View>
      <View style={styles.quickCopy}>
        <Text style={styles.quickLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.quickHelper}>{helper}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
    </Pressable>
  );
}

export default function HomeTab() {
  const router = useRouter();
  const { user } = useAuth();
  const reservationsQuery = useReservationsQuery({ page: 1, limit: 50 });
  const enrollmentsQuery = useEnrollmentsQuery();
  const ticketsQuery = useTicketsQuery({ page: 1, limit: 50 });

  const reservations = reservationsQuery.data?.data ?? [];
  const enrollments = enrollmentsQuery.data?.data ?? [];
  const tickets = ticketsQuery.data?.data ?? [];
  const now = Date.now();
  const upcomingReservation = reservations
    .filter((reservation) => new Date(reservation.event.startDate).getTime() >= now)
    .sort(
      (left, right) =>
        new Date(left.event.startDate).getTime() - new Date(right.event.startDate).getTime(),
    )[0];
  const pendingReservations = reservations.filter(
    (reservation) =>
      reservation.status === RegistrationStatus.Pending ||
      reservation.paymentStatus === PaymentStatus.Pending,
  );
  const activeTickets = tickets.filter((ticket) => getTicketWalletState(ticket).state === 'active');
  const firstEnrollment = enrollments[0];

  const goTo = (route: RouteTarget) => {
    router.push(route as never);
  };

  return (
    <Screen contentStyle={styles.screen}>
      <Header
        title={`Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Your AMG Academy mobile dashboard."
      />

      <GlassCard style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.accent.primary} />
          </View>
          <Badge
            label="Secure session"
            foreground={colors.accent.primary}
            background="rgba(84, 217, 232, 0.14)"
            border="rgba(84, 217, 232, 0.34)"
          />
        </View>
        <Text style={styles.title}>AMG Academy at a glance</Text>
        <Text style={styles.body}>
          Registration, payment, QR ticket, and course access states are loaded from the backend.
        </Text>
      </GlassCard>

      <View style={styles.summaryGrid}>
        <SummaryCard
          icon="calendar-outline"
          label="Next event"
          value={
            reservationsQuery.isLoading
              ? 'Loading'
              : upcomingReservation
                ? formatShortDate(upcomingReservation.event.startDate)
                : 'None'
          }
          helper={upcomingReservation?.event.title ?? 'Registered upcoming events will appear here.'}
          tone="accent"
        />
        <SummaryCard
          icon="time-outline"
          label="Pending"
          value={reservationsQuery.isLoading ? 'Loading' : String(pendingReservations.length)}
          helper="Reservations or payments needing backend completion."
          tone={pendingReservations.length > 0 ? 'warning' : 'neutral'}
        />
        <SummaryCard
          icon="school-outline"
          label="Courses"
          value={enrollmentsQuery.isLoading ? 'Loading' : String(enrollments.length)}
          helper={firstEnrollment?.course.title ?? 'Enrolled courses and progress show here.'}
          tone="success"
        />
        <SummaryCard
          icon="qr-code-outline"
          label="Active QR"
          value={ticketsQuery.isLoading ? 'Loading' : String(activeTickets.length)}
          helper="Only backend-valid QR tickets count as active."
          tone="accent"
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Quick actions" subtitle="Jump into the flows used most on mobile." />
        <View style={styles.quickGrid}>
          <QuickAction
            icon="calendar"
            label="Events"
            helper="Browse and register"
            onPress={() => goTo('/(tabs)/events')}
          />
          <QuickAction
            icon="qr-code"
            label="Tickets"
            helper="Open QR wallet"
            onPress={() => goTo('/(tabs)/tickets')}
          />
          <QuickAction
            icon="school"
            label="Courses"
            helper="Continue learning"
            onPress={() => goTo('/(tabs)/courses')}
          />
          <QuickAction
            icon="person"
            label="Profile"
            helper="Account settings"
            onPress={() => goTo('/(tabs)/profile')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  heroCard: {
    gap: spacing.sm,
    borderColor: 'rgba(84, 217, 232, 0.26)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(84, 217, 232, 0.34)',
    backgroundColor: 'rgba(84, 217, 232, 0.12)',
  },
  title: textStyles.heading,
  body: textStyles.body,
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryCard: {
    width: '48%',
    minHeight: 148,
    gap: spacing.xs,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  summaryLabel: {
    ...textStyles.caption,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.weight.bold,
  },
  summaryHelper: textStyles.caption,
  section: {
    gap: spacing.sm,
  },
  quickGrid: {
    gap: spacing.sm,
  },
  quickAction: {
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
  quickIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.interactive.pressed,
  },
  quickCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  quickLabel: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  quickHelper: textStyles.caption,
});
