import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../../src/components/states';
import { Button } from '../../src/components/ui';
import { SessionGate } from '../../src/features/auth/SessionGate';
import { ScannerResultCard } from '../../src/features/scanner/ScannerResultCard';
import {
  buildRecentScanResult,
  useRecentScansQuery,
} from '../../src/features/scanner/scanner.hooks';
import type { AttendanceRecord } from '../../src/features/scanner/scanner.api';
import { useQueryState } from '../../src/hooks/useQueryState';
import { colors, spacing, textStyles } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function RecentScannerScansScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string | string[]; eventTitle?: string | string[] }>();
  const eventId = resolveParam(params.eventId) || undefined;
  const eventTitle = resolveParam(params.eventTitle);
  const recentQuery = useRecentScansQuery({ page: 1, limit: 50, eventId });
  const state = useQueryState(recentQuery, {
    isEmpty: (data) => data.data.length === 0,
  });

  const renderRecentScan = ({ item }: { item: AttendanceRecord }) => (
    <View style={styles.recordBlock}>
      <ScannerResultCard result={buildRecentScanResult(item)} />
      <Text style={styles.recordMeta}>Attendance record: {item.id}</Text>
    </View>
  );

  return (
    <SessionGate requireScanner>
      <Screen scroll={false} contentStyle={styles.screen}>
        <Header
          title="Recent scans"
          subtitle={eventTitle || 'Your scanner check-ins'}
          action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
        />

        {state.status === 'loading' ? (
          <LoadingState title="Loading recent scans" message="Fetching attendance records." />
        ) : state.status === 'error' ? (
          <ErrorState
            title={state.error.title}
            message={state.error.message}
            onRetry={() => {
              void recentQuery.refetch();
            }}
          />
        ) : state.status === 'empty' ? (
          <EmptyState
            title="No recent scans"
            message="Successful backend check-ins for this scanner will appear here."
          />
        ) : (
          <FlatList
            data={state.data.data}
            keyExtractor={(item) => item.id}
            renderItem={renderRecentScan}
            refreshControl={
              <RefreshControl
                tintColor={colors.accent.primary}
                refreshing={state.isRefreshing}
                onRefresh={() => {
                  void recentQuery.refetch();
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
  recordBlock: {
    gap: spacing.sm,
  },
  recordMeta: textStyles.caption,
});
