import { z } from 'zod';
import {
  dateStringSchema,
  optionalTrimmedString,
  paginationQuerySchema,
  slugSchema,
  uuidSchema,
} from './common.schema';

export const courseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: slugSchema,
  description: z.string().trim().min(20),
  instructorId: uuidSchema,
  categoryId: uuidSchema,
  thumbnailUrl: optionalTrimmedString(500_000),
  price: z.coerce.number().min(0),
});

export const updateCourseSchema = courseSchema.partial().omit({ slug: true });

export const lessonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: optionalTrimmedString(2000),
  courseId: uuidSchema,
  orderIndex: z.coerce.number().int().positive(),
  duration: z.coerce.number().int().nonnegative().default(0),
  videoId: uuidSchema.optional().nullable(),
});

export const updateLessonSchema = lessonSchema.partial().omit({ courseId: true });

export const videoSchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  duration: z.coerce.number().int().nonnegative().default(0),
  mimeType: z.string().optional().nullable(),
});

export const enrollmentSchema = z.object({
  courseId: uuidSchema,
});

export const progressUpdateSchema = z.object({
  lessonId: uuidSchema,
  isCompleted: z.boolean(),
});

export const courseFiltersSchema = paginationQuerySchema.extend({
  search: optionalTrimmedString(120),
  category: optionalTrimmedString(64),
  isFree: z.coerce.boolean().optional(),
  publishedAfter: dateStringSchema.optional(),
});

export const lessonFiltersSchema = paginationQuerySchema.extend({
  courseId: uuidSchema,
});
