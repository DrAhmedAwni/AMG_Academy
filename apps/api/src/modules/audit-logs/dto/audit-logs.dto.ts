import { z } from 'zod';
import { optionalTrimmedString, paginationQuerySchema } from '@amg/shared';

export const auditLogFiltersSchema = paginationQuerySchema.extend({
  actorId: optionalTrimmedString(64),
  action: optionalTrimmedString(64),
  entityType: optionalTrimmedString(64),
});

export type AuditLogFiltersDto = z.infer<typeof auditLogFiltersSchema>;
