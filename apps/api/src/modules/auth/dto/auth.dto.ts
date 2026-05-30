import type { z } from 'zod';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSessionSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@amg/shared';

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshSessionDto = z.infer<typeof refreshSessionSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
