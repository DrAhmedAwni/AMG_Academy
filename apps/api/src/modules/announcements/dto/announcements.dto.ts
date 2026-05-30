import { z } from 'zod';
import { optionalTrimmedString, paginationQuerySchema } from '@amg/shared';

export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10).max(5000),
  targetRoles: z.array(z.string().trim().min(1).max(64)).default([]),
});

export const updateAnnouncementSchema = announcementSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one announcement field is required',
);

export const announcementFiltersSchema = paginationQuerySchema.extend({
  search: optionalTrimmedString(120),
  status: optionalTrimmedString(32),
});

export type AnnouncementDto = z.infer<typeof announcementSchema>;
export type UpdateAnnouncementDto = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementFiltersDto = z.infer<typeof announcementFiltersSchema>;
