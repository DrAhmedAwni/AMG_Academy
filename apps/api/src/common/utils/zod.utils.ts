import { BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';

export function parseWithSchema<T>(schema: ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (result.success) {
    return result.data;
  }

  throw new BadRequestException({
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    details: result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    })),
  });
}
