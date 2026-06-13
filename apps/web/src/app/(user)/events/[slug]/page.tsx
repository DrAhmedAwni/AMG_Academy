'use client';

import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Button, Badge, Card } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { getBlurDataUrl } from '@/lib/images';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Ticket,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface EventDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  currency: string;
  isFree: boolean;
  capacity: number;
  remainingSpots: number;
  registrationDeadline: string | null;
  thumbnailUrl: string | null;
  category: { name: string };
  isRegistered: boolean;
  registrationStatus: string | null;
  paymentId: string | null;
  status: string;
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const { data } = await api.get(`/events/${slug}`);
      return data.data as EventDetail;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data: responseData } = await api.post('/registrations', {
        eventId: data?.id,
      });
      return responseData.data ?? responseData;
    },
    onSuccess: (result: { paymentId?: string; paymentStatus?: string }) => {
      if (result.paymentId && result.paymentStatus === 'pending') {
        toast.success('Registration submitted. Redirecting to payment...');
        router.push(`/payment/${result.paymentId}`);
      } else {
        toast.success('Registration submitted successfully');
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
        refetch();
      }
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
          ?.error?.message ?? 'Registration failed';
      toast.error(message);
    },
  });

  if (isLoading) return <LoadingSkeleton lines={8} variant="card" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load event"
        description={error?.message ?? 'Something went wrong'}
        onRetry={refetch}
      />
    );
  if (!data)
    return (
      <EmptyState
        title="Event not found"
        description="The event you are looking for does not exist."
      />
    );

  const event = data;
  const spotsLeft = event.remainingSpots;
  const spotsPercentage =
    event.capacity > 0 ? Math.round(((event.capacity - spotsLeft) / event.capacity) * 100) : 0;
  const isPast = new Date(event.endDate) < new Date();
  const isRegistrationClosed =
    event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

  return (
    <div className="animate-fade-in space-y-8">
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Hero section */}
      <div className="overflow-hidden rounded-2xl border border-surface-border/30 bg-surface-card">
        {event.thumbnailUrl && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-surface-elevated">
            <Image
              src={event.thumbnailUrl}
              alt={event.title}
              fill
              sizes="(max-width: 1024px) 100vw, 72rem"
              className="object-contain"
              placeholder="blur"
              blurDataURL={getBlurDataUrl(1280, 720)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
          </div>
        )}

        <div className="space-y-6 p-6 lg:p-8">
          {/* Title & badges */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm">
                  {event.category.name}
                </Badge>
                <StatusBadge status={event.status} />
                {event.isFree && <Badge variant="success">Free</Badge>}
                {event.isRegistered && event.registrationStatus && (
                  <StatusBadge status={event.registrationStatus} />
                )}
              </div>
              <h1 className="font-heading text-3xl font-bold text-text-primary lg:text-4xl">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Description */}
          <p className="max-w-3xl text-base leading-relaxed text-text-secondary">
            {event.description}
          </p>

          {/* Info cards grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card variant="elevated" className="space-y-2">
              <CalendarDays className="h-5 w-5 text-gold" />
              <p className="text-xs text-text-muted">Date</p>
              <p className="text-sm font-medium text-text-primary">
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {event.endDate && (
                <p className="text-xs text-text-muted">
                  to {new Date(event.endDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
            </Card>

            <Card variant="elevated" className="space-y-2">
              <MapPin className="h-5 w-5 text-gold" />
              <p className="text-xs text-text-muted">Location</p>
              <p className="text-sm font-medium text-text-primary">
                {event.location}
              </p>
            </Card>

            <Card variant="elevated" className="space-y-2">
              <Users className="h-5 w-5 text-gold" />
              <p className="text-xs text-text-muted">Capacity</p>
              <p className="text-sm font-medium text-text-primary">
                {spotsLeft > 0 ? (
                  <span>
                    <strong>{spotsLeft}</strong> spots remaining
                  </span>
                ) : (
                  <span className="text-status-error">Full</span>
                )}
              </p>
              {event.capacity > 0 && (
                <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      spotsPercentage > 80
                        ? 'bg-status-error'
                        : spotsPercentage > 50
                          ? 'bg-warning'
                          : 'bg-success',
                    )}
                    style={{ width: `${spotsPercentage}%` }}
                  />
                </div>
              )}
            </Card>

            <Card variant="elevated" className="space-y-2">
              <DollarSign className="h-5 w-5 text-gold" />
              <p className="text-xs text-text-muted">Price</p>
              <p className="text-sm font-medium text-text-primary">
                {event.isFree ? (
                  <span className="text-success">Free</span>
                ) : (
                  `${event.price} ${event.currency}`
                )}
              </p>
            </Card>
          </div>

          {/* Registration deadline warning */}
          {isRegistrationClosed && !event.isRegistered && (
            <Card variant="default" className="flex items-center gap-3 border-warning/20 bg-warning/5">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-warning">Registration closed</p>
                <p className="text-xs text-text-secondary">
                  The registration deadline for this event has passed.
                </p>
              </div>
            </Card>
          )}

          {/* CTA */}
          <div className="rounded-xl border border-surface-border/30 bg-surface-elevated/30 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text-secondary">Ready to join?</p>
                <p className="text-lg font-semibold text-text-primary">
                  {event.isRegistered
                    ? 'You are registered for this event'
                    : event.isFree
                      ? 'Free registration'
                      : `${event.price} ${event.currency}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {event.isRegistered ? (
                  <>
                    <StatusBadge status={event.registrationStatus ?? 'registered'} />
                    {event.registrationStatus === 'pending' && !event.isFree && event.paymentId && (
                      <Link href={`/payment/${event.paymentId}`}>
                        <Button variant="gold">
                          <Ticket className="h-4 w-4" />
                          Continue to Payment
                        </Button>
                      </Link>
                    )}
                    <Link href="/my-reservations">
                      <Button variant="secondary">
                        <Ticket className="h-4 w-4" />
                        View My Ticket
                      </Button>
                    </Link>
                  </>
                ) : isPast || isRegistrationClosed ? (
                  <Button variant="secondary" disabled>
                    Registration Closed
                  </Button>
                ) : (
                  <Button
                    variant="gold"
                    size="lg"
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending || spotsLeft <= 0}
                  >
                    {registerMutation.isPending
                      ? 'Submitting...'
                      : spotsLeft <= 0
                        ? 'Fully Booked'
                        : 'Register Now'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
