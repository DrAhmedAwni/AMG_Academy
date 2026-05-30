'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Bell } from 'lucide-react';

export function NotificationBadge() {
  const { data } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', {
        params: { limit: '1' },
        headers: { 'x-skip-auth-redirect': '1' },
      });
      return data.meta?.unreadCount ?? 0;
    },
    refetchInterval: 30000,
    retry: false,
  });

  const count = data ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      aria-label={count > 0 ? `${count} unread notifications` : 'Open notifications'}
    >
      <Bell className="h-5 w-5 text-text-secondary transition-colors hover:text-text-primary" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-action px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
