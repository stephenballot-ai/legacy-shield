/**
 * Auth API functions
 */

import type { User } from '@legacy-shield/shared';
import { api } from './client';

interface LoginResponse {
  accessToken: string;
  user: User;
  salt: string;
}

interface TwoFactorLoginResponse {
  requiresTwoFactor: true;
  tempToken: string;
}

interface RegisterResponse {
  userId: string;
  salt: string;
  message: string;
}

interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export const authApi = {
  register: (email: string, password: string) =>
    api.post<RegisterResponse>('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post<LoginResponse | TwoFactorLoginResponse>('/auth/login', { email, password }),

  verifyTwoFactor: (code: string, tempToken: string) =>
    api.post<LoginResponse>('/auth/login/2fa', { code, tempToken }),

  verifyEmail: (token: string) =>
    api.post<{ success: boolean }>('/auth/verify-email', { token }),

  logout: () => api.post<{ success: boolean }>('/auth/logout'),

  refreshToken: () => api.post<{ accessToken: string }>('/auth/refresh'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<{ success: boolean }>('/auth/password/change', { currentPassword, newPassword }),

  setup2FA: () => api.post<Setup2FAResponse>('/auth/2fa/setup'),

  confirm2FA: (code: string) =>
    api.post<{ success: boolean }>('/auth/2fa/confirm', { code }),

  generateRecoveryCodes: () =>
    api.post<{ recoveryCodes: string[] }>('/auth/recovery/generate-codes'),

  useRecoveryCode: (code: string, email: string) =>
    api.post<LoginResponse>('/auth/recovery/use-code', { code, email }),
};

export function isLoginResponse(res: LoginResponse | TwoFactorLoginResponse): res is LoginResponse {
  return 'accessToken' in res;
}

export function isTwoFactorResponse(res: LoginResponse | TwoFactorLoginResponse): res is TwoFactorLoginResponse {
  return 'requiresTwoFactor' in res && res.requiresTwoFactor === true;
}
