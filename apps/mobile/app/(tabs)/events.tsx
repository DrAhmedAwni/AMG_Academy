import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '../../src/components/cards/EventCard';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button, TextField } from '../../src/components/ui';
import {
  useEventsQuery,
} from '../../src/features/events/events.hooks';
import type { EventFilters, MobileEvent } from '../../src/features/events/events.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, layout, spacing } from '../../src/theme';

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

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <Header
        title="Events"
        subtitle="Browse and register using backend event state."
        action={
          <Button
            label="Reservations"
            variant="secondary"
            size="sm"
            onPress={() => router.push('/events/reservations' as never)}
          />
        }
      />

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

      {state.status === 'loading' ? (
        <LoadingState title="Loading events" message="Fetching the latest published events." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => {
            void eventsQuery.refetch();
          }}
        />
      ) : state.status === 'empty' ? (
        <EmptyState
          title="No events found"
          message="Try another search or filter. Published events will appear here from the backend."
        />
      ) : (
        <FlatList
          data={state.data.data}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
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
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={
            meta && meta.totalPages > 1 ? (
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
  },
  listContent: {},
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
