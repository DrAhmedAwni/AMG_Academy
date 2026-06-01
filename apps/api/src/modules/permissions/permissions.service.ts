import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    return permissions.map((permission) => ({
      id: permission.id,
      module: permission.module,
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt.toISOString(),
    }));
  }
}
