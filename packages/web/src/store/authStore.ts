'use client';

import { create } from 'zustand';
import type { User } from '@legacy-shield/shared';
import { authApi, isLoginResponse, isTwoFactorResponse } from '@/lib/api/auth';
import { setAccessToken } from '@/lib/api/client';
import { useCryptoStore } from './cryptoStore';
import { deriveMasterKey } from '@/lib/crypto/keyDerivation';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tempToken: string | null; // for 2FA flow
  salt: string | null;

  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean }>;
  verifyTwoFactor: (code: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ salt: string }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
}

const persistUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    sessionStorage.setItem('ls_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('ls_user');
  }
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
  salt: null,

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

        persistUser(res.user);
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
          salt: res.salt,
          tempToken: null,
        });
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

      persistUser(res.user);
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        salt: res.salt,
        tempToken: null,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(email, password);
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
