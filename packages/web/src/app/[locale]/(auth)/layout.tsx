import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="mb-8">
        <Link href="/"><Logo size="lg" /></Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-xs text-gray-400 text-center">
        🇪🇺 100% European Hosting · Zero-Knowledge Encryption
      </p>
    </div>
  );
}
