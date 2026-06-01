import type { z } from 'zod';
import { uuidSchema } from '@amg/shared';

export type AttendanceQueryDto = z.infer<typeof uuidSchema>;
