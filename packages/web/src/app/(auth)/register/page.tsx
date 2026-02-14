'use client';

import { useState } from 'react';
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
