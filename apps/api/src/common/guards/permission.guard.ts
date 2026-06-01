import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../constants/auth.constants';
import type { JwtPayload } from '@amg/shared';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    if (!user) {
      throw new ForbiddenException('Authentication is required');
    }

    if (user.permissions.includes('*:*') || user.permissions.includes(requiredPermission)) {
      return true;
    }

    throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
  }
}
