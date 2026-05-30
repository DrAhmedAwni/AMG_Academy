import {
  CourseStatus,
  EnrollmentStatus,
  PaymentStatus,
} from '@amg/shared';
import { apiRequest } from '../../lib/api';
import type { PaginationMeta } from '../../types/api';

export interface ApiPage<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CourseCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface CourseInstructorSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  orderIndex: number;
  videoId: string | null;
}

export interface MobileCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: CourseInstructorSummary;
  category: CourseCategorySummary;
  thumbnailUrl: string | null;
  price: number;
  currency: string;
  isFree: boolean;
  totalDuration: number;
  lessonCount: number;
  enrollmentsCount: number;
  isEnrolled: boolean;
  paymentStatus: PaymentStatus | null;
  paymentId: string | null;
  status: CourseStatus;
  lessons: LessonSummary[];
  createdAt: string;
}

export interface CourseEnrollmentSummary {
  id: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  progressPercent: number;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl: string | null;
    instructor: CourseInstructorSummary;
    category: CourseCategorySummary;
    totalDuration: number;
    lessonCount: number;
  };
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isFree?: boolean;
}

export interface EnrollmentRedirect {
  pathname: '/payments/[paymentId]';
  paymentId: string;
}

function normalizePaymentStatus(value: unknown): PaymentStatus | null {
  return typeof value === 'string' ? (value as PaymentStatus) : null;
}

function normalizeEnrollmentStatus(value: unknown): EnrollmentStatus {
  return (value as EnrollmentStatus) ?? EnrollmentStatus.Active;
}

export function normalizeCourse(raw: MobileCourse): MobileCourse {
  return {
    ...raw,
    price: Number(raw.price),
    isFree: Boolean(raw.isFree ?? Number(raw.price) === 0),
    thumbnailUrl: raw.thumbnailUrl ?? null,
    paymentStatus: normalizePaymentStatus(raw.paymentStatus),
    paymentId: raw.paymentId ?? null,
    lessons: raw.lessons ?? [],
  };
}

export function normalizeEnrollment(raw: CourseEnrollmentSummary): CourseEnrollmentSummary {
  return {
    ...raw,
    status: normalizeEnrollmentStatus(raw.status),
    paymentStatus: normalizePaymentStatus(raw.paymentStatus) ?? PaymentStatus.NotRequired,
    paymentId: raw.paymentId ?? null,
    progressPercent: raw.progressPercent ?? 0,
  };
}

export function getEnrollmentPaymentRedirect(
  enrollment: CourseEnrollmentSummary,
): EnrollmentRedirect | null {
  if (enrollment.paymentId && enrollment.paymentStatus === PaymentStatus.Pending) {
    return {
      pathname: '/payments/[paymentId]',
      paymentId: enrollment.paymentId,
    };
  }
  return null;
}

export function isLessonLocked(
  course: Pick<MobileCourse, 'isFree' | 'isEnrolled' | 'paymentStatus'>,
): boolean {
  if (course.isFree) return false;
  if (!course.isEnrolled) return true;
  if (course.paymentStatus === PaymentStatus.Successful) return false;
  if (course.paymentStatus === PaymentStatus.ManuallyVerified) return false;
  if (course.paymentStatus === PaymentStatus.NotRequired) return false;
  return true;
}

export async function listCourses(filters: CourseFilters = {}) {
  const query: Record<string, string | number | boolean | undefined> = {};
  if (filters.page) query.page = filters.page;
  if (filters.limit) query.limit = filters.limit;
  if (filters.search) query.search = filters.search;
  if (filters.category) query.category = filters.category;
  if (filters.isFree !== undefined) query.isFree = filters.isFree;

  const response = await apiRequest<ApiPage<MobileCourse>>('/courses', {
    method: 'GET',
    query,
  });

  return {
    ...response,
    data: response.data.map(normalizeCourse),
  };
}

export async function getCourse(courseSlug: string) {
  return normalizeCourse(
    await apiRequest<MobileCourse>(`/courses/${encodeURIComponent(courseSlug)}`, {
      method: 'GET',
    }),
  );
}

export async function listEnrollments() {
  const response = await apiRequest<ApiPage<CourseEnrollmentSummary>>('/enrollments', {
    method: 'GET',
  });

  return {
    ...response,
    data: response.data.map(normalizeEnrollment),
  };
}

export async function enrollInCourse(courseId: string) {
  return normalizeEnrollment(
    await apiRequest<CourseEnrollmentSummary>('/enrollments', {
      method: 'POST',
      body: { courseId },
    }),
  );
}

export async function updateLessonProgress(
  enrollmentId: string,
  lessonId: string,
  isCompleted: boolean,
) {
  await apiRequest(`/enrollments/${encodeURIComponent(enrollmentId)}/progress`, {
    method: 'PATCH',
    body: { lessonId, isCompleted },
  });
}
