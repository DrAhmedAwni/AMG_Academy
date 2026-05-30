import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, mergeMap, Observable, switchMap } from 'rxjs';
import { AUDIT_LOG_KEY } from '../constants/auth.constants';
import type { AuditLogMetadata } from '../decorators/audit-log.decorator';
import { PrismaService } from '../../modules/prisma/prisma.service';

type PrismaDelegate = {
  findUnique?: (args: { where: { id: string } }) => Promise<unknown>;
};

type AuditRequest = {
  user?: {
    sub?: string;
    id?: string;
  };
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.getAllAndOverride<AuditLogMetadata | undefined>(AUDIT_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!metadata || context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuditRequest>();
    const entityId = this.resolveEntityId(request);

    return from(this.fetchOldValue(metadata.entityType, entityId)).pipe(
      switchMap((oldValue) =>
        next.handle().pipe(
          mergeMap(async (result) => {
            const actorId = request.user?.sub ?? request.user?.id;
            if (!actorId) {
              return result;
            }

            const resultRecord =
              result && typeof result === 'object'
                ? (result as Record<string, unknown>)
                : undefined;
            const resolvedEntityId = resultRecord?.id ?? entityId ?? 'unknown';
            const userAgentHeader = request.headers?.['user-agent'];
            const userAgent = Array.isArray(userAgentHeader)
              ? userAgentHeader[0] ?? null
              : userAgentHeader ?? null;

            try {
              await this.prisma.auditLog.create({
                data: {
                  actorId,
                  action: metadata.action as never,
                  entityType: metadata.entityType,
                  entityId: String(resolvedEntityId),
                  oldValue: oldValue ? JSON.stringify(oldValue) : null,
                  newValue: result ? JSON.stringify(result) : null,
                  ipAddress: request.ip ?? null,
                  userAgent,
                },
              });
            } catch (error) {
              this.logger.warn(
                `Audit log write failed for ${metadata.action} on ${metadata.entityType}: ${(error as Error).message}`,
              );
            }

            return result;
          }),
        ),
      ),
    );
  }

  private resolveEntityId(request: AuditRequest) {
    if (typeof request.params?.id === 'string') {
      return request.params.id;
    }

    if (typeof request.body?.id === 'string') {
      return request.body.id;
    }

    return undefined;
  }

  private async fetchOldValue(entityType: string, entityId?: string) {
    if (!entityId) {
      return null;
    }

    const delegateName = this.getDelegateName(entityType);
    if (!delegateName) {
      return null;
    }

    const delegate = (this.prisma as unknown as Record<string, PrismaDelegate | undefined>)[
      delegateName
    ];
    if (!delegate?.findUnique) {
      return null;
    }

    return delegate.findUnique({ where: { id: entityId } });
  }

  private getDelegateName(entityType: string) {
    const delegateMap: Record<string, string> = {
      User: 'user',
      Role: 'role',
      Permission: 'permission',
      RolePermission: 'rolePermission',
      Event: 'event',
      EventCategory: 'eventCategory',
      EventRegistration: 'eventRegistration',
      Payment: 'payment',
      QRTicket: 'qrTicket',
      AttendanceCheckIn: 'attendanceCheckIn',
      Course: 'course',
      CourseCategory: 'courseCategory',
      Lesson: 'lesson',
      Video: 'video',
      CourseEnrollment: 'courseEnrollment',
      LessonProgress: 'lessonProgress',
      Announcement: 'announcement',
      Notification: 'notification',
      StaticContentPage: 'staticContentPage',
      AuditLog: 'auditLog',
    };

    return delegateMap[entityType];
  }
}
