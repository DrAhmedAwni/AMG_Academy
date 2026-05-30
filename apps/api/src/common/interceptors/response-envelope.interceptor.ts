import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, { success: true; data: T | null }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ success: true; data: T | null }> {
    if (context.getType() !== 'http') {
      return next.handle() as Observable<{ success: true; data: T | null }>;
    }

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in (data as Record<string, unknown>)) {
          return data as unknown as { success: true; data: T | null };
        }

        return {
          success: true,
          data: data ?? null,
        };
      }),
    );
  }
}
