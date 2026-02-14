'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useCryptoStore } from '@/store/cryptoStore';
import { useAuthStore } from '@/store/authStore';
import { deriveMasterKey } from '@/lib/crypto/keyDerivation';
import { usersApi } from '@/lib/api/users';
import { Lock } from 'lucide-react';

interface PasswordPromptProps {
  onUnlocked: () => void;
}

export function PasswordPrompt({ onUnlocked }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const salt = useAuthStore((s) => s.salt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      // Use persisted salt from login, fall back to API
      let derivationSalt = salt;
      let profile: any = null;
      if (!derivationSalt) {
        profile = await usersApi.getMe();
        derivationSalt = (profile as any)?.keyDerivationSalt || (profile as any)?.emergencyKeySalt;
      }
      if (!derivationSalt) throw new Error('Could not retrieve account info');

      const masterKey = await deriveMasterKey(password, derivationSalt);
      useCryptoStore.getState().setMasterKey(masterKey);

      // Also recover emergency key if available
      if (!profile) profile = await usersApi.getMe();
      if ((profile as any).emergencyKeyEncrypted && (profile as any).emergencyKeySalt) {
        try {
          const [encB64, ivB64] = (profile as any).emergencyKeyEncrypted.split(':');
          if (encB64 && ivB64) {
            const fromBase64 = (b64: string): ArrayBuffer => {
              const binary = atob(b64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              return bytes.buffer;
            };
            const rawKey = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv: new Uint8Array(fromBase64(ivB64)) },
              masterKey,
              fromBase64(encB64)
            );
            const emergencyKey = await crypto.subtle.importKey(
              'raw', rawKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
            );
            useCryptoStore.getState().setEmergencyKey(emergencyKey);
          }
        } catch {
          // Non-critical
        }
      }

      onUnlocked();
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="p-3 bg-primary-50 rounded-full mb-4">
        <Lock className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Vault Locked</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
        Your session is active but your encryption keys need to be re-derived. Enter your password to unlock.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <Input
          id="unlock-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoFocus
        />
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" isLoading={loading} className="w-full">
          Unlock Vault
        </Button>
      </form>
    </div>
  );
}
