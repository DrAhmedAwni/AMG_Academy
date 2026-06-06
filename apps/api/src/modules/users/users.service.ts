import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  EnrollmentStatus,
  RegistrationStatus,
  UserStatus as PrismaUserStatus,
  type Prisma,
} from '@prisma/client';
import type { JwtPayload } from '@amg/shared';
import { updateProfileSchema, userFiltersSchema } from '@amg/shared';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { parseWithSchema } from '../../common/utils/zod.utils';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly adminUserUpdateSchema = z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      phone: z.string().trim().max(32).optional(),
      specialty: z.string().trim().max(100).optional(),
      clinic: z.string().trim().max(100).optional(),
      city: z.string().trim().max(100).optional(),
      avatarUrl: z.string().trim().max(500).optional(),
      roleId: z.string().uuid().optional(),
      status: z.enum(['active', 'disabled', 'deleted']).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, 'At least one user field is required');

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      specialty: user.specialty,
      clinic: user.clinic,
      city: user.city,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      role: user.role.slug,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateProfile(userId: string, body: unknown) {
    const input = parseWithSchema(updateProfileSchema, body);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: input,
      include: {
        role: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      specialty: user.specialty,
      clinic: user.clinic,
      city: user.city,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      role: user.role.slug,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async listUsers(query: unknown, currentUser: JwtPayload) {
    if (!currentUser.permissions.includes('*:*') && !currentUser.permissions.includes('users:read')) {
      throw new ForbiddenException('Missing permission: users:read');
    }

    const filters = parseWithSchema(userFiltersSchema, query ?? {});
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 25;
    const statusMap: Record<string, PrismaUserStatus> = {
      active: PrismaUserStatus.ACTIVE,
      disabled: PrismaUserStatus.DISABLED,
      deleted: PrismaUserStatus.DELETED,
    };
    const where: Prisma.UserWhereInput = {
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' as const } },
              { email: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(filters.role ? { role: { slug: filters.role } } : {}),
      ...(filters.status
        ? { status: statusMap[filters.status.toLowerCase()] }
        : { status: { not: PrismaUserStatus.DELETED } }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
          _count: {
            select: {
              registrations: true,
              enrollments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'role' in user && user.role ? user.role.slug : 'user',
        status: user.status.toLowerCase(),
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        hasActivity: user._count.registrations > 0 || user._count.enrollments > 0,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateAdminUser(userId: string, body: unknown, actorId: string) {
    const input = parseWithSchema(this.adminUserUpdateSchema, body);

    if (userId === actorId && input.status && input.status !== 'active') {
      throw new ForbiddenException('You cannot disable your own account');
    }

    const user = await this.ensureUserExists(userId);
    if (input.roleId) {
      await this.ensureRoleExists(input.roleId);
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
        ...(input.specialty !== undefined ? { specialty: input.specialty || null } : {}),
        ...(input.clinic !== undefined ? { clinic: input.clinic || null } : {}),
        ...(input.city !== undefined ? { city: input.city || null } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
        ...(input.roleId ? { roleId: input.roleId } : {}),
        ...(input.status ? { status: this.mapStatus(input.status) } : {}),
      },
      include: {
        role: true,
      },
    });

    return this.mapAdminUser(updated);
  }

  async assignRole(userId: string, roleId: string, actorId: string) {
    if (userId === actorId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    await this.ensureUserExists(userId);
    await this.ensureRoleExists(roleId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: true,
      },
    });

    return this.mapAdminUser(user);
  }

  async disableUser(userId: string, actorId: string) {
    if (userId === actorId) {
      throw new ForbiddenException('You cannot disable your own account');
    }

    await this.ensureUserExists(userId);
    await this.ensureUserCanBeDisabled(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: PrismaUserStatus.DISABLED,
      },
      include: {
        role: true,
      },
    });

    return this.mapAdminUser(user);
  }

  async deleteUser(userId: string, actorId: string) {
    if (userId === actorId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.ensureUserExists(userId);

    const [registrationCount, enrollmentCount, paymentCount] = await this.prisma.$transaction([
      this.prisma.eventRegistration.count({ where: { userId } }),
      this.prisma.courseEnrollment.count({ where: { userId } }),
      this.prisma.payment.count({
        where: {
          OR: [
            { registration: { userId } },
            { enrollment: { userId } },
          ],
        },
      }),
    ]);

    if (registrationCount > 0 || enrollmentCount > 0 || paymentCount > 0) {
      throw new ConflictException(
        'User cannot be deleted because they have existing registrations, enrollments, or payments',
      );
    }

    try {
      await this.prisma.user.delete({ where: { id: userId } });
      return { id: userId, deleted: true };
    } catch {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { status: PrismaUserStatus.DELETED },
        include: { role: true },
      });
      return this.mapAdminUser(user);
    }
  }

  private mapStatus(status: 'active' | 'disabled' | 'deleted') {
    if (status === 'active') {
      return PrismaUserStatus.ACTIVE;
    }
    if (status === 'disabled') {
      return PrismaUserStatus.DISABLED;
    }
    return PrismaUserStatus.DELETED;
  }

  private mapAdminUser(user: {
    id: string;
    name: string;
    email: string;
    status: PrismaUserStatus;
    emailVerified: boolean;
    createdAt: Date;
    role: { slug: string };
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.slug,
      status: user.status.toLowerCase(),
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async ensureRoleExists(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }
  }

  private async ensureUserCanBeDisabled(userId: string) {
    const [activeRegistrations, activeEnrollments] = await this.prisma.$transaction([
      this.prisma.eventRegistration.count({
        where: {
          userId,
          status: {
            in: [RegistrationStatus.PENDING, RegistrationStatus.APPROVED],
          },
        },
      }),
      this.prisma.courseEnrollment.count({
        where: {
          userId,
          status: EnrollmentStatus.ACTIVE,
        },
      }),
    ]);

    if (activeRegistrations > 0 || activeEnrollments > 0) {
      throw new ConflictException(
        'User cannot be disabled while they still have active registrations or enrollments',
      );
    }
  }
}
