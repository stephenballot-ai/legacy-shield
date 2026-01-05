/**
 * Crypto Store
 * Manages encryption keys in memory (Zustand)
 *
 * SECURITY: Keys are stored in memory only and cleared on logout/page unload
 * Keys are NEVER persisted to localStorage or sent to server
 */

import { create } from 'zustand';

interface CryptoStore {
  masterKey: CryptoKey | null;
  emergencyKey: CryptoKey | null;
  setMasterKey: (key: CryptoKey) => void;
  setEmergencyKey: (key: CryptoKey) => void;
  clearKeys: () => void;
}

export const useCryptoStore = create<CryptoStore>((set) => ({
  masterKey: null,
  emergencyKey: null,

  setMasterKey: (key) => set({ masterKey: key }),

  setEmergencyKey: (key) => set({ emergencyKey: key }),

  clearKeys: () => set({ masterKey: null, emergencyKey: null }),
}));

// Clear keys on page unload for security
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useCryptoStore.getState().clearKeys();
  });
}
