import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AssignPermissionsDto,
  CreateRoleDto,
  RoleFiltersDto,
  UpdateRoleDto,
} from './dto/roles.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: RoleFiltersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const where: Prisma.RoleWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      items: items.map((role) => ({
        id: role.id,
        name: role.name,
        slug: role.slug,
        description: role.description,
        permissions: role.permissions.map((entry) => ({
          id: entry.permission.id,
          module: entry.permission.module,
          action: entry.permission.action,
        })),
        usersCount: role._count.users,
        createdAt: role.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      permissions: role.permissions.map((entry) => ({
        id: entry.permission.id,
        module: entry.permission.module,
        action: entry.permission.action,
        description: entry.permission.description,
      })),
      createdAt: role.createdAt.toISOString(),
    };
  }

  async create(input: CreateRoleDto) {
    const existing = await this.prisma.role.findFirst({
      where: {
        OR: [{ name: input.name }, { slug: input.slug }],
      },
    });

    if (existing) {
      throw new ConflictException('A role with that name or slug already exists');
    }

    const role = await this.prisma.role.create({
      data: input,
    });

    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      createdAt: role.createdAt.toISOString(),
    };
  }

  async update(roleId: string, input: UpdateRoleDto) {
    await this.ensureRoleExists(roleId);

    if (input.slug || input.name) {
      const existing = await this.prisma.role.findFirst({
        where: {
          id: { not: roleId },
          OR: [
            ...(input.name ? [{ name: input.name }] : []),
            ...(input.slug ? [{ slug: input.slug }] : []),
          ],
        },
      });

      if (existing) {
        throw new ConflictException('A role with that name or slug already exists');
      }
    }

    const role = await this.prisma.role.update({
      where: { id: roleId },
      data: input,
    });

    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      createdAt: role.createdAt.toISOString(),
    };
  }

  async assignPermissions(roleId: string, input: AssignPermissionsDto) {
    await this.ensureRoleExists(roleId);

    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: input.permissionIds },
      },
    });

    if (permissions.length !== input.permissionIds.length) {
      throw new NotFoundException('One or more permissions were not found');
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId },
      }),
      ...input.permissionIds.map((permissionId) =>
        this.prisma.rolePermission.create({
          data: {
            roleId,
            permissionId,
          },
        }),
      ),
    ]);

    return this.findOne(roleId);
  }

  async remove(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role._count.users > 0) {
      throw new ConflictException('Cannot delete a role that is assigned to users');
    }

    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });
    await this.prisma.role.delete({
      where: { id: roleId },
    });

    return null;
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
}
