import { SetMetadata } from '@nestjs/common';
import { AUDIT_LOG_KEY } from '../constants/auth.constants';

export interface AuditLogMetadata {
  action: string;
  entityType: string;
}

export const AuditLog = (action: string, entityType: string) =>
  SetMetadata(AUDIT_LOG_KEY, { action, entityType } satisfies AuditLogMetadata);
