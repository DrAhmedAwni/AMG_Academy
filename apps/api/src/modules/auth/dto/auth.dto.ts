import type { z } from 'zod';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  googleCompleteProfileSchema,
  googleMobileAuthSchema,
  loginSchema,
  refreshSessionSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@amg/shared';

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type GoogleAuthDto = z.infer<typeof googleAuthSchema>;
export type GoogleCompleteProfileDto = z.infer<typeof googleCompleteProfileSchema>;
export type GoogleMobileAuthDto = z.infer<typeof googleMobileAuthSchema>;
export type RefreshSessionDto = z.infer<typeof refreshSessionSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
