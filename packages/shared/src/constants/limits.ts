/**
 * Application-wide limits and constants
 */

export const DOCUMENT_LIMITS = {
  FREE_TIER: 3,
  PRO_TIER: 100,
} as const;

export const REFERRAL_BONUS_DOCS = 5;
export const MAX_FREE_DOCS = 25;

export const EMERGENCY_CONTACT_LIMITS = {
  FREE_TIER: 1,
  PRO_TIER: 5,
} as const;

export const FILE_SIZE_LIMITS = {
  FREE_TIER: 5 * 1024 * 1024, // 5MB
  PRO_TIER: 10 * 1024 * 1024, // 10MB
} as const;

export const PRICING = {
  MONTHLY: 10, // USD
  LIFETIME: 500, // USD
} as const;

export const DATA_RESIDENCY = {
  REGION: 'EU',
  COUNTRY: 'Germany',
  PROVIDER: 'Hetzner',
} as const;
