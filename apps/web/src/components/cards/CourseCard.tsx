'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { getBlurDataUrl } from '@/lib/images';
import { BookOpen, Clock, User, ArrowRight, GraduationCap } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    price: number;
    currency: string;
    isFree: boolean;
    totalDuration: number;
    lessonCount: number;
    enrollmentsCount: number;
    instructor: { name: string };
    category: { name: string };
    isEnrolled?: boolean;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const ctaLabel = course.isEnrolled ? 'Continue Learning' : 'View Course';

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block"
    >
      <div className="gold-ring overflow-hidden rounded-3xl border border-surface-border bg-surface-card transition-all duration-300 hover:border-gold/20 hover:shadow-glow-sm">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-surface-elevated">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-elevated to-surface-main">
              <GraduationCap className="h-12 w-12 text-text-muted/20" />
            </div>
          )}
          {/* Top badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge variant="info" size="sm">
              {course.category.name}
            </Badge>
            {course.isEnrolled && (
              <Badge variant="success" size="sm">Enrolled</Badge>
            )}
          </div>
          <div className="absolute right-3 top-3">
            {course.isFree ? (
              <Badge variant="success" size="sm">Free</Badge>
            ) : (
              <Badge variant="paid" size="sm">
                {course.price} {course.currency}
              </Badge>
            )}
          </div>
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-card via-surface-card/55 to-transparent" />
        </div>

        {/* Content */}
        <div className="space-y-3 p-4">
          <h3 className="font-heading text-base font-semibold text-text-primary line-clamp-1 group-hover:text-gold-light transition-colors">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {course.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {course.instructor.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.lessonCount} lessons
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {Math.round(course.totalDuration / 60)}h
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between border-t border-surface-border pt-3">
            <span className="text-xs text-text-muted">
              {course.enrollmentsCount} enrolled
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold-light transition-all group-hover:border-gold/40 group-hover:shadow-glow-sm">
              {ctaLabel}
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
