import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NotificationCard } from '../src/components/cards/NotificationCard';
import { Header, Screen } from '../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../src/components/states';
import { Button, GlassCard } from '../src/components/ui';
import {
  useAnnouncementsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../src/features/notifications/notifications.hooks';
import { useQueryState } from '../src/hooks/useQueryState';
import { colors, spacing, textStyles } from '../src/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const notificationsQuery = useNotificationsQuery({ limit: 50 });
  const announcementsQuery = useAnnouncementsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const state = useQueryState(notificationsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });

  const announcements = announcementsQuery.data?.data ?? [];
  const allNotifications = [...announcements, ...(state.data?.data ?? [])];

  const renderItem = ({ item }: { item: any }) => (
    <NotificationCard
      notification={item}
      onPress={() => {
        if (!item.read) {
          void markReadMutation.mutateAsync(item.id).catch(() => {});
        }
        if (item.entityType && item.entityId) {
          const route = item.entityType === 'Event'
            ? `/events/${item.entityId}`
            : item.entityType === 'Course'
              ? `/courses/${item.entityId}`
              : null;
          if (route) {
            router.push(route as never);
          }
        }
      }}
    />
  );

  return (
    <Screen>
      <Header
        title="Notifications"
        subtitle="In-app notifications, announcements, and deep-link targets."
        action={
          <Button
            label="Mark All Read"
            variant="secondary"
            loading={markAllReadMutation.isPending}
            onPress={() => { void markAllReadMutation.mutateAsync(); }}
          />
        }
      />

      {announcements.length > 0 ? (
        <GlassCard style={styles.announcementCard}>
          <Text style={styles.announcementLabel}>Announcements</Text>
          <Text style={styles.announcementCount}>
            {announcements.length} published announcement{announcements.length !== 1 ? 's' : ''}
          </Text>
        </GlassCard>
      ) : null}

      {state.status === 'loading' ? (
        <LoadingState title="Loading notifications" message="Fetching your inbox." />
      ) : state.status === 'error' ? (
        <ErrorState
          title={state.error.title}
          message={state.error.message}
          onRetry={() => { void notificationsQuery.refetch(); }}
        />
      ) : state.status === 'empty' && announcements.length === 0 ? (
        <EmptyState
          title="No notifications"
          message="You have no notifications or announcements yet."
        />
      ) : (
        <FlatList
          data={allNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={() => {
                void notificationsQuery.refetch();
                void announcementsQuery.refetch();
              }}
              tintColor={colors.accent.primary}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  announcementCard: {
    gap: spacing.xs,
  },
  announcementLabel: {
    ...textStyles.label,
  },
  announcementCount: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
