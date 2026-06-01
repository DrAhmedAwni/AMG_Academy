import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PaymentStatus, RegistrationStatus } from '@amg/shared';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button, GlassCard, StatusBadge } from '../../src/components/ui';
import {
  useReservationsQuery,
} from '../../src/features/events/events.hooks';
import type {
  EventRegistration,
  RegistrationFilters,
} from '../../src/features/events/events.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, spacing, textStyles, typography } from '../../src/theme';

type ReservationFilter = 'all' | RegistrationStatus.Pending | RegistrationStatus.Approved;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ReservationsScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ReservationFilter>('all');
  const filters = useMemo<RegistrationFilters>(
    () => ({
      page: 1,
      limit: 50,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
    [statusFilter],
  );
  const reservationsQuery = useReservationsQuery(filters);
  const state = useQueryState(reservationsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });

  const renderReservation = ({ item }: { item: EventRegistration }) => (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <Text style={styles.kicker}>{formatDate(item.event.startDate)}</Text>
          <Text style={styles.title}>{item.event.title}</Text>
        </View>
        <StatusBadge domain="registration" status={item.status} />
      </View>

      <View style={styles.badges}>
        <StatusBadge domain="payment" status={item.paymentStatus} />
        <StatusBadge domain="qrTicket" status={item.qrTicketStatus} />
      </View>

      {item.paymentId && item.paymentStatus === PaymentStatus.Pending ? (
        <Button
          label="Continue payment"
          onPress={() => {
            router.push({
              pathname: '/payments/[paymentId]',
              params: { paymentId: item.paymentId },
            } as never);
          }}
        />
      ) : null}
    </GlassCard>
  );

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <Header
        title="My Reservations"
        subtitle="Backend registration, payment, and QR ticket states."
        action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
      />

      <View style={styles.filters}>
        <Button
          label="All"
          variant={statusFilter === 'all' ? 'primary' : 'secondary'}
          onPress={() => setStatusFilter('all')}
          style={styles.filterButton}
        />
        <Button
          label="Pending"
          variant={statusFilter === RegistrationStatus.Pending ? 'primary' : 'secondary'}
          onPress={() => setStatusFilter(RegistrationStatus.Pending)}
          style={styles.filterButton}
        />
        <Button
          label="Approved"
          variant={statusFilter === RegistrationStatus.Approved ? 'primary' : 'secondary'}
          onPress={() => setStatusFilter(RegistrationStatus.Approved)}
          style={styles.filterButton}
        />
      </View>

      {state.status === 'loading' ? (
        <LoadingState title="Loading reservations" message="Fetching your registrations." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => {
            void reservationsQuery.refetch();
          }}
        />
      ) : state.status === 'empty' ? (
        <EmptyState
          title="No reservations"
          message="Event registrations you create through the backend will appear here."
        />
      ) : (
        <FlatList
          data={state.data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderReservation}
          refreshControl={
            <RefreshControl
              tintColor={colors.accent.primary}
              refreshing={state.isRefreshing}
              onRefresh={() => {
                void reservationsQuery.refetch();
              }}
            />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterButton: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xxs,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
