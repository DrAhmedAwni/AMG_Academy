import type { z } from 'zod';
import { eventSchema } from '@amg/shared';

export type CreateEventDto = z.infer<typeof eventSchema>;
export type UpdateEventDto = Partial<CreateEventDto>;
