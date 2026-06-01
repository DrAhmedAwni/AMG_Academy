import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TicketCard } from '../../src/components/cards/TicketCard';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button } from '../../src/components/ui';
import {
  getTicketWalletState,
  useTicketsQuery,
} from '../../src/features/tickets/tickets.hooks';
import type { MobileTicket } from '../../src/features/tickets/tickets.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, layout, spacing } from '../../src/theme';

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

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <Header
        title="QR Tickets"
        subtitle="Display only backend-valid QR ticket payloads."
      />

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
          label="Needs"
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
        <LoadingState title="Loading tickets" message="Fetching your QR wallet." />
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
          title="No QR tickets"
          message="Tickets appear only after backend registration, approval, and payment rules allow them."
        />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
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
    gap: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  listContent: {},
  separator: {
    height: spacing.md,
  },
});
