import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CourseFilters } from './courses.api';
import * as coursesApi from './courses.api';

export const courseQueryKeys = {
  all: ['courses'] as const,
  lists: () => [...courseQueryKeys.all, 'list'] as const,
  list: (filters: CourseFilters) => [...courseQueryKeys.lists(), filters] as const,
  detail: (courseSlug: string) => [...courseQueryKeys.all, 'detail', courseSlug] as const,
  enrollments: ['enrollments', 'mine'] as const,
};

export function useCoursesQuery(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: courseQueryKeys.list(filters),
    queryFn: () => coursesApi.listCourses(filters),
  });
}

export function useCourseQuery(courseSlug: string | undefined) {
  return useQuery({
    queryKey: courseQueryKeys.detail(courseSlug ?? ''),
    queryFn: () => coursesApi.getCourse(courseSlug ?? ''),
    enabled: Boolean(courseSlug),
  });
}

export function useEnrollmentsQuery() {
  return useQuery({
    queryKey: courseQueryKeys.enrollments,
    queryFn: () => coursesApi.listEnrollments(),
  });
}

export function useEnrollInCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => coursesApi.enrollInCourse(courseId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: courseQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: courseQueryKeys.enrollments }),
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['my-courses'] }),
      ]);
    },
  });
}

export function useUpdateProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      lessonId,
      isCompleted,
    }: {
      enrollmentId: string;
      lessonId: string;
      isCompleted: boolean;
    }) => coursesApi.updateLessonProgress(enrollmentId, lessonId, isCompleted),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: courseQueryKeys.enrollments });
    },
  });
}

export const isLessonLocked = coursesApi.isLessonLocked;
export const getEnrollmentPaymentRedirect = coursesApi.getEnrollmentPaymentRedirect;
