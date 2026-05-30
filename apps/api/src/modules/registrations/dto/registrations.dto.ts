import type { z } from 'zod';
import { registrationActionSchema, registerForEventSchema } from '@amg/shared';

export type RegisterForEventDto = z.infer<typeof registerForEventSchema>;
export type RegistrationActionDto = z.infer<typeof registrationActionSchema>;
