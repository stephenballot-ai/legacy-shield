/**
 * User-related types
 */

export type UserTier = 'FREE' | 'PRO';

export type SessionType = 'OWNER' | 'EMERGENCY_CONTACT';

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface Session {
  id: string;
  userId: string;
  sessionType: SessionType;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
