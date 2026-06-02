import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TicketCard } from '../../src/components/cards/TicketCard';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button, GlassCard } from '../../src/components/ui';
import {
  getTicketWalletState,
  useTicketsQuery,
} from '../../src/features/tickets/tickets.hooks';
import type { MobileTicket } from '../../src/features/tickets/tickets.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, layout, spacing, textStyles, typography } from '../../src/theme';

type TicketFilter = 'all' | 'active' | 'attention' | 'history';

function matchesFilter(ticket: MobileTicket, filter: TicketFilter) {
  const walletState = getTicketWalletState(ticket).state;

  if (filter === 'active') {
    return walletState === 'active';
  }

  if (filter === 'attention') {
    return ['not_issued', 'unpaid', 'unapproved'].includes(walletState);
  }

  if (filter === 'history') {
    return ['used', 'expired', 'revoked'].includes(walletState);
  }

  return true;
}

export default function TicketsTab() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<TicketFilter>('all');
  const ticketsQuery = useTicketsQuery({ page: 1, limit: 50 });
  const state = useQueryState(ticketsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });

  const filteredTickets = useMemo(() => {
    if (!ticketsQuery.data) {
      return [];
    }

    return ticketsQuery.data.data.filter((ticket) => matchesFilter(ticket, filter));
  }, [filter, ticketsQuery.data]);
  const activeTicketCount = ticketsQuery.data?.data.filter(
    (ticket) => getTicketWalletState(ticket).state === 'active',
  ).length ?? 0;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <Header
        title="My Tickets"
        subtitle="View your event tickets and entry QR codes."
      />

      <GlassCard style={styles.walletHero}>
        <View style={styles.walletMetric}>
          <Text style={styles.walletNumber}>{activeTicketCount}</Text>
          <Text style={styles.walletLabel}>Active tickets</Text>
        </View>
        <View style={styles.walletCopy}>
          <Text style={styles.walletTitle}>Event wallet</Text>
          <Text style={styles.walletText}>Keep confirmed tickets ready for check-in.</Text>
        </View>
      </GlassCard>

      <View style={styles.filters}>
        <Button
          label="All"
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onPress={() => setFilter('all')}
          size="sm"
          style={styles.filterButton}
        />
        <Button
          label="Active"
          variant={filter === 'active' ? 'primary' : 'secondary'}
          onPress={() => setFilter('active')}
          size="sm"
          style={styles.filterButton}
        />
        <Button
          label="Needs action"
          variant={filter === 'attention' ? 'primary' : 'secondary'}
          onPress={() => setFilter('attention')}
          size="sm"
          style={styles.filterButton}
        />
        <Button
          label="History"
          variant={filter === 'history' ? 'primary' : 'secondary'}
          onPress={() => setFilter('history')}
          size="sm"
          style={styles.filterButton}
        />
      </View>

      {state.status === 'loading' ? (
        <LoadingState title="Loading tickets" message="Opening your event wallet." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => {
            void ticketsQuery.refetch();
          }}
        />
      ) : state.status === 'empty' ? (
        <EmptyState
          icon="qr-code-outline"
          title="No tickets yet"
          message="Your event tickets will appear here after you register and your seat is confirmed."
        />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon="filter-outline"
          title="No tickets in this view"
          message="Switch filters to see active, pending, used, expired, or revoked QR tickets."
        />
      ) : (
        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TicketCard ticket={item} />}
          refreshControl={
            <RefreshControl
              tintColor={colors.accent.primary}
              refreshing={state.isRefreshing}
              onRefresh={() => {
                void ticketsQuery.refetch();
              }}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: layout.bottomTabContentPadding + insets.bottom },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.md,
  },
  walletHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderColor: 'rgba(94, 234, 212, 0.3)',
    backgroundColor: 'rgba(13, 34, 48, 0.92)',
  },
  walletMetric: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.accent.primary,
  },
  walletNumber: {
    color: colors.text.inverse,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: typography.weight.bold,
  },
  walletLabel: {
    color: colors.text.inverse,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  walletCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  walletTitle: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.bold,
  },
  walletText: {
    ...textStyles.body,
    fontSize: typography.size.sm,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterButton: {
    flexGrow: 1,
    minWidth: 78,
    paddingHorizontal: spacing.xs,
  },
  listContent: {},
  separator: {
    height: spacing.md,
  },
});
