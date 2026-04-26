'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <Card>
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-[var(--s-6)] py-[var(--s-9)] text-center">
          <LoadingSpinner size="lg" />
          <p className="text-[13px] text-fg-muted">Verifying your email…</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-[var(--s-6)] py-[var(--s-9)] text-center">
          <span className="ls-badge ls-badge--ok">
            <span className="dot" />
            Verified
          </span>
          <h2
            className="font-display text-fg"
            style={{
              fontSize: 'var(--t-xl)',
              letterSpacing: 'var(--tracking-snug)',
              margin: 0,
            }}
          >
            Email verified
          </h2>
          <p className="text-[13px] text-fg-muted">Your address is now on record.</p>
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col gap-[var(--s-6)] py-[var(--s-7)]">
          <Alert variant="error">
            {token ? 'Invalid or expired verification link.' : 'No verification token provided.'}
          </Alert>
          <Link href="/login">
            <Button variant="secondary" block>
              Go to sign in
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <div className="flex justify-center py-[var(--s-9)]">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
