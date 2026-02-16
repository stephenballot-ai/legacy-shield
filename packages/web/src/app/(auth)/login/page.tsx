'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { verifyTwoFactor, isLoading } = useAuthStore();

  const handleTwoFactor = (pwd: string) => {
    setPassword(pwd);
    setStep('2fa');
  };

  const handleVerify2FA = async (code: string) => {
    setError('');
    try {
      await verifyTwoFactor(code, password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.code === 'INVALID_TWO_FACTOR_CODE' ? 'Invalid code' : err.message);
      } else {
        setError('Verification failed');
      }
    }
  };

  return (
    <Card>
      <h1 className="text-2xl font-bold text-center mb-6">
        {step === 'login' ? 'Sign in' : 'Two-factor authentication'}
      </h1>

      {step === 'login' ? (
        <>
          <LoginForm onTwoFactor={handleTwoFactor} onSuccess={() => router.push('/dashboard')} />
          <p className="mt-4 text-sm text-center">
            <Link href="/forgot-password" className="text-gray-500 hover:text-gray-700">
              Can&apos;t access your account?
            </Link>
          </p>
          <p className="mt-3 text-sm text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter the 6-digit code from your authenticator app.
          </p>
          <TwoFactorInput onSubmit={handleVerify2FA} isLoading={isLoading} error={error} />
          <button
            onClick={() => setStep('login')}
            className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 text-center"
          >
            Back to login
          </button>
        </>
      )}
    </Card>
  );
}
