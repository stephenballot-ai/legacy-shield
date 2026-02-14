'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { TwoFactorInput } from './TwoFactorInput';
import { authApi } from '@/lib/api/auth';
import { Copy, Check } from 'lucide-react';

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const startSetup = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.setup2FA();
      setSecret(res.secret);
      setQrCode(res.qrCode);
      setStep('confirm');
    } catch {
      setError('Failed to set up 2FA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCode = async (code: string) => {
    setError('');
    setIsLoading(true);
    try {
      await authApi.confirm2FA(code);
      onComplete();
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'setup') {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">Secure your account</h3>
        <p className="text-sm text-gray-600">
          Add two-factor authentication for extra security. You&apos;ll need an authenticator app like Google Authenticator or Authy.
        </p>
        {error && <Alert variant="error">{error}</Alert>}
        <Button onClick={startSetup} isLoading={isLoading}>
          Set up 2FA
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-center">Scan QR code</h3>
      <p className="text-sm text-gray-600 text-center">
        Scan this code with your authenticator app, then enter the 6-digit code to confirm.
      </p>

      {qrCode && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
        </div>
      )}

      <Card className="flex items-center justify-between gap-2 !p-3">
        <code className="text-xs font-mono break-all flex-1">{secret}</code>
        <button onClick={copySecret} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          {copied ? <Check className="h-4 w-4 text-trust-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </Card>

      <TwoFactorInput onSubmit={confirmCode} isLoading={isLoading} error={error} />
    </div>
  );
}
