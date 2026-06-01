import type { z } from 'zod';
import { manualPaymentVerificationSchema } from '@amg/shared';

export type ManualPaymentVerificationDto = z.infer<typeof manualPaymentVerificationSchema>;
