'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/Card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/store/authStore';
import { deriveMasterKey } from '@/lib/crypto/keyDerivation';
import { useCryptoStore } from '@/store/cryptoStore';

import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const { login: authLogin } = useAuthStore();
  const [isReferred, setIsReferred] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('referralCode')) {
      setIsReferred(true);
    }
  }, []);

  const handleRegistered = async (email: string, password: string, salt: string) => {
    try {
      await authLogin(email, password);
    } catch {
      const masterKey = await deriveMasterKey(password, salt);
      useCryptoStore.getState().setMasterKey(masterKey);
    }
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof window !== 'undefined' && fbq) {
      fbq('track', 'CompleteRegistration');
    }
    router.push('/documents');
  };

  return (
    <Card>
      {isReferred && (
        <div
          role="status"
          className="mb-[var(--s-6)] flex items-center gap-[var(--s-4)] border p-[var(--s-5)]"
          style={{
            background: 'var(--ok-bg)',
            color: 'var(--ok)',
            borderColor: 'color-mix(in oklab, var(--ok) 25%, transparent)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: 'currentColor' }}
          />
          <span className="text-[13px]" style={{ color: 'var(--fg)' }}>{t('referred')}</span>
        </div>
      )}

      <div className="mb-[var(--s-7)]">
        <span className="t-eyebrow text-fg-subtle">§ Open a vault</span>
        <h1
          className="mt-[var(--s-4)] font-display text-fg"
          style={{
            fontSize: 'var(--t-2xl)',
            letterSpacing: 'var(--tracking-snug)',
            lineHeight: 'var(--lh-snug)',
            margin: 0,
          }}
        >
          {t('title')}
        </h1>
        <p className="mt-[var(--s-4)] text-[13px] leading-[var(--lh-loose)] text-fg-muted">
          Your master key is derived in your browser and never leaves it. We hold the
          ciphertext; you hold the only thing that can read it.
        </p>
      </div>

      <RegisterForm onSuccess={handleRegistered} />

      <p
        className="mt-[var(--s-7)] text-[13px] text-fg-muted"
        style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--s-6)' }}
      >
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-medium text-fg no-underline hover:text-accent">
          {t('signIn')}
        </Link>
      </p>
    </Card>
  );
}
