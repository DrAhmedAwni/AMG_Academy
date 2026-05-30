import type { z } from 'zod';
import { eventCategorySchema } from '@amg/shared';

export type CreateEventCategoryDto = z.infer<typeof eventCategorySchema>;
export type UpdateEventCategoryDto = Partial<CreateEventCategoryDto>;
