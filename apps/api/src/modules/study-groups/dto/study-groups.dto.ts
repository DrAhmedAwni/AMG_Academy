import { z } from 'zod';
import { optionalTrimmedString, uuidSchema } from '@amg/shared';

export const createStudyGroupSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalTrimmedString(2000),
  type: z.enum(['STUDENT', 'INSTRUCTOR_LED']),
  joinMode: z.enum(['OPEN', 'REQUEST', 'INVITE_ONLY']).optional(),
  courseId: uuidSchema.optional(),
});

export const updateStudyGroupSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: optionalTrimmedString(2000),
  type: z.enum(['STUDENT', 'INSTRUCTOR_LED']).optional(),
  joinMode: z.enum(['OPEN', 'REQUEST', 'INVITE_ONLY']).optional(),
  courseId: uuidSchema.optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(10000),
});

export const uploadFileSchema = z.object({
  fileName: z.string().trim().min(1).max(500),
  mimeType: z.string().trim().min(1).max(200),
  sizeBytes: z.number().int().nonnegative(),
  storageKey: z.string().trim().min(1).max(1000),
});

export const createSessionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  location: optionalTrimmedString(500),
  onlineUrlNote: optionalTrimmedString(1000),
});

export type CreateStudyGroupDto = z.infer<typeof createStudyGroupSchema>;
export type UpdateStudyGroupDto = z.infer<typeof updateStudyGroupSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type UploadFileDto = z.infer<typeof uploadFileSchema>;
export type CreateSessionDto = z.infer<typeof createSessionSchema>;
