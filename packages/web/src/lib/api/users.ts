import { api } from './client';

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  bonusDocs: number;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: 'FREE' | 'PRO';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  referralCode: string;
  referralBonus: number;
  keyDerivationSalt: string;
  emergencyKeyEncrypted: string | null;
  emergencyKeySalt: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  documentCount: number;
  emergencyContactCount: number;
  documentLimit: number;
  emergencyContactLimit: number;
  subscription: {
    tier: 'FREE' | 'PRO';
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    lifetimePurchase: boolean;
    lifetimePurchaseDate: string | null;
    subscriptionEndsAt: string | null;
  };
}

export const usersApi = {
  getMe: () => api.get<UserProfile>('/users/me'),

  getReferrals: () => api.get<ReferralInfo>('/users/referrals'),

  updateMe: (data: { email: string }) =>
    api.patch<{ id: string; email: string; tier: string }>('/users/me', data),

  trackUpgradeIntent: () => api.post<{ success: boolean }>('/users/intent/upgrade', {}),
};

// Override delete to send body
export async function deleteAccount(password: string, confirmation: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const { getAccessToken } = await import('./client');
  const token = getAccessToken();

  const res = await fetch(`${BASE_URL}/users/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ password, confirmation }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || 'Failed to delete account');
  }
  return res.json();
}
