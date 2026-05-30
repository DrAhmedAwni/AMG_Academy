import { z } from 'zod';
import { UserStatus } from '../enums/index';
import { optionalTrimmedString, paginationQuerySchema, uuidSchema } from './common.schema';

export const userStatusSchema = z.nativeEnum(UserStatus);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: optionalTrimmedString(32),
  specialty: optionalTrimmedString(100),
  clinic: optionalTrimmedString(100),
  city: optionalTrimmedString(100),
  avatarUrl: optionalTrimmedString(500),
});

export const userFiltersSchema = paginationQuerySchema.extend({
  search: optionalTrimmedString(120),
  role: optionalTrimmedString(64),
  status: z.enum(['active', 'disabled', 'deleted']).optional(),
});

export const assignRoleSchema = z.object({
  userId: uuidSchema,
  roleId: uuidSchema,
});
