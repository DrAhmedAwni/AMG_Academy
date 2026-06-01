import { z } from 'zod';
import { optionalTrimmedString, paginationQuerySchema, uuidSchema } from '@amg/shared';

export const certificateAdminFiltersSchema = paginationQuerySchema.extend({
  search: optionalTrimmedString(120),
  status: optionalTrimmedString(32),
  sourceType: optionalTrimmedString(16),
});

export const certificateReviewSchema = z.object({
  reviewNotes: optionalTrimmedString(1000),
});

export const certificateInvalidationSchema = z.object({
  reason: z.string().trim().min(3).max(1000),
});

export const certificateGenerateSchema = z.object({
  sourceType: z.enum(['event', 'course']),
  userId: uuidSchema,
  eventId: uuidSchema.optional(),
  courseId: uuidSchema.optional(),
}).superRefine((value, ctx) => {
  if (value.sourceType === 'event' && !value.eventId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['eventId'],
      message: 'eventId is required for event certificates',
    });
  }

  if (value.sourceType === 'course' && !value.courseId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['courseId'],
      message: 'courseId is required for course certificates',
    });
  }
});

export type CertificateAdminFiltersDto = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sourceType?: string;
};
export type CertificateReviewDto = z.infer<typeof certificateReviewSchema>;
export type CertificateInvalidationDto = z.infer<typeof certificateInvalidationSchema>;
export type CertificateGenerateDto = z.infer<typeof certificateGenerateSchema>;
