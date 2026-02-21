'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useCryptoStore } from '@/store/cryptoStore';
import { deriveEmergencyKey } from '@/lib/crypto/keyDerivation';
import { emergencyAccessApi } from '@/lib/api/emergencyAccess';
import { setAccessToken } from '@/lib/api/client';
import { ShieldAlert } from 'lucide-react';

export default function EmergencyAccessPortal() {
  const [email, setEmail] = useState('');
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const owner = searchParams.get('owner');
    if (owner) {
      setEmail(owner);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !phrase.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Validate phrase with API
      const result = await emergencyAccessApi.validateEmergencyPhrase(email.trim(), phrase);

      // 2. Set access token for subsequent API calls
      setAccessToken(result.accessToken);

      // 3. Derive emergency key from phrase + salt
      const emergencyKey = await deriveEmergencyKey(phrase, result.emergencyKeySalt);

      // 4. Store emergency key
      useCryptoStore.getState().setEmergencyKey(emergencyKey);

      // 5. Redirect to vault
      router.push('/emergency-portal/vault');
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        const apiErr = err as { status: number; code: string };
        if (apiErr.status === 429) {
          setError('Too many attempts. Please try again in 15 minutes.');
        } else if (apiErr.status === 401) {
          setError('Invalid unlock phrase. Please check and try again.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <Logo size="sm" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <ShieldAlert className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Access</h1>
            <p className="text-sm text-gray-500 mt-2">
              Enter the unlock phrase provided by the vault owner to access their documents.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="owner-email"
                label="Vault Owner's Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                autoFocus
              />
              <Input
                id="unlock-phrase"
                label="Unlock Phrase"
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="Enter the unlock phrase…"
              />
              {error && <Alert variant="error">{error}</Alert>}
              <Button type="submit" isLoading={loading} className="w-full">
                Access Vault
              </Button>
            </form>
          </div>

          {/* Trust signals */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-400">
              Your phrase is never stored or transmitted in plain text.
              All decryption happens locally in your browser.
            </p>
            <p className="text-xs text-gray-400">
              Access is read-only. Documents cannot be modified or deleted.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        <Logo size="sm" className="justify-center mb-2" />
        Secure document vault for life&apos;s important moments
      </footer>
    </div>
  );
}
