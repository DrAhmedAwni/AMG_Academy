import { z } from 'zod';
import { optionalTrimmedString, paginationQuerySchema, uuidSchema } from '@amg/shared';

export const roleSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9_]+$/, 'Slug must be lowercase snake_case'),
  description: optionalTrimmedString(255),
});

export const updateRoleSchema = roleSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one role field is required',
);

export const roleFiltersSchema = paginationQuerySchema.extend({
  search: optionalTrimmedString(120),
});

export const assignPermissionsSchema = z.object({
  permissionIds: z.array(uuidSchema).default([]),
});

export type CreateRoleDto = z.infer<typeof roleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type RoleFiltersDto = z.infer<typeof roleFiltersSchema>;
export type AssignPermissionsDto = z.infer<typeof assignPermissionsSchema>;
