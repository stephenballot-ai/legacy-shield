import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { validate, registerSchema, loginSchema, twoFactorSchema, verifyEmailSchema, changePasswordSchema, recoveryCodeSchema } from '../middleware/validation';
import { loginLimiter } from '../middleware/rateLimit';
import { authenticate, requireOwner } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import {
  hashPassword,
  verifyPassword,
  generateSalt,
  generateAccessToken,
  generateRefreshToken,
  generateTempToken,
  verifyToken,
  createSession,
  invalidateSession,
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
  generateRecoveryCodes,
  verifyRecoveryCode,
  generateEmailVerificationToken,
  logAudit,
  type TokenPayload,
  type TempTokenPayload,
} from '../services/auth';
import { sendWelcomeChecklistEmail } from '../lib/email';

const router = Router();

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex'); // 8 alphanumeric chars
}

// ============================================================================
// POST /auth/register
// ============================================================================
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, referralCode: refCode } = req.body as { email: string; password: string; referralCode?: string };

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        error: { code: 'RESOURCE_ALREADY_EXISTS', message: 'An account with this email already exists' },
      });
      return;
    }

    // Look up referrer if referral code provided
    let referredBy: string | undefined;
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const passwordHash = await hashPassword(password);
    const keyDerivationSalt = generateSalt();
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        keyDerivationSalt: keyDerivationSalt,
        referralCode: generateReferralCode(),
        referredBy: referredBy ?? null,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'ACCOUNT_CREATED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Send welcome checklist email (fire-and-forget)
    sendWelcomeChecklistEmail({
      ownerEmail: user.email,
    }).catch((err) => logger.error('[email] Welcome checklist email failed:', err));

    // Send verification email
    // TODO: Wire to actual Resend template
    logger.info(`Verification link for ${user.email}: ${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`);

    res.status(201).json({
      userId: user.id,
      salt: keyDerivationSalt,
      message: 'Verification email sent',
    });
  } catch (err) {
    logger.error('Registration failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed' },
    });
  }
});

// ============================================================================
// POST /auth/verify-email
// ============================================================================
router.post('/verify-email', validate(verifyEmailSchema), async (req: Request, res: Response) => {
  try {
    const { token } = req.body as { token: string };

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid or expired verification token' },
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'EMAIL_VERIFIED' as any,
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('Email verification failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Email verification failed' },
    });
  }
});

// ============================================================================
// POST /auth/login
// ============================================================================
router.post('/login', loginLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await logAudit({
        userId: user.id,
        action: 'LOGIN_FAILED',
        resourceType: 'user',
        resourceId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
      return;
    }

    // If 2FA is enabled, return a temp token and require 2FA code
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const tempToken = generateTempToken(user.id);
      res.json({
        requiresTwoFactor: true,
        tempToken,
      });
      return;
    }

    // No 2FA — create session directly
    const { accessToken, refreshToken } = await createSession(user.id, 'OWNER', req);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (!user.keyDerivationSalt) {
      res.status(500).json({
        error: { code: 'ACCOUNT_CORRUPTED', message: 'Account key derivation salt is missing. Please contact support.' },
      });
      return;
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      salt: user.keyDerivationSalt,
    });
  } catch (err) {
    logger.error('Login failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' },
    });
  }
});

