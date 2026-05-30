import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = unknown>(
    _error: unknown,
    user: TUser | false | null,
    _info: unknown,
    _context: ExecutionContext,
  ): TUser {
    return (user || null) as TUser;
  }
}
