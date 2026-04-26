'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/Card';
import { LoginForm } from '@/components/auth/LoginForm';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api/client';

import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth.login');
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
      <div className="mb-[var(--s-7)]">
        <span className="t-eyebrow text-fg-subtle">
          {step === 'login' ? '§ Sign in' : '§ Two-factor verification'}
        </span>
        <h1
          className="mt-[var(--s-4)] font-display text-fg"
          style={{
            fontSize: 'var(--t-2xl)',
            letterSpacing: 'var(--tracking-snug)',
            lineHeight: 'var(--lh-snug)',
            margin: 0,
          }}
        >
          {step === 'login' ? t('title') : 'Confirm with your authenticator'}
        </h1>
      </div>

      {step === 'login' ? (
        <>
          <LoginForm onTwoFactor={handleTwoFactor} onSuccess={() => router.push('/dashboard')} />
          <div
            className="mt-[var(--s-7)] flex flex-col gap-[var(--s-4)] text-[13px]"
            style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--s-6)' }}
          >
            <Link href="/forgot-password" className="text-fg-muted no-underline hover:text-accent">
              {t('forgotPassword')}
            </Link>
            <p className="text-fg-muted">
              {t('noAccount')}{' '}
              <Link href="/register" className="font-medium text-fg no-underline hover:text-accent">
                {t('createAccount')}
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="mb-[var(--s-7)] text-[13px] text-fg-muted">
            Enter the 6-digit code from your authenticator app.
          </p>
          <TwoFactorInput onSubmit={handleVerify2FA} isLoading={isLoading} error={error} />
          <button
            type="button"
            onClick={() => setStep('login')}
            className="ls-btn ls-btn--tertiary ls-btn--block mt-[var(--s-6)]"
          >
            ← Back to sign in
          </button>
        </>
      )}
    </Card>
  );
}
