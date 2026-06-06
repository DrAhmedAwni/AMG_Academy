import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '../../src/components/cards/EventCard';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import {
  useEventsQuery,
} from '../../src/features/events/events.hooks';
import type { EventFilters, MobileEvent } from '../../src/features/events/events.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, layout, spacing, textStyles, typography } from '../../src/theme';

type FreeFilter = 'all' | 'free' | 'paid';

const pageSize = 10;

export default function EventsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [freeFilter, setFreeFilter] = useState<FreeFilter>('all');

  useEffect(() => {
    setPage(1);
  }, [freeFilter, search]);

  const filters = useMemo<EventFilters>(
    () => ({
      page,
      limit: pageSize,
      search: search.trim() || undefined,
      isFree:
        freeFilter === 'all'
          ? undefined
          : freeFilter === 'free',
    }),
    [freeFilter, page, search],
  );

  const eventsQuery = useEventsQuery(filters);
  const state = useQueryState(eventsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });
  const meta = eventsQuery.data?.meta;
  const listData = state.status === 'success' ? state.data.data : [];

  const renderEvent = ({ item }: { item: MobileEvent }) => (
    <EventCard
      event={item}
      onPress={() => {
        router.push({
          pathname: '/events/[eventId]',
          params: { eventId: item.slug },
        } as never);
      }}
    />
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <Header
        title="Events"
        subtitle="Upcoming AMG Academy workshops and events."
      />

      <GlassCard style={styles.reservationsCard}>
        <View style={styles.reservationsCopy}>
          <Text style={styles.reservationsTitle}>Your event reservations</Text>
          <Text style={styles.reservationsText}>
            Track approvals, payments, and tickets for events you joined.
          </Text>
        </View>
        <Button
          label="Open"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/events/reservations' as never)}
        />
      </GlassCard>

      <TextField
        label="Search events"
        value={search}
        onChangeText={setSearch}
        placeholder="Search by title or topic"
        returnKeyType="search"
      />

      <View style={styles.filters}>
        <Button
          label="All"
          variant={freeFilter === 'all' ? 'primary' : 'secondary'}
          onPress={() => setFreeFilter('all')}
          size="sm"
          style={styles.filterButton}
        />
        <Button
          label="Free"
          variant={freeFilter === 'free' ? 'primary' : 'secondary'}
          onPress={() => setFreeFilter('free')}
          size="sm"
          style={styles.filterButton}
        />
        <Button
          label="Paid"
          variant={freeFilter === 'paid' ? 'primary' : 'secondary'}
          onPress={() => setFreeFilter('paid')}
          size="sm"
          style={styles.filterButton}
        />
      </View>
    </View>
  );

  const renderListEmpty = () => {
    if (state.status === 'loading') {
      return <LoadingState title="Loading events" message="Finding upcoming AMG Academy events." />;
    }

    if (state.status === 'error') {
      return (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => {
            void eventsQuery.refetch();
          }}
        />
      );
    }

    if (state.status === 'empty') {
      return (
        <EmptyState
          icon="calendar-outline"
          title="No events found"
          message="Try another search or filter. New workshops and events will appear here."
        />
      );
    }

    return null;
  };

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        style={styles.listSurface}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent.primary}
            refreshing={state.isRefreshing}
            onRefresh={() => {
              void eventsQuery.refetch();
            }}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: layout.bottomTabContentPadding + insets.bottom },
        ]}
        scrollIndicatorInsets={{ bottom: layout.bottomTabContentPadding + insets.bottom }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          state.status === 'success' && meta && meta.totalPages > 1 ? (
            <View style={styles.pagination}>
              <Button
                label="Previous"
                variant="secondary"
                disabled={page <= 1}
                onPress={() => setPage((current) => Math.max(1, current - 1))}
                style={styles.pageButton}
              />
              <Button
                label="Next"
                variant="secondary"
                disabled={page >= meta.totalPages}
                onPress={() => setPage((current) => current + 1)}
                style={styles.pageButton}
              />
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingBottom: 0,
  },
  listSurface: {
    flex: 1,
  },
  listHeader: {
    gap: spacing.md,
  },
  reservationsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  reservationsCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  reservationsTitle: {
    color: colors.text.primary,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.weight.bold,
  },
  reservationsText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterButton: {
    flexGrow: 1,
    minWidth: 84,
  },
  listContent: {
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pageButton: {
    flex: 1,
  },
});
