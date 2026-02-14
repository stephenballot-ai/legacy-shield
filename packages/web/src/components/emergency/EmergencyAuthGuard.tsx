'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useCryptoStore } from '@/store/cryptoStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function EmergencyAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const emergencyKey = useCryptoStore((s) => s.emergencyKey);

  useEffect(() => {
    if (!emergencyKey) {
      router.replace('/emergency-access');
    }
  }, [emergencyKey, router]);

  if (!emergencyKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
