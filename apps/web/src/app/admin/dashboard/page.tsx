'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { ErrorState, LoadingSkeleton } from '@/components/states';
import { api } from '@/lib/api';
import {
  Users,
  CalendarDays,
  BookOpen,
  ClipboardList,
  CreditCard,
  ArrowRight,
  Activity,
  Shield,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboardOverviewPage() {
  const [usersQuery, eventsQuery, registrationsQuery, paymentsQuery] = useQueries({
    queries: [
      {
        queryKey: ['admin-dashboard', 'users'],
        queryFn: async () =>
          (await api.get('/users', { params: { page: 1, limit: 1 } })).data.data,
      },
      {
        queryKey: ['admin-dashboard', 'events'],
        queryFn: async () =>
          (await api.get('/events/admin', { params: { page: 1, limit: 1 } })).data.data,
      },
      {
        queryKey: ['admin-dashboard', 'registrations'],
        queryFn: async () =>
          (await api.get('/registrations/admin', { params: { page: 1, limit: 1, status: 'pending' } }))
            .data.data,
      },
      {
        queryKey: ['admin-dashboard', 'payments'],
        queryFn: async () =>
          (await api.get('/payments/admin', { params: { page: 1, limit: 1, status: 'pending' } })).data
            .data,
      },
    ],
  });

  const auditQuery = useQuery({
    queryKey: ['admin-dashboard', 'audit-logs'],
    queryFn: async () =>
      (await api.get('/audit-logs', { params: { page: 1, limit: 5 } })).data.data,
  });

  const isLoading =
    usersQuery.isLoading ||
    eventsQuery.isLoading ||
    registrationsQuery.isLoading ||
    paymentsQuery.isLoading ||
    auditQuery.isLoading;

  if (isLoading) {
    return <LoadingSkeleton lines={6} variant="card" />;
  }

  if (
    usersQuery.isError ||
    eventsQuery.isError ||
    registrationsQuery.isError ||
    paymentsQuery.isError ||
    auditQuery.isError
  ) {
    return (
      <ErrorState
        title="Dashboard data is unavailable."
        description="Please retry after the admin services finish loading."
        onRetry={() => {
          void usersQuery.refetch();
          void eventsQuery.refetch();
          void registrationsQuery.refetch();
          void paymentsQuery.refetch();
          void auditQuery.refetch();
        }}
      />
    );
  }

  const totalUsers = usersQuery.data?.meta?.total ?? 0;
  const totalEvents = eventsQuery.data?.meta?.total ?? 0;
  const pendingRegistrations = registrationsQuery.data?.meta?.total ?? 0;
  const pendingPayments = paymentsQuery.data?.meta?.total ?? 0;

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      href: '/admin/users',
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
    {
      label: 'Total Events',
      value: totalEvents,
      icon: CalendarDays,
      href: '/admin/events',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Pending Registrations',
      value: pendingRegistrations,
      icon: ClipboardList,
      href: '/admin/registrations',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      icon: CreditCard,
      href: '/admin/payments',
      color: 'text-status-error',
      bg: 'bg-status-error/10',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Admin <span className="text-gold">Dashboard</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Operational overview across all AMG Academy workflows
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group block">
            <Card variant="stat" className="group transition-all duration-200 hover:border-gold/30 hover:shadow-glow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{card.label}</p>
                  <p className="mt-2 font-heading text-3xl font-bold text-text-primary">
                    {card.value}
                  </p>
                </div>
                <div className={cn('rounded-xl p-3', card.bg)}>
                  <card.icon className={cn('h-6 w-6', card.color)} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gold-light opacity-0 transition-opacity group-hover:opacity-100">
                View details
                <ArrowRight className="h-3 w-3" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-text-primary mb-3">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/events/new">
            <Card variant="action" className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold-light">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Create Event</p>
                <p className="text-xs text-text-muted">Set up a new event</p>
              </div>
            </Card>
          </Link>
          <Link href="/admin/announcements">
            <Card variant="action" className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Announcements</p>
                <p className="text-xs text-text-muted">Post a new announcement</p>
              </div>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card variant="action" className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Manage Users</p>
                <p className="text-xs text-text-muted">View and manage accounts</p>
              </div>
            </Card>
          </Link>
          <Link href="/admin/reports">
            <Card variant="action" className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">View Reports</p>
                <p className="text-xs text-text-muted">Analytics and exports</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent audit activity */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Recent Activity
          </h2>
          <Link href="/admin/audit-logs">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="space-y-2">
          {(auditQuery.data?.items ?? []).length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">
              No recent activity
            </p>
          ) : (
            (auditQuery.data?.items ?? []).map((item: any, idx: number) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-surface-border/20 p-3.5 transition-colors hover:bg-surface-elevated/30',
                  idx === 0 && 'border-gold/20 bg-gold/[0.02]',
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated/60">
                  <Shield className="h-4 w-4 text-text-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">
                      {item.actor?.name ?? item.actor?.email ?? 'System'}
                    </span>{' '}
                    <span className="text-text-secondary">{item.action}</span>{' '}
                    <span className="text-text-muted">{item.entityType}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-text-muted">
                  {item.entityType}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
