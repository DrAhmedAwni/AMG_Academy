import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export const optionalTrimmedString = (max = 255) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

export const dateStringSchema = z.string().datetime();
