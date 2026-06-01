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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/my-reservations', label: 'My Events', icon: Ticket },
  { href: '/my-courses', label: 'My Courses', icon: GraduationCap },
  { href: '/notifications', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
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
      {/* Desktop header */}
      <header className="sticky top-0 z-20 hidden border-b border-surface-border/45 bg-surface-card/80 shadow-card backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                AMG Academy
              </p>
              <h1 className="font-heading text-lg font-semibold">
                {title ? (
                  <span className="text-gradient">{title}</span>
                ) : (
                  <span className="text-gradient">Dashboard</span>
                )}
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
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200',
                      isActive
                        ? 'bg-cyan/10 text-cyan-light shadow-glow-sm ring-1 ring-cyan/15'
                        : 'text-text-secondary hover:bg-surface-elevated/70 hover:text-text-primary',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-2 flex items-center gap-1.5 pl-2 border-l border-surface-border/30">
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
      <header className="sticky top-0 z-20 border-b border-surface-border/45 bg-surface-card/85 px-4 py-3 shadow-card backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              AMG Academy
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {title ?? 'Dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Desktop footer */}
      <footer className="hidden border-t border-surface-border/30 bg-surface-card/55 px-6 py-4 md:block">
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

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-surface-border/45 bg-surface-card/90 px-2 py-2 shadow-elevated backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200',
                  isActive ? 'bg-cyan/10 text-cyan-light' : 'text-text-muted',
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="max-w-full truncate text-[10px] font-semibold">{item.label}</span>
                {isActive ? (
                  <span className="h-0.5 w-4 rounded-full bg-cyan" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
