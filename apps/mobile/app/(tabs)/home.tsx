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
        <Text numberOfLines={2} style={styles.quickHelper}>{helper}</Text>
      </View>
      <View style={styles.quickChevron}>
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      </View>
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
      <Header
        title={`Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Continue learning where you left off."
      />

      <GlassCard style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={24} color={colors.accent.primary} />
          </View>
          <Badge
            label={pendingReservations.length > 0 ? `${pendingReservations.length} needs attention` : 'Ready'}
            foreground={colors.accent.primary}
            background="rgba(84, 217, 232, 0.14)"
            border="rgba(84, 217, 232, 0.34)"
          />
        </View>
        <Text style={styles.title}>Your learning today</Text>
        <Text style={styles.body}>
          Track your courses, events, tickets, and certificates in one place.
        </Text>
        <View style={styles.heroActions}>
          <Button
            label={firstEnrollment ? 'Continue learning' : 'Browse courses'}
            onPress={() => goTo(firstEnrollment ? '/courses/my-courses' : '/(tabs)/courses')}
            style={styles.heroAction}
          />
          <Button
            label="My tickets"
            variant="secondary"
            onPress={() => goTo('/(tabs)/tickets')}
            style={styles.heroAction}
          />
        </View>
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

      <View style={styles.section}>
        <SectionHeader title="Quick actions" subtitle="Open the areas you use most." />
        <View style={styles.quickGrid}>
          <QuickAction
            icon="school"
            label="Continue Learning"
            helper="Open your courses"
            onPress={() => goTo('/courses/my-courses')}
          />
          <QuickAction
            icon="qr-code"
            label="My Tickets"
            helper="Open your event wallet"
            onPress={() => goTo('/(tabs)/tickets')}
          />
          <QuickAction
            icon="calendar"
            label="Upcoming Events"
            helper="Browse and register"
            onPress={() => goTo('/(tabs)/events')}
          />
          <QuickAction
            icon="chatbubbles"
            label="Case Discussions"
            helper="Browse community cases"
            onPress={() => goTo('/(tabs)/cases')}
          />
          <QuickAction
            icon="ribbon"
            label="Certificates"
            helper="View achievements"
            onPress={() => goTo('/certificates')}
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
    gap: spacing.md,
    borderColor: 'rgba(94, 234, 212, 0.32)',
    backgroundColor: 'rgba(13, 34, 48, 0.94)',
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
    borderColor: 'rgba(84, 217, 232, 0.34)',
    backgroundColor: colors.interactive.pressed,
  },
  title: {
    ...textStyles.title,
    fontSize: 32,
    lineHeight: 40,
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
    position: 'relative',
    width: '48%',
    minHeight: 132,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
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
  quickIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.interactive.pressed,
  },
  quickCopy: {
    width: '100%',
    minWidth: 0,
    gap: spacing.xxs,
  },
  quickChevron: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  quickLabel: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  quickHelper: textStyles.caption,
});
