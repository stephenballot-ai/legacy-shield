'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { RecoveryCodesDisplay } from '@/components/auth/RecoveryCodesDisplay';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';
import { deriveMasterKey } from '@/lib/crypto/keyDerivation';
import { useCryptoStore } from '@/store/cryptoStore';

type Step = 'register' | 'two-factor' | 'recovery' | 'done';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('register');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const { login: authLogin } = useAuthStore();

  const handleRegistered = async (email: string, password: string, salt: string) => {
    // Auto-login after registration
    try {
      await authLogin(email, password);
      setStep('two-factor');
    } catch {
      // If auto-login fails, still proceed (user might need email verification)
      // Derive key manually
      const masterKey = await deriveMasterKey(password, salt);
      useCryptoStore.getState().setMasterKey(masterKey);
      setStep('two-factor');
    }
  };

  const handle2FAComplete = async () => {
    try {
      const res = await authApi.generateRecoveryCodes();
      setRecoveryCodes(res.recoveryCodes);
      setStep('recovery');
    } catch {
      // If code generation fails, go to dashboard anyway
      router.push('/dashboard');
    }
  };

  const handleRecoveryConfirmed = () => {
    router.push('/dashboard');
  };

  return (
    <Card>
      {step === 'register' && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">Create your account</h1>
          <RegisterForm onSuccess={handleRegistered} />
          <p className="mt-6 text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </>
      )}

      {step === 'two-factor' && (
        <TwoFactorSetup onComplete={handle2FAComplete} />
      )}

      {step === 'recovery' && (
        <RecoveryCodesDisplay codes={recoveryCodes} onConfirm={handleRecoveryConfirmed} />
      )}
    </Card>
  );
}
