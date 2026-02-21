import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import type { SessionType } from '@prisma/client';

// ============================================================================
// CONSTANTS
// ============================================================================

const BCRYPT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';
const RECOVERY_CODE_COUNT = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}

// ============================================================================
// JWT TOKEN PAYLOAD
// ============================================================================

export interface TokenPayload {
  userId: string;
  sessionId: string;
  sessionType: SessionType;
  tier: string;
  type: 'access' | 'refresh';
}

export interface TempTokenPayload {
  userId: string;
  type: 'two_factor_pending';
}

// ============================================================================
// PASSWORD OPERATIONS
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// SALT GENERATION (for client-side key derivation)
// ============================================================================

export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================================================
// JWT OPERATIONS
// ============================================================================

export function generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, getJwtSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function generateTempToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'two_factor_pending' } satisfies TempTokenPayload,
    getJwtSecret(),
    { expiresIn: '5m' }
  );
}

export function verifyToken<T = TokenPayload>(token: string): T {
  return jwt.verify(token, getJwtSecret()) as T;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function createSession(
  userId: string,
  sessionType: SessionType,
  req: { ip?: string; headers: Record<string, string | string[] | undefined> }
): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session = await prisma.session.create({
    data: {
      userId,
      sessionType,
      token: crypto.randomBytes(48).toString('hex'),
      userAgent: (req.headers['user-agent'] as string) ?? null,
      ipAddress: req.ip ?? null,
      expiresAt,
    },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const tokenPayload = {
    userId,
    sessionId: session.id,
    sessionType,
    tier: user.tier,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { accessToken, refreshToken, sessionId: session.id };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
    // Session may already be deleted
  });
}

export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION (TOTP)
// ============================================================================

export function generateTOTPSecret(email: string): {
  secret: string;
  otpauthUrl: string;
} {
  const result = speakeasy.generateSecret({
    name: `LegacyShield (${email})`,
    issuer: 'LegacyShield',
    length: 20,
  });
  return {
    secret: result.base32,
    otpauthUrl: result.otpauth_url ?? '',
  };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTOTP(secret: string, code: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 1, // Allow 1 step tolerance (30 seconds)
  });
}

// ============================================================================
// RECOVERY CODES
// ============================================================================

export async function generateRecoveryCodes(): Promise<{
  plainCodes: string[];
  hashedCodes: string[];
}> {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const code = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 char hex code
    plainCodes.push(code);
    const hashed = await bcrypt.hash(code, BCRYPT_ROUNDS);
    hashedCodes.push(hashed);
  }

  return { plainCodes, hashedCodes };
}

export async function verifyRecoveryCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; remainingCodes: string[] }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const match = await bcrypt.compare(code, hashedCodes[i]);
    if (match) {
      const remainingCodes = [...hashedCodes];
      remainingCodes.splice(i, 1);
      return { valid: true, remainingCodes };
    }
  }
  return { valid: false, remainingCodes: hashedCodes };
}

// ============================================================================
// EMAIL VERIFICATION TOKEN
// ============================================================================

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================================================
// AUDIT LOGGING (stub - to be implemented later)
// ============================================================================

export async function logAudit(params: {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  sessionType?: SessionType;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action as never,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        sessionType: params.sessionType ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        metadata: params.metadata
          ? (params.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (err) {
    // Audit logging should never break the main flow
    logger.error({ message: 'Failed to write audit log', error: err });
  }
}
