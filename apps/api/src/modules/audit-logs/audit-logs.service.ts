import { Injectable } from '@nestjs/common';
import type { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditLogFiltersDto } from './dto/audit-logs.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AuditLogFiltersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const where: Prisma.AuditLogWhereInput = {
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.action ? { action: query.action.toUpperCase() as AuditAction } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((log) => ({
        id: log.id,
        actor: log.actor,
        action: log.action.toLowerCase(),
        entityType: log.entityType,
        entityId: log.entityId,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
