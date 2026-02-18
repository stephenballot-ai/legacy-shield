'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/store/authStore';
import { deriveMasterKey } from '@/lib/crypto/keyDerivation';
import { useCryptoStore } from '@/store/cryptoStore';

export default function RegisterPage() {
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
      // If auto-login fails, derive key manually so vault works
      const masterKey = await deriveMasterKey(password, salt);
      useCryptoStore.getState().setMasterKey(masterKey);
    }
    router.push('/documents');
  };

  return (
    <Card>
      {isReferred && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-sm text-green-800">
            🎉 You&apos;ve been invited by a friend! Create your account to get started with a free encrypted vault.
          </p>
        </div>
      )}
      <h1 className="text-2xl font-bold text-center mb-6">Create your account</h1>
      <RegisterForm onSuccess={handleRegistered} />
      <p className="mt-6 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
