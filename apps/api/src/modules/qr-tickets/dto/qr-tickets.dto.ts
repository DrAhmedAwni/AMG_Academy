import type { z } from 'zod';
import { qrScanSchema } from '@amg/shared';

export type QrScanDto = z.infer<typeof qrScanSchema>;
