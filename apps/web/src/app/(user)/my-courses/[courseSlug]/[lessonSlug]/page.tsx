'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { LessonCard } from '@/components/cards/LessonCard';
import { Button } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  orderIndex: number;
  videoId: string | null;
  isCompleted: boolean;
}

interface CourseWithLessons {
  id: string;
  title: string;
  slug: string;
  lessons: LessonDetail[];
}

async function fetchLesson(courseSlug: string, lessonId: string) {
  // Get course details with lessons
  const { data: courseData } = await api.get(`/courses/${courseSlug}`);
  const course: CourseWithLessons = courseData.data;

  // Get enrollment progress
  const { data: enrollmentData } = await api.get('/enrollments');
  const enrollments = enrollmentData?.data?.data ?? enrollmentData?.data ?? [];
  const enrollment = enrollments.find((e: any) => e.course.slug === courseSlug);

  const lessons = course.lessons.map((lesson: any) => ({
    ...lesson,
    isCompleted: enrollment?.progress?.some((p: any) => p.lessonId === lesson.id && p.isCompleted) ?? false,
  }));

  const currentLesson = lessons.find((l: any) => l.id === lessonId);

  return { course: { ...course, lessons }, currentLesson, enrollmentId: enrollment?.id };
}

async function markComplete(enrollmentId: string, _lessonId: string) {
  const { data } = await api.patch(`/enrollments/${enrollmentId}/progress`, { isCompleted: true });
  return data;
}

export default function LessonPlayerPage() {
  const { courseSlug, lessonSlug } = useParams() as { courseSlug: string; lessonSlug: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lesson', courseSlug, lessonSlug],
    queryFn: () => fetchLesson(courseSlug, lessonSlug),
  });

  const completeMutation = useMutation({
    mutationFn: () => markComplete(data!.enrollmentId, lessonSlug),
    onSuccess: () => {
      toast.success('Lesson marked as complete!');
      queryClient.invalidateQueries({ queryKey: ['lesson', courseSlug, lessonSlug] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Failed to update progress');
    },
  });

  if (isLoading) return <LoadingSkeleton lines={8} />;
  if (isError) return <ErrorState title="Failed to load lesson" description={error?.message ?? 'Something went wrong'} onRetry={refetch} />;
  if (!data || !data.currentLesson) return <EmptyState title="Lesson not found" />;

  const { course, currentLesson, enrollmentId } = data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/my-courses')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to My Courses
      </Button>

      <div className="space-y-2">
        <h1 className="font-heading text-xl font-bold text-text-primary">{course.title}</h1>
        <h2 className="text-lg text-text-secondary">
          {currentLesson.orderIndex}. {currentLesson.title}
        </h2>
      </div>

      {currentLesson.videoId ? (
        <VideoPlayer
          videoId={currentLesson.videoId}
          onEnded={() => {
            if (!currentLesson.isCompleted && enrollmentId) {
              completeMutation.mutate();
            }
          }}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-background-elevated text-text-muted">
          <span className="text-lg">No video available for this lesson</span>
        </div>
      )}

      {currentLesson.description && (
        <p className="text-text-secondary">{currentLesson.description}</p>
      )}

      {enrollmentId && !currentLesson.isCompleted && (
        <Button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {completeMutation.isPending ? 'Updating...' : 'Mark as Complete'}
        </Button>
      )}

      {currentLesson.isCompleted && (
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Completed</span>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-heading text-lg font-semibold text-text-primary">Course Lessons</h3>
        <div className="space-y-2">
          {course.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isActive={lesson.id === currentLesson.id}
              onClick={() => router.push(`/my-courses/${course.slug}/${lesson.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
