import { z } from 'zod';
import {
  dateStringSchema,
  optionalTrimmedString,
  paginationQuerySchema,
  slugSchema,
  uuidSchema,
} from './common.schema';

const eventBaseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: slugSchema,
  description: z.string().trim().min(20),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  location: z.string().trim().min(2).max(160),
  price: z.coerce.number().min(0),
  capacity: z.coerce.number().int().positive(),
  registrationDeadline: dateStringSchema.optional().nullable(),
  categoryId: uuidSchema,
  thumbnailUrl: optionalTrimmedString(500_000),
});

export const eventSchema = eventBaseSchema
  .refine((value) => new Date(value.endDate) > new Date(value.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine(
    (value) =>
      !value.registrationDeadline ||
      new Date(value.registrationDeadline) < new Date(value.startDate),
    {
      message: 'Registration deadline must be before event start date',
      path: ['registrationDeadline'],
    },
  );

export const updateEventSchema = eventBaseSchema.partial();

export const eventFiltersSchema = paginationQuerySchema.extend({
  search: optionalTrimmedString(120),
  category: optionalTrimmedString(64),
  status: optionalTrimmedString(32),
  isFree: z.coerce.boolean().optional(),
  startDateFrom: dateStringSchema.optional(),
  startDateTo: dateStringSchema.optional(),
});

export const eventCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  description: optionalTrimmedString(500),
});

export const registerForEventSchema = z.object({
  eventId: uuidSchema,
});

export const registrationActionSchema = z.object({
  adminNotes: optionalTrimmedString(1000),
});

export const registrationFiltersSchema = paginationQuerySchema.extend({
  status: optionalTrimmedString(32),
  eventId: uuidSchema.optional(),
});

export const qrScanSchema = z.object({
  token: z.string().trim().min(8).max(256),
  eventId: uuidSchema,
});

export const qrTicketFiltersSchema = paginationQuerySchema.extend({
  status: optionalTrimmedString(32),
  eventId: uuidSchema.optional(),
});

export const paymentFiltersSchema = paginationQuerySchema.extend({
  status: optionalTrimmedString(32),
  provider: optionalTrimmedString(32),
});

export const attendanceFiltersSchema = paginationQuerySchema.extend({
  eventId: uuidSchema.optional(),
  scannerId: uuidSchema.optional(),
});
