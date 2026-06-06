import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { NotificationCard } from '../src/components/cards/NotificationCard';
import { Header, Screen } from '../src/components/layout';
import { EmptyState, ErrorState, LoadingState } from '../src/components/states';
import { Button } from '../src/components/ui';
import {
  useAnnouncementsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../src/features/notifications/notifications.hooks';
import { useQueryState } from '../src/hooks/useQueryState';
import { colors, spacing } from '../src/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const notificationsQuery = useNotificationsQuery({ limit: 50 });
  const announcementsQuery = useAnnouncementsQuery();
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const state = useQueryState(notificationsQuery, {
    isEmpty: (data) => data.data.length === 0,
  });

  const announcements = (announcementsQuery.data?.data ?? []).map((announcement) => ({
    id: `announcement-${announcement.id}`,
    type: 'NEW_ANNOUNCEMENT',
    title: announcement.title,
    message: announcement.body,
    read: true,
    entityType: 'Announcement',
    entityId: announcement.id,
    createdAt: announcement.publishedAt ?? announcement.createdAt,
  }));
  const allNotifications = [...announcements, ...(state.data?.data ?? [])];
  const announcementError = announcementsQuery.error ? mapAnnouncementsError(announcementsQuery.error) : null;

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

      {state.status === 'loading' || announcementsQuery.isLoading ? (
        <LoadingState title="Loading notifications" message="Fetching your inbox." />
      ) : state.status === 'error' || announcementError ? (
        <ErrorState
          title={state.status === 'error' ? state.error.title : announcementError?.title}
          message={state.status === 'error' ? state.error.message : announcementError?.message}
          onRetry={() => {
            void notificationsQuery.refetch();
            void announcementsQuery.refetch();
          }}
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
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
});

function mapAnnouncementsError(error: unknown) {
  if (error instanceof Error) {
    return { title: 'Announcements unavailable', message: error.message };
  }
  return { title: 'Announcements unavailable', message: 'Please try again.' };
}
