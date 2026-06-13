'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Bell, Check, MailOpen } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

async function fetchNotifications() {
  const { data } = await api.get('/notifications');
  return data;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load notifications" description={error?.message ?? ''} onRetry={refetch} />;

  const notifications: NotificationItem[] = data?.data?.data ?? data?.data ?? [];
  const unreadCount = data?.data?.meta?.unreadCount ?? data?.meta?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Announcements, registration updates, payment changes, and course alerts."
        actions={
          <>
            {unreadCount > 0 ? <Badge variant="premium">{unreadCount} unread</Badge> : null}
            {unreadCount > 0 && (
          <Button size="sm" variant="secondary" onClick={() => markAllRead.mutate()} className="gap-2">
            <MailOpen className="h-4 w-4" />
            Mark all read
          </Button>
            )}
          </>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You don't have any notifications yet."
          icon={<Bell className="h-7 w-7" />}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              variant={notification.read ? 'default' : 'elevated'}
              className={notification.read ? 'opacity-70' : ''}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      notification.read
                        ? 'bg-surface-elevated text-text-muted'
                        : 'bg-gold/10 text-gold'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">{notification.title}</h3>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-gold" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">{notification.message}</p>
                  <span className="text-xs text-text-muted">{new Date(notification.createdAt).toLocaleString()}</span>
                </div>
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead.mutate(notification.id)}
                    className="flex-shrink-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
