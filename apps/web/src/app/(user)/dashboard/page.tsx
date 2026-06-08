'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Badge } from '@/components/ui';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/states';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import {
  CalendarDays,
  BookOpen,
  Ticket,
  Bell,
  GraduationCap,
  ArrowRight,
  Sparkles,
  QrCode,
  ChevronRight,
  User,
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  status: string;
}

const recommendedCourses = [
  'Advanced Orthodontics',
  'Endodontic Case Planning',
  'Implant Workflow Essentials',
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const eventsQuery = useQuery({
    queryKey: ['dashboard', 'events'],
    queryFn: async () => {
      const { data } = await api.get('/events', {
        params: { page: 1, limit: 3 },
      });
      return (data?.data?.data ?? data?.data ?? []) as EventItem[];
    },
  });

  if (isLoading) {
    return <LoadingSkeleton lines={4} variant="card" />;
  }

  const upcomingEvents = eventsQuery.data ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome hero card */}
      <Card variant="elevated" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/[0.03] via-transparent to-transparent" />
        <div className="relative space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              Welcome back
            </p>
          </div>
          <h2 className="font-heading text-3xl font-bold text-text-primary">
            {user?.name ?? 'AMG member'}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
            Your AMG Academy dashboard — manage registrations, access courses,
            and stay updated with the latest events and announcements.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/events">
              <Button variant="glow" size="sm">
                <CalendarDays className="h-4 w-4" />
                Browse Events
              </Button>
            </Link>
            <Link href="/my-reservations">
              <Button variant="secondary" size="sm">
                <Ticket className="h-4 w-4" />
                My Reservations
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick access grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/my-qr-tickets">
          <Card variant="action" className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10 text-cyan-light">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">My QR Tickets</p>
              <p className="text-xs text-text-muted">Access your event passes</p>
            </div>
          </Card>
        </Link>
        <Link href="/my-courses">
          <Card variant="action" className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">My Courses</p>
              <p className="text-xs text-text-muted">Continue learning</p>
            </div>
          </Card>
        </Link>
        <Link href="/notifications">
          <Card variant="action" className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Notifications</p>
              <p className="text-xs text-text-muted">Check your alerts</p>
            </div>
          </Card>
        </Link>
        <Link href="/profile">
          <Card variant="action" className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Profile</p>
              <p className="text-xs text-text-muted">Manage your account</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming events */}
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              Upcoming Events
            </h3>
            <Link href="/events">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          {eventsQuery.isLoading ? (
            <LoadingSkeleton lines={3} variant="card" />
          ) : eventsQuery.isError ? (
            <ErrorState
              title="Events unavailable"
              description="Real events could not be loaded right now."
              onRetry={() => void eventsQuery.refetch()}
            />
          ) : upcomingEvents.length === 0 ? (
            <EmptyState title="No upcoming events" description="Published events will appear here." />
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((item) => (
                <Link
                  key={item.id}
                  href={`/events/${item.slug}`}
                  className="flex items-center justify-between rounded-lg border border-surface-border/20 bg-surface-main/30 p-3.5 transition-colors hover:bg-surface-elevated/30"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-cyan" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(item.startDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">
                    {item.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recommended courses */}
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              Recommended Courses
            </h3>
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {recommendedCourses.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg border border-surface-border/20 bg-surface-main/30 p-3.5 transition-colors hover:bg-surface-elevated/30"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-medium text-text-primary">{item}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
