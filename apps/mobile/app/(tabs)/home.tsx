import React, { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PaymentStatus, RegistrationStatus } from '@amg/shared';
import { Header, Screen, SectionHeader } from '../../src/components/layout';
import { Badge, Button, GlassCard } from '../../src/components/ui';
import { useCertificatesQuery } from '../../src/features/certificates/certificates.hooks';
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
  | '/(tabs)/cases'
  | '/(tabs)/community'
  | '/(tabs)/profile'
  | '/events/reservations'
  | '/courses/my-courses'
  | '/certificates';

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
      <View style={styles.summaryTop}>
        <View style={[styles.summaryIcon, { borderColor: toneColor, backgroundColor: `${toneColor}1F` }]}>
          <Ionicons name={icon} size={20} color={toneColor} />
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.summaryHelper}>{helper}</Text>
    </GlassCard>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
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
        <Ionicons name={icon} size={22} color={colors.accent.primary} />
      </View>
      <Text numberOfLines={2} style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

export default function HomeTab() {
  const router = useRouter();
  const { user } = useAuth();
  const reservationsQuery = useReservationsQuery({ page: 1, limit: 50 });
  const enrollmentsQuery = useEnrollmentsQuery();
  const ticketsQuery = useTicketsQuery({ page: 1, limit: 50 });
  const certificatesQuery = useCertificatesQuery({ page: 1, limit: 10 });

  const reservations = reservationsQuery.data?.data ?? [];
  const enrollments = enrollmentsQuery.data?.data ?? [];
  const tickets = ticketsQuery.data?.data ?? [];
  const certificates = certificatesQuery.data?.data ?? [];
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
  const bestProgress = enrollments.reduce(
    (current, enrollment) => Math.max(current, enrollment.progressPercent),
    0,
  );

  const goTo = (route: RouteTarget) => {
    router.push(route as never);
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topBar}>
        <Header
          title={`Good evening${user?.name ? `, Dr. ${user.name.split(' ')[0]}` : ''}`}
          subtitle="Your AMG Academy event, course, and ticket passport."
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Find events and courses"
          onPress={() => goTo('/(tabs)/events')}
          style={({ pressed }) => [styles.searchBar, pressed ? styles.pressed : null]}
        >
          <Ionicons name="search" size={18} color={colors.text.muted} />
          <Text style={styles.searchText}>Find events, courses, tickets...</Text>
        </Pressable>
      </View>

      <GlassCard style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="calendar" size={24} color={colors.accent.primary} />
          </View>
          <Badge
            label={pendingReservations.length > 0 ? `${pendingReservations.length} needs attention` : 'Event ready'}
            foreground={colors.accent.primary}
            background={colors.accent.goldMuted}
            border="rgba(212, 175, 55, 0.36)"
          />
        </View>
        <Text style={styles.kicker}>Next AMG moment</Text>
        <Text style={styles.title}>{upcomingReservation?.event.title ?? 'Discover your next clinical event'}</Text>
        <Text style={styles.body}>
          {upcomingReservation
            ? `Reserved for ${formatShortDate(upcomingReservation.event.startDate)}. Open the reservation for details.`
            : 'Browse AMG workshops, congress activities, and dental education courses.'}
        </Text>
        <View style={styles.heroActions}>
          <Button
            label={upcomingReservation ? 'Open reservation' : 'Browse events'}
            onPress={() => goTo(upcomingReservation ? '/events/reservations' : '/(tabs)/events')}
            style={styles.heroAction}
          />
          <Button
            label={activeTickets.length > 0 ? 'Show QR tickets' : firstEnrollment ? 'Continue course' : 'Courses'}
            variant="secondary"
            onPress={() => goTo(activeTickets.length > 0 ? '/(tabs)/tickets' : firstEnrollment ? '/courses/my-courses' : '/(tabs)/courses')}
            style={styles.heroAction}
          />
        </View>
      </GlassCard>

      <View style={styles.section}>
        <SectionHeader title="Quick access" subtitle="Go straight to the task you need." />
        <View style={styles.quickGrid}>
          <QuickAction
            icon="calendar"
            label="Events"
            onPress={() => goTo('/(tabs)/events')}
          />
          <QuickAction
            icon="school"
            label="Courses"
            onPress={() => goTo('/courses/my-courses')}
          />
          <QuickAction
            icon="qr-code"
            label="Tickets"
            onPress={() => goTo('/(tabs)/tickets')}
          />
          <QuickAction
            icon="ribbon"
            label="Certificates"
            onPress={() => goTo('/certificates')}
          />
          <QuickAction
            icon="chatbubbles"
            label="Cases"
            onPress={() => goTo('/(tabs)/cases')}
          />
        </View>
      </View>

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
          icon="qr-code-outline"
          label="Active ticket"
          value={ticketsQuery.isLoading ? 'Loading' : String(activeTickets.length)}
          helper="QR tickets ready for event check-in."
          tone="accent"
        />
        <SummaryCard
          icon="school-outline"
          label="Course progress"
          value={enrollmentsQuery.isLoading ? 'Loading' : enrollments.length > 0 ? `${bestProgress}%` : '0%'}
          helper={firstEnrollment?.course.title ?? 'Enroll in a course to start learning.'}
          tone="success"
        />
        <SummaryCard
          icon="ribbon-outline"
          label="Certificates"
          value={certificatesQuery.isLoading ? 'Loading' : String(certificates.length)}
          helper="Released certificates and achievements."
          tone="success"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  topBar: {
    gap: spacing.sm,
  },
  searchBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.elevated,
    paddingHorizontal: spacing.md,
  },
  searchText: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  heroCard: {
    gap: spacing.md,
    borderColor: 'rgba(212, 175, 55, 0.38)',
    backgroundColor: colors.surface.base,
    padding: spacing.xl,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.36)',
    backgroundColor: colors.interactive.pressed,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.gold,
    textTransform: 'uppercase',
    fontWeight: typography.weight.bold,
  },
  title: {
    ...textStyles.title,
    fontSize: typography.size.xxl,
    lineHeight: typography.lineHeight.xxl,
  },
  body: {
    ...textStyles.body,
    maxWidth: 560,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  heroAction: {
    flexGrow: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryCard: {
    width: '48%',
    minHeight: 142,
    gap: spacing.sm,
    backgroundColor: colors.surface.glass,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
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
    color: colors.text.secondary,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    width: 76,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  quickIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.48)',
    backgroundColor: colors.surface.elevated,
  },
  quickLabel: {
    ...textStyles.caption,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
