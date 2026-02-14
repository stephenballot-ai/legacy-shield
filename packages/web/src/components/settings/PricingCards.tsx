'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { Check, Crown, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrency } from '@/lib/utils/currency';

const features = [
  'Up to 100 documents',
  'Up to 5 emergency contacts',
  '10MB file uploads',
  'Priority support',
  'Advanced encryption',
  'EU data residency',
];

export function PricingCards() {
  const [loading, setLoading] = useState<'monthly' | 'lifetime' | null>(null);
  const [error, setError] = useState('');
  const currency = useMemo(() => getCurrency(), []);

  const handleCheckout = async (plan: 'monthly' | 'lifetime') => {
    setLoading(plan);
    setError('');
    try {
      const { checkoutUrl } = await subscriptionsApi.createCheckout(plan);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly */}
        <Card className="relative flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly</h3>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">{currency.symbol}{currency.monthly}</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="space-y-2 mb-6 flex-1">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full"
            isLoading={loading === 'monthly'}
            disabled={loading !== null}
            onClick={() => handleCheckout('monthly')}
          >
            Subscribe Monthly
          </Button>
        </Card>

        {/* Lifetime */}
        <Card className={cn('relative flex flex-col border-2 border-primary-500')}>
          <div className="absolute -top-3 left-4 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Best Value
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Lifetime</h3>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-gray-900">{currency.symbol}{currency.lifetime}</span>
            <span className="text-gray-500"> one-time</span>
          </div>
          <ul className="space-y-2 mb-6 flex-1">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              Never pay again
            </li>
          </ul>
          <Button
            className="w-full"
            isLoading={loading === 'lifetime'}
            disabled={loading !== null}
            onClick={() => handleCheckout('lifetime')}
          >
            Get Lifetime Access
          </Button>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-4">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          EU Hosted (Germany)
        </div>
        <span>•</span>
        <span>End-to-end encrypted</span>
        <span>•</span>
        <span>Cancel anytime</span>
      </div>
    </div>
  );
}