// ============================================================================
// POST /auth/login/2fa
// ============================================================================
router.post('/login/2fa', loginLimiter, validate(twoFactorSchema), async (req: Request, res: Response) => {
  try {
    const { code, tempToken } = req.body as { code: string; tempToken: string };

    let tempPayload: TempTokenPayload;
    try {
      tempPayload = verifyToken<TempTokenPayload>(tempToken);
    } catch {
      res.status(401).json({
        error: { code: 'SESSION_EXPIRED', message: 'Two-factor session expired. Please login again.' },
      });
      return;
    }

    if (tempPayload.type !== 'two_factor_pending') {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: tempPayload.userId } });
    if (!user || !user.twoFactorSecret) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'User not found' },
      });
      return;
    }

    const valid = verifyTOTP(user.twoFactorSecret, code);
    if (!valid) {
      res.status(401).json({
        error: { code: 'INVALID_TWO_FACTOR_CODE', message: 'Invalid two-factor code' },
      });
      return;
    }

    const { accessToken, refreshToken } = await createSession(user.id, 'OWNER', req);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { twoFactor: true },
    });

    if (!user.keyDerivationSalt) {
      res.status(500).json({
        error: { code: 'ACCOUNT_CORRUPTED', message: 'Account key derivation salt is missing. Please contact support.' },
      });
      return;
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      salt: user.keyDerivationSalt,
    });
  } catch (err) {
    logger.error('2FA verification failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '2FA verification failed' },
    });
  }
});

// ============================================================================
// POST /auth/logout
// ============================================================================
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    await invalidateSession(req.user!.sessionId);

    await logAudit({
      userId: req.user!.userId,
      action: 'LOGOUT',
      resourceType: 'user',
      resourceId: req.user!.userId,
      sessionType: req.user!.sessionType,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (err) {
    logger.error('Logout failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Logout failed' },
    });
  }
});

// ============================================================================
// POST /auth/refresh
// ============================================================================
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' },
      });
      return;
    }

    let payload: TokenPayload;
    try {
      payload = verifyToken<TokenPayload>(token);
    } catch {
      res.status(401).json({
        error: { code: 'SESSION_EXPIRED', message: 'Refresh token expired' },
      });
      return;
    }

    if (payload.type !== 'refresh') {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid token type' },
      });
      return;
    }

    // Verify session still valid
    const session = await prisma.session.findUnique({ where: { id: payload.sessionId } });
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({
        error: { code: 'SESSION_EXPIRED', message: 'Session expired' },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not found' },
      });
      return;
    }

    const tokenPayload = {
      userId: payload.userId,
      sessionId: payload.sessionId,
      sessionType: payload.sessionType,
      tier: user.tier,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    logger.error('Token refresh failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Token refresh failed' },
    });
  }
});

// ============================================================================
// POST /auth/password/change
// ============================================================================
router.post('/password/change', authenticate, requireOwner, validate(changePasswordSchema), async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, reencryptedKeys } = req.body as {
      currentPassword: string;
      newPassword: string;
      reencryptedKeys?: Array<{ fileId: string; ownerEncryptedKey: string; ownerIV: string }>;
    };

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' },
      });
      return;
    }

    // Verify re-encrypted keys cover all user files (if any files exist)
    const { newEmergencyKeyEncrypted } = req.body as { newEmergencyKeyEncrypted?: string };
    const fileCount = await prisma.file.count({ where: { userId: user.id, deletedAt: null } });
    if (fileCount > 0 && (!reencryptedKeys || reencryptedKeys.length !== fileCount)) {
      res.status(400).json({
        error: {
          code: 'INCOMPLETE_REENCRYPTION',
          message: `Expected ${fileCount} re-encrypted file keys but received ${reencryptedKeys?.length ?? 0}. Aborting to prevent data loss.`,
        },
      });
      return;
    }

    // Abort if emergency key exists but wasn't re-encrypted
    if (user.emergencyKeyEncrypted && !newEmergencyKeyEncrypted) {
      res.status(400).json({
        error: {
          code: 'MISSING_EMERGENCY_KEY',
          message: 'Emergency key must be re-encrypted when changing password.',
        },
      });
      return;
    }

    // Update everything in a single transaction
    const newHash = await hashPassword(newPassword);
    await prisma.$transaction(async (tx) => {
      // Update password hash
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          ...(newEmergencyKeyEncrypted && user.emergencyKeyEncrypted
            ? { emergencyKeyEncrypted: newEmergencyKeyEncrypted }
            : {}),
        },
      });

      // Update re-encrypted file keys
      if (reencryptedKeys && reencryptedKeys.length > 0) {
        for (const rk of reencryptedKeys) {
          await tx.file.updateMany({
            where: { id: rk.fileId, userId: user.id },
            data: { ownerEncryptedKey: rk.ownerEncryptedKey, ownerIV: rk.ownerIV },
          });
        }
      }
    });

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_CHANGE',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { filesReencrypted: reencryptedKeys?.length ?? 0 },
    });

    res.json({ success: true, salt: user.keyDerivationSalt });
  } catch (err) {
    logger.error('Password change failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Password change failed' },
    });
  }
});

