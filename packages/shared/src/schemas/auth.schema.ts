import { z } from 'zod';
import { optionalTrimmedString } from './common.schema';

export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: passwordSchema,
  phone: optionalTrimmedString(32),
  specialty: optionalTrimmedString(100),
  clinic: optionalTrimmedString(100),
  city: optionalTrimmedString(100),
  professionalTitle: optionalTrimmedString(100),
  practiceType: optionalTrimmedString(100),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  client: z.enum(['web', 'mobile']).optional(),
});

export const googleMobileAuthSchema = z.object({
  idToken: z.string().min(10),
  client: z.literal('mobile').optional(),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(10),
  client: z.enum(['web', 'mobile']).optional(),
});

const requiredProfileString = (max = 120) => z.string().trim().min(1).max(max);

export const googleCompleteProfileSchema = z.object({
  idToken: z.string().min(10),
  client: z.enum(['web', 'mobile']).optional(),
  name: z.string().trim().min(2).max(120),
  phone: requiredProfileString(32),
  specialty: requiredProfileString(100),
  clinic: requiredProfileString(100),
  city: requiredProfileString(100),
  professionalTitle: optionalTrimmedString(100),
  practiceType: optionalTrimmedString(100),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(10).optional(),
  client: z.enum(['web', 'mobile']).optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});
