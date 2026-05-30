'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status-badge';
import { getBlurDataUrl } from '@/lib/images';
import { CalendarDays, MapPin, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    startDate: string;
    location: string;
    price: number;
    currency: string;
    isFree: boolean;
    capacity: number;
    remainingSpots: number;
    thumbnailUrl: string | null;
    category: { name: string };
    isRegistered?: boolean;
    registrationStatus?: string | null;
  };
}

export function EventCard({ event }: EventCardProps) {
  const spotsLeft = event.remainingSpots;
  const spotsPercentage = event.capacity > 0 ? Math.round((spotsLeft / event.capacity) * 100) : 0;
  const registrationStatus = event.registrationStatus?.toLowerCase() ?? '';
  const ctaLabel = event.isRegistered
    ? registrationStatus.includes('pending')
      ? 'Pending Approval'
      : registrationStatus.includes('approved') || registrationStatus.includes('confirmed')
        ? 'View Ticket'
        : 'View Details'
    : spotsLeft <= 0
      ? 'Registration Closed'
      : 'Register';

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block"
    >
      <div className="premium-ring overflow-hidden rounded-3xl border border-surface-border/60 bg-surface-card/85 transition-all duration-300 hover:border-cyan/35 hover:shadow-glow-sm">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-elevated">
          {event.thumbnailUrl ? (
            <Image
              src={event.thumbnailUrl}
              alt={event.title}
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL={getBlurDataUrl(640, 360)}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-elevated to-surface-main">
              <CalendarDays className="h-12 w-12 text-text-muted/30" />
            </div>
          )}
          {/* Top badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge variant="info" size="sm">
              {event.category.name}
            </Badge>
            {event.isRegistered && event.registrationStatus ? (
              <StatusBadge status={event.registrationStatus} />
            ) : null}
          </div>
          <div className="absolute right-3 top-3">
            {event.isFree ? (
              <Badge variant="success" size="sm">Free</Badge>
            ) : (
              <Badge variant="paid" size="sm">
                {event.price} {event.currency}
              </Badge>
            )}
          </div>
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-card via-surface-card/55 to-transparent" />
        </div>

        {/* Content */}
        <div className="space-y-3 p-4">
          <h3 className="font-heading text-base font-semibold text-text-primary line-clamp-1 group-hover:text-cyan-light transition-colors">
            {event.title}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {event.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(event.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          </div>

          {/* Spots + CTA */}
          <div className="flex items-center justify-between border-t border-surface-border/20 pt-3">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-xs text-text-muted">
                {spotsLeft > 0 ? (
                  <span>
                    <strong className="text-text-primary">{spotsLeft}</strong> spots left
                  </span>
                ) : (
                  <span className="text-status-error">Full</span>
                )}
              </span>
              {event.capacity > 0 && (
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      spotsPercentage > 50
                        ? 'bg-success'
                        : spotsPercentage > 20
                          ? 'bg-warning'
                          : 'bg-status-error',
                    )}
                    style={{ width: `${100 - spotsPercentage}%` }}
                  />
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan/25 bg-cyan/10 px-2.5 py-1 text-xs font-bold text-cyan-light transition-all group-hover:border-cyan/50 group-hover:shadow-glow-sm">
              {ctaLabel}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