// ============================================================================
// POST /auth/2fa/setup — Generate TOTP secret + QR code
// ============================================================================
router.post('/2fa/setup', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    const { secret, otpauthUrl } = generateTOTPSecret(user.email);
    const qrCode = await generateQRCode(otpauthUrl);

    // Store secret temporarily (not enabled yet until user confirms with a valid code).
    // If user already had 2FA enabled, don't overwrite the active secret.
    if (user.twoFactorEnabled) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: '2FA is already enabled. Disable it first to reconfigure.' },
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    res.json({ secret, qrCode });
  } catch (err) {
    logger.error('2FA setup failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '2FA setup failed' },
    });
  }
});

// ============================================================================
// POST /auth/2fa/confirm — Verify initial code and enable 2FA
// ============================================================================
router.post('/2fa/confirm', authenticate, requireOwner, validate(twoFactorSchema.pick({ code: true })), async (req: Request, res: Response) => {
  try {
    const { code } = req.body as { code: string };

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user || !user.twoFactorSecret) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Please initiate 2FA setup first' },
      });
      return;
    }

    const valid = verifyTOTP(user.twoFactorSecret, code);
    if (!valid) {
      res.status(401).json({
        error: { code: 'INVALID_TWO_FACTOR_CODE', message: 'Invalid code. Please try again.' },
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    await logAudit({
      userId: user.id,
      action: 'TWO_FACTOR_ENABLED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('2FA confirmation failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '2FA confirmation failed' },
    });
  }
});

// ============================================================================
// POST /auth/2fa/disable — Disable 2FA and clear secret
// ============================================================================
router.post('/2fa/disable', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const { password } = req.body as { password: string };
    if (!password) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Password is required to disable 2FA' },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({
        error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' },
      });
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect password' },
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    await logAudit({
      userId: user.id,
      action: 'TWO_FACTOR_DISABLED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('2FA disable failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '2FA disable failed' },
    });
  }
});

// ============================================================================
// POST /auth/recovery/generate-codes
// ============================================================================
router.post('/recovery/generate-codes', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const { plainCodes, hashedCodes } = await generateRecoveryCodes();

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { recoveryCodes: hashedCodes },
    });

    res.json({ recoveryCodes: plainCodes });
  } catch (err) {
    logger.error('Recovery code generation failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Recovery code generation failed' },
    });
  }
});

// ============================================================================
// POST /auth/recovery/use-code
// ============================================================================
router.post('/recovery/use-code', loginLimiter, validate(recoveryCodeSchema), async (req: Request, res: Response) => {
  try {
    const { code, email } = req.body as { code: string; email: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.recoveryCodes.length === 0) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid recovery code' },
      });
      return;
    }

    const { valid, remainingCodes } = await verifyRecoveryCode(
      code.toUpperCase(),
      user.recoveryCodes
    );

    if (!valid) {
      res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid recovery code' },
      });
      return;
    }

    // Remove used code
    await prisma.user.update({
      where: { id: user.id },
      data: { recoveryCodes: remainingCodes },
    });

    const { accessToken, refreshToken } = await createSession(user.id, 'OWNER', req);

    await logAudit({
      userId: user.id,
      action: 'RECOVERY_CODE_USED',
      resourceType: 'user',
      resourceId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier,
      },
    });
  } catch (err) {
    logger.error('Recovery code validation failed:', err);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Recovery code validation failed' },
    });
  }
});

export default router;
