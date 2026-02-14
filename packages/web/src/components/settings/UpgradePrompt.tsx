'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { Crown, X } from 'lucide-react';

interface Props {
  feature?: string;
  onDismiss?: () => void;
}

export function UpgradePrompt({ feature, onDismiss }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await subscriptionsApi.createCheckout('monthly');
      window.location.href = checkoutUrl;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-5">
      {onDismiss && (
        <button onClick={onDismiss} className="absolute top-3 right-3 text-primary-400 hover:text-primary-600">
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-600 rounded-lg">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {feature ? `Upgrade to unlock ${feature}` : 'Upgrade to Pro'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Get 100 documents, 5 emergency contacts, and 10MB uploads.
            Starting at $10/month or $500 lifetime.
          </p>
          <div className="flex gap-3 mt-3">
            <Button size="sm" isLoading={loading} onClick={handleUpgrade}>
              Upgrade Now
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.location.href = '/settings'}>
              View Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
