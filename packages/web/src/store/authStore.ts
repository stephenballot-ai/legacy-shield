'use client';

import { create } from 'zustand';
import type { User } from '@legacy-shield/shared';
import { authApi, isLoginResponse, isTwoFactorResponse } from '@/lib/api/auth';
import { setAccessToken, setOnAuthExpired } from '@/lib/api/client';
import { useCryptoStore } from './cryptoStore';
import { deriveMasterKey } from '@/lib/crypto/keyDerivation';
import { usersApi } from '@/lib/api/users';

// Recover emergency key from server (encrypted with master key)
async function recoverEmergencyKey(masterKey: CryptoKey) {
  try {
    const profile = await usersApi.getMe() as any;
    if (!profile.emergencyKeyEncrypted || !profile.emergencyKeySalt) return;

    const [encB64, ivB64] = profile.emergencyKeyEncrypted.split(':');
    if (!encB64 || !ivB64) return;

    const fromBase64 = (b64: string): ArrayBuffer => {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes.buffer;
    };

    const encBuf = fromBase64(encB64);
    const ivBuf = fromBase64(ivB64);

    const rawKey = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuf) },
      masterKey,
      encBuf
    );

    const emergencyKey = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    useCryptoStore.getState().setEmergencyKey(emergencyKey);
  } catch {
    // Non-critical — emergency key recovery failed, uploads won't include emergency keys
    console.warn('Failed to recover emergency key');
  }
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tempToken: string | null; // for 2FA flow
  salt: string | null;

  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean }>;
  verifyTwoFactor: (code: string, password: string) => Promise<void>;
  register: (email: string, password: string, referralCode?: string) => Promise<{ salt: string }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
}

const persistUser = (user: User | null, salt?: string | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    sessionStorage.setItem('ls_user', JSON.stringify(user));
    if (salt) sessionStorage.setItem('ls_salt', salt);
  } else {
    sessionStorage.removeItem('ls_user');
    sessionStorage.removeItem('ls_salt');
  }
};

const loadSalt = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('ls_salt');
};

const loadUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem('ls_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadUser(),
  isLoading: false,
  isAuthenticated: !!loadUser(),
  tempToken: null,
  salt: loadSalt(),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);

      if (isTwoFactorResponse(res)) {
        set({ tempToken: res.tempToken, isLoading: false });
        return { requiresTwoFactor: true };
      }

      if (isLoginResponse(res)) {
        setAccessToken(res.accessToken);

        // Derive master key from password + salt
        const masterKey = await deriveMasterKey(password, res.salt);
        useCryptoStore.getState().setMasterKey(masterKey);

        persistUser(res.user, res.salt);
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
          salt: res.salt,
          tempToken: null,
        });

        // Recover emergency key in background (non-blocking)
        recoverEmergencyKey(masterKey);

        return { requiresTwoFactor: false };
      }

      throw new Error('Unexpected login response');
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  verifyTwoFactor: async (code, password) => {
    const { tempToken } = get();
    if (!tempToken) throw new Error('No pending 2FA session');

    set({ isLoading: true });
    try {
      const res = await authApi.verifyTwoFactor(code, tempToken);
      setAccessToken(res.accessToken);

      const masterKey = await deriveMasterKey(password, res.salt);
      useCryptoStore.getState().setMasterKey(masterKey);

      persistUser(res.user, res.salt);
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        salt: res.salt,
        tempToken: null,
      });

      // Recover emergency key in background (non-blocking)
      recoverEmergencyKey(masterKey);
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, referralCode?) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(email, password, referralCode);
      set({ isLoading: false, salt: res.salt });
      return { salt: res.salt };
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore - clear local state anyway
    }
    setAccessToken(null);
    useCryptoStore.getState().clearKeys();
    persistUser(null);
    set({ user: null, isAuthenticated: false, tempToken: null, salt: null });
  },

  setUser: (user) => {
    persistUser(user);
    set({ user, isAuthenticated: true });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await authApi.refreshToken();
      setAccessToken(res.accessToken);
      set({ isLoading: false });
    } catch {
      get().clearAuth();
      set({ isLoading: false });
    }
  },

  clearAuth: () => {
    setAccessToken(null);
    useCryptoStore.getState().clearKeys();
    persistUser(null);
    set({ user: null, isAuthenticated: false, tempToken: null, salt: null });
  },
}));

// Auto-logout when token refresh fails
setOnAuthExpired(() => {
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
});
