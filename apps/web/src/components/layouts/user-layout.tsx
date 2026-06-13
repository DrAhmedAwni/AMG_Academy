'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBadgeSlot } from '@/components/ui/NotificationBadgeSlot';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Ticket,
  GraduationCap,
  Bell,
  User,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard },
  { href: '/events', label: 'Events', mobileLabel: 'Events', icon: CalendarDays },
  { href: '/courses', label: 'Courses', mobileLabel: 'Courses', icon: BookOpen },
  { href: '/my-reservations', label: 'My Events', mobileLabel: 'Tickets', icon: Ticket },
  { href: '/my-courses', label: 'My Courses', mobileLabel: 'Learning', icon: GraduationCap },
  { href: '/notifications', label: 'Alerts', mobileLabel: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', mobileLabel: 'Profile', icon: User },
];

const footerLinks = [
  { href: '/content/privacy-policy', label: 'Privacy' },
  { href: '/content/terms-of-service', label: 'Terms' },
  { href: '/content/support', label: 'Support' },
];

export function UserLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-surface-main text-text-primary">
      {/* Desktop & tablet header */}
      <header className="sticky top-0 z-20 hidden border-b border-surface-border bg-surface-card/95 shadow-card backdrop-blur-xl sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-heading text-lg font-semibold text-text-primary">
                {title ?? 'Dashboard'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-gold/10 text-gold shadow-glow-sm ring-1 ring-gold/15'
                        : 'text-text-secondary hover:bg-surface-elevated/70 hover:text-text-primary',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-2 flex items-center gap-1.5 pl-2 border-l border-surface-border">
              <NotificationBadgeSlot />
              <button
                onClick={() => logout()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="sticky top-0 z-20 border-b border-surface-border bg-surface-card/90 px-4 py-3 shadow-card backdrop-blur-xl sm:hidden">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {title ?? 'Dashboard'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <NotificationBadgeSlot />
            <button
              onClick={() => logout()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error/10 hover:text-error"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:pb-6">
        {children}
      </main>

      {/* Desktop & tablet footer */}
      <footer className="hidden border-t border-surface-border bg-surface-card/55 px-6 py-4 sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-text-muted">
          <span>AMG Academy. All rights reserved.</span>
          <div className="flex gap-6">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-text-secondary">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Mobile & tablet bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-surface-border bg-surface-card/95 px-2 pt-2 shadow-elevated backdrop-blur-xl sm:hidden">
        <div className="flex items-stretch gap-0.5 overflow-x-auto pb-[calc(0.5rem+env(safe-area-inset-bottom))] scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-14 min-w-[52px] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-center transition-all duration-200',
                  isActive ? 'bg-gold/10 text-gold' : 'text-text-muted',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="block max-w-full truncate text-[9px] font-semibold leading-none">
                  {item.mobileLabel}
                </span>
                {isActive ? (
                  <span className="h-0.5 w-4 rounded-full bg-gold" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
