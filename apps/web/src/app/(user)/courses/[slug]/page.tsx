'use client';

import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { LessonCard } from '@/components/cards/LessonCard';
import { Button, Card, Badge } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { getBlurDataUrl } from '@/lib/images';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Users,
  User,
  ChevronRight,
  GraduationCap,
  PlayCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface CourseDetail {
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
  isEnrolled: boolean;
  paymentStatus: string | null;
  paymentId: string | null;
  status: string;
  instructor: { id: string; name: string; avatarUrl: string | null };
  category: { id: string; name: string; slug: string };
  lessons: Array<{
    id: string;
    title: string;
    description: string | null;
    duration: number;
    orderIndex: number;
    videoId: string | null;
  }>;
}

async function fetchCourse(slug: string) {
  const { data } = await api.get(`/courses/${slug}`);
  return data.data as CourseDetail;
}

async function enroll(courseId: string) {
  const { data } = await api.post('/enrollments', { courseId });
  return data;
}

export default function CourseDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: course, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => fetchCourse(slug),
  });

  const enrollMutation = useMutation({
    mutationFn: enroll,
    onSuccess: (result: { paymentId?: string; paymentStatus?: string }) => {
      if (result.paymentId && result.paymentStatus === 'pending') {
        toast.success('Enrolled! Redirecting to payment...');
        router.push(`/payment/${result.paymentId}`);
      } else {
        toast.success('Enrolled successfully!');
        queryClient.invalidateQueries({ queryKey: ['course', slug] });
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Enrollment failed');
    },
  });

  if (isLoading) return <LoadingSkeleton lines={8} variant="card" />;
  if (isError)
    return (
      <ErrorState
        title="Failed to load course"
        description={error?.message ?? 'Something went wrong'}
        onRetry={refetch}
      />
    );
  if (!course)
    return (
      <EmptyState
        title="Course not found"
        description="The course you requested is unavailable."
      />
    );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Back link */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-elevated">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
                placeholder="blur"
                blurDataURL={getBlurDataUrl(1280, 720)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <GraduationCap className="h-16 w-16 text-text-muted/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
          </div>

          {/* Title & meta */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info" size="sm">
                {course.category.name}
              </Badge>
              <StatusBadge status={course.status} />
              {course.isFree && <Badge variant="success">Free</Badge>}
            </div>
            <h1 className="font-heading text-2xl font-bold text-text-primary lg:text-3xl">
              {course.title}
            </h1>
            <p className="text-base leading-relaxed text-text-secondary">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" />
                By{' '}
                <span className="font-medium text-text-primary">
                  {course.instructor.name}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {course.lessonCount} lessons
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.round(course.totalDuration / 60)}h total
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {course.enrollmentsCount} enrolled
              </span>
            </div>
          </div>

          {/* Course content / lessons */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-text-primary">
              Course Content
            </h2>
            {course.lessons.length === 0 ? (
              <EmptyState
                title="No lessons yet"
                description="This course doesn't have any lessons."
              />
            ) : (
              <div className="space-y-2">
                {course.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onClick={() => {
                      if (course.paymentStatus === 'pending') {
                        toast.error('Payment required to access lessons');
                      } else if (course.isEnrolled) {
                        router.push(`/my-courses/${course.slug}/${lesson.id}`);
                      } else {
                        toast.error('Enroll in this course to access lessons');
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <Card variant="elevated" className="sticky top-24 space-y-5">
            {/* Price */}
            <div className="text-center">
              {course.isFree ? (
                <span className="font-heading text-4xl font-bold text-success">Free</span>
              ) : (
                <>
                  <span className="font-heading text-4xl font-bold text-text-primary">
                    {course.price} {course.currency}
                  </span>
                  <p className="mt-1 text-xs text-text-muted">One-time payment</p>
                </>
              )}
            </div>

            {/* Progress (if enrolled) */}
            {course.isEnrolled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Progress</span>
                  <span className="font-medium text-text-primary">0%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                  <div className="h-full w-0 rounded-full bg-cyan transition-all" />
                </div>
              </div>
            )}

            {/* CTA */}
            {course.isEnrolled && course.paymentStatus === 'pending' ? (
              <Button
                className="w-full"
                variant="glow"
                size="lg"
                onClick={() => router.push(`/payment/${course.paymentId}`)}
              >
                Continue to Payment
              </Button>
            ) : course.isEnrolled ? (
              <Button
                className="w-full"
                variant="glow"
                size="lg"
                onClick={() => {
                  if (course.lessons.length > 0) {
                    const firstLesson = course.lessons[0];
                    if (firstLesson) {
                      router.push(`/my-courses/${course.slug}/${firstLesson.id}`);
                    }
                  }
                }}
              >
                <PlayCircle className="h-5 w-5" />
                Continue Learning
              </Button>
            ) : (
              <Button
                className="w-full"
                variant="glow"
                size="lg"
                onClick={() => enrollMutation.mutate(course.id)}
                disabled={enrollMutation.isPending}
              >
                {enrollMutation.isPending
                  ? 'Enrolling...'
                  : course.isFree
                    ? 'Enroll for Free'
                    : 'Enroll Now'}
              </Button>
            )}
            {course.isEnrolled && course.paymentStatus === 'pending' && (
              <div className="rounded-xl bg-warning/10 p-3 text-center">
                <p className="text-xs font-medium text-warning">
                  Payment required to access lessons
                </p>
              </div>
            )}

            {/* Course stats */}
            <div className="space-y-3 border-t border-surface-border/20 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Lessons</span>
                <span className="font-medium text-text-primary">
                  {course.lessonCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Duration</span>
                <span className="font-medium text-text-primary">
                  {Math.round(course.totalDuration / 60)}h
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Students</span>
                <span className="font-medium text-text-primary">
                  {course.enrollmentsCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Instructor</span>
                <span className="font-medium text-text-primary">
                  {course.instructor.name}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
