'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, Users, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-center mb-2">
        Can&apos;t access your account?
      </h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        LegacyShield uses zero-knowledge encryption to protect your data.
        We never store your password — so we can&apos;t reset it.
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
          <ShieldCheck className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Why can&apos;t you reset my password?</p>
            <p className="text-sm text-gray-600 mt-1">
              Your password is used to derive an encryption key that protects your files.
              We never see this key — it only exists on your device. Without your password,
              your documents cannot be decrypted by anyone, including us.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
          <Users className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Do you have emergency access set up?</p>
            <p className="text-sm text-gray-600 mt-1">
              If you set up emergency access, your trusted contact can retrieve your documents
              using the unlock phrase. Visit the{' '}
              <Link href="/emergency-portal" className="text-primary-600 hover:text-primary-700 font-medium">
                emergency portal
              </Link>{' '}
              to access the vault.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
          <KeyRound className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Tips for next time</p>
            <p className="text-sm text-gray-600 mt-1">
              Use a password manager to store your LegacyShield password.
              Set up emergency access so a trusted person can recover your documents if you lose access.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-400 text-center">
          This is by design — not a limitation. Unlike other cloud storage providers,
          we cannot access your data even if compelled by a court order.
        </p>
      </div>

      <Link
        href="/login"
        className="mt-4 block w-full text-sm text-center text-primary-600 hover:text-primary-700 font-medium"
      >
        ← Back to login
      </Link>
    </Card>
  );
}
