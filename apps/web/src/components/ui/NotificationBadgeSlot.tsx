'use client';

import { usePathname } from 'next/navigation';
import { NotificationBadge } from './NotificationBadge';

const protectedPrefixes = [
  '/dashboard',
  '/notifications',
  '/profile',
  '/settings',
  '/my-reservations',
  '/my-qr-tickets',
  '/my-courses',
];

export function NotificationBadgeSlot() {
  const pathname = usePathname();
  const shouldRender = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return shouldRender ? <NotificationBadge /> : null;
}
