import { z } from 'zod';
import { PaymentStatus } from '../enums/index';
import { optionalTrimmedString, uuidSchema } from './common.schema';

export const paymentStatusSchema = z.nativeEnum(PaymentStatus);

export const createPaymentSchema = z
  .object({
    registrationId: uuidSchema.optional(),
    enrollmentId: uuidSchema.optional(),
    amount: z.coerce.number().positive(),
    currency: z.string().trim().length(3).default('EGP'),
    provider: z.string().trim().min(2).max(32).default('manual'),
    providerRef: optionalTrimmedString(120),
  })
  .refine((value) => Boolean(value.registrationId || value.enrollmentId), {
    message: 'A payment must reference either a registration or an enrollment',
    path: ['registrationId'],
  });

export const manualPaymentVerificationSchema = z.object({
  paymentId: uuidSchema,
  receiptRef: optionalTrimmedString(120),
  status: paymentStatusSchema,
});
