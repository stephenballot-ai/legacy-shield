'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { CheckCircle2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <Card className="text-center">
      {status === 'loading' && (
        <div className="py-8 flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8 flex flex-col items-center gap-4">
          <CheckCircle2 className="h-12 w-12 text-trust-500" />
          <h2 className="text-xl font-semibold">Email verified</h2>
          <p className="text-sm text-gray-600">Your email has been verified successfully.</p>
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8 space-y-4">
          <Alert variant="error">
            {token ? 'Invalid or expired verification link.' : 'No verification token provided.'}
          </Alert>
          <Link href="/login">
            <Button variant="secondary">Go to login</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Card className="text-center py-8"><LoadingSpinner size="lg" /></Card>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
