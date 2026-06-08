'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, PageHeader, StatusBadge } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { getBlurDataUrl } from '@/lib/images';
import { Play, Clock, Award, CreditCard } from 'lucide-react';

interface MyEnrollment {
  id: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  paymentStatus: string;
  paymentId: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    instructor: { id: string; name: string; avatarUrl: string | null };
    category: { id: string; name: string; slug: string };
    totalDuration: number;
    lessonCount: number;
  };
}

async function fetchMyCourses() {
  const { data } = await api.get('/enrollments');
  return data;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-courses'],
    queryFn: fetchMyCourses,
  });

  if (isLoading) return <LoadingSkeleton lines={6} />;
  if (isError) return <ErrorState title="Failed to load courses" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;

  const enrollments: MyEnrollment[] = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Continue enrolled courses, monitor progress, and resume your next lesson."
      />

      {enrollments.length === 0 ? (
        <EmptyState
          title="No enrolled courses"
          description="Browse our catalog and enroll in a course to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/courses/${enrollment.course.slug}`}
              className="premium-ring group flex flex-col gap-3 rounded-3xl border border-surface-border/60 bg-surface-card/85 p-4 transition-all duration-300 hover:border-cyan/40 hover:shadow-glow-sm"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-elevated">
                {enrollment.course.thumbnailUrl ? (
                  <Image
                    src={enrollment.course.thumbnailUrl}
                    alt={enrollment.course.title}
                    fill
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataUrl()}
                    className="object-contain transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-muted">
                    <Award className="h-12 w-12 text-text-muted/40" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-surface-main shadow-glow">
                    <Play className="h-7 w-7" />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info" size="sm">{enrollment.course.category.name}</Badge>
                  <StatusBadge status={enrollment.status} />
                  <StatusBadge status={enrollment.paymentStatus} />
                  {enrollment.paymentStatus === 'pending' && enrollment.paymentId && (
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/payment/${enrollment.paymentId}`);
                      }}
                    >
                      <CreditCard className="h-3 w-3" />
                      Pay
                    </Button>
                  )}
                </div>
                <h3 className="font-heading text-lg font-semibold text-text-primary line-clamp-1">
                  {enrollment.course.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2">{enrollment.course.description}</p>
              </div>

              <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {enrollment.course.lessonCount} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {enrollment.progressPercent}%
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className="h-full rounded-full bg-cyan transition-all"
                    style={{ width: `${enrollment.progressPercent}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
