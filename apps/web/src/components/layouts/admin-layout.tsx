'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hasPermission, type SessionUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Shield,
  Megaphone,
  ScrollText,
  CalendarDays,
  ClipboardList,
  CreditCard,
  BookOpen,
  BookMarked,
  BarChart3,
  Download,
  FileText,
  UserCheck,
  QrCode,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const menu = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users, permission: 'users:read' },
  { href: '/admin/roles', label: 'Roles', icon: Shield, permission: 'roles:read' },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone, permission: 'announcements:read' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, permission: 'audit_logs:read' },
  { href: '/admin/events', label: 'Events', icon: CalendarDays, permission: 'events:read' },
  { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList, permission: 'registrations:read' },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard, permission: 'payments:read' },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, permission: 'courses:read' },
  { href: '/admin/lessons', label: 'Lessons', icon: BookMarked, permission: 'courses:read' },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3, permission: 'reports:read' },
  { href: '/admin/exports', label: 'Exports', icon: Download, permission: 'exports:create' },
  { href: '/admin/content-pages', label: 'Content Pages', icon: FileText, permission: 'content_pages:read' },
  { href: '/admin/attendance', label: 'Attendance', icon: UserCheck, permission: 'attendance:read' },
  { href: '/admin/qr-scanner', label: 'QR Scanner', icon: QrCode, permission: 'scanner:use' },
];

export function AdminLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const filteredMenu = menu.filter(
    (item) => !item.permission || hasPermission(user, item.permission),
  );

  return (
    <div className="min-h-screen bg-surface-main text-text-primary">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-border/50 bg-surface-card/85 px-4 py-3 shadow-card backdrop-blur-xl lg:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            AMG Academy
          </p>
          <p className="text-xs font-medium text-text-secondary">Admin Console</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-cyan/25 bg-cyan/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-light">
            {user?.role ?? 'guest'}
          </span>
          <button
            onClick={() => logout()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error/10 hover:text-error"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen border-r border-surface-border/45 bg-surface-card/70 shadow-card backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b border-surface-border/35 px-5 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                AMG Academy
              </p>
              <h1 className="mt-1 font-heading text-xl font-semibold">
                <span className="text-gradient">Admin</span> Console
              </h1>
            </div>
            <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-light shadow-glow-sm">
              {user?.role ?? 'guest'}
            </span>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            {filteredMenu.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-cyan/10 text-cyan-light shadow-glow-sm ring-1 ring-cyan/20'
                      : 'text-text-secondary hover:bg-surface-elevated/70 hover:text-text-primary',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-cyan' : 'text-text-muted group-hover:text-text-secondary',
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive ? (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-cyan/60" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-surface-border/35 p-3">
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-error/10 hover:text-error"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="min-h-screen px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
