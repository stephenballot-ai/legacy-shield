import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character');

const emailSchema = z.string().email('Invalid email address').toLowerCase();

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const twoFactorSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
  tempToken: z.string().min(1, 'Temporary token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const recoveryCodeSchema = z.object({
  code: z.string().min(1, 'Recovery code is required'),
  email: emailSchema,
});

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

export function validate<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR' as const,
          message: firstError.message,
          field: firstError.path.join('.'),
          details: result.error.errors,
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
