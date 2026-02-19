'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  const [showComingSoon, setShowComingSoon] = useState(false);
  const currency = useMemo(() => getCurrency(), []);

  const handleCheckout = () => {
    setShowComingSoon(true);
  };

  if (showComingSoon) {
    return (
      <Card className="text-center py-12 px-6 bg-gradient-to-br from-white to-primary-50">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <Zap className="h-8 w-8 text-primary-600 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">LegacyShield Pro is almost here!</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          We&apos;re currently finalizing our secure European payment gateway. Pro accounts and expanded storage will be available in just a few days. 
          <br /><br />
          We&apos;ll notify you at your registered email address as soon as we launch!
        </p>
        <Button onClick={() => setShowComingSoon(false)} variant="secondary">
          Back to plans
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
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
            onClick={() => handleCheckout()}
          >
            Subscribe Monthly
          </Button>
        </Card>

        {/* Lifetime */}
        <Card className={cn('relative flex flex-col border-2 border-accent-400')}>
          <div className="absolute -top-3 left-4 bg-accent-400 text-primary-900 text-xs font-semibold px-3 py-1 rounded-full">
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
            onClick={() => handleCheckout()}
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
