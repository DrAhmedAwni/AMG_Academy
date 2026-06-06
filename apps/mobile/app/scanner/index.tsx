import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import { SessionGate } from '../../src/features/auth/SessionGate';
import {
  useScannerEventsQuery,
} from '../../src/features/scanner/scanner.hooks';
import type { MobileEvent } from '../../src/features/events/events.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, spacing, textStyles, typography } from '../../src/theme';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ScannerEventSelectionScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const filters = useMemo(
    () => ({
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
    }),
    [search],
  );
  const eventsQuery = useScannerEventsQuery(filters);
  const state = useQueryState(eventsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });

  const renderEvent = ({ item }: { item: MobileEvent }) => (
    <GlassCard style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleGroup}>
          <Text style={styles.kicker}>{formatDate(item.startDate)}</Text>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventMeta}>{item.location}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          label="Scan"
          onPress={() => {
            router.push({
              pathname: '/scanner/scan',
              params: { eventId: item.id, eventTitle: item.title },
            } as never);
          }}
          style={styles.actionButton}
        />
        <Button
          label="Recent"
          variant="secondary"
          onPress={() => {
            router.push({
              pathname: '/scanner/recent',
              params: { eventId: item.id, eventTitle: item.title },
            } as never);
          }}
          style={styles.actionButton}
        />
      </View>
    </GlassCard>
  );

  return (
    <SessionGate requireScanner>
      <Screen scroll={false} contentStyle={styles.screen}>
        <Header
          title="Scanner"
          subtitle="Choose an event before scanning tickets."
          action={
            <Button
              label="All recent"
              variant="secondary"
              onPress={() => router.push('/scanner/recent' as never)}
            />
          }
        />

        <TextField
          label="Search events"
          value={search}
          onChangeText={setSearch}
          placeholder="Find an event"
          returnKeyType="search"
        />

        {state.status === 'loading' ? (
          <LoadingState title="Loading events" message="Finding events available for scanning." />
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
            icon="scan-outline"
            title="No events available"
            message="Events available for attendance scanning will appear here."
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
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </Screen>
    </SessionGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.md,
  },
  eventCard: {
    gap: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eventTitleGroup: {
    flex: 1,
    gap: spacing.xxs,
  },
  kicker: {
    ...textStyles.caption,
    color: colors.accent.primary,
    textTransform: 'uppercase',
  },
  eventTitle: {
    ...textStyles.heading,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
  },
  eventMeta: textStyles.body,
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
