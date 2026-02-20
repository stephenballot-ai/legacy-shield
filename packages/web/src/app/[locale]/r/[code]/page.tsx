'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Gift, Users, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export default function ReferralPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const code = params.code as string;
    if (code) {
      localStorage.setItem('referralCode', code);
    }
  }, [params.code]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white flex flex-col items-center justify-center p-4">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-trust-500/20 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* The Gift Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent-400 text-primary-900 mb-8 shadow-xl animate-bounce-subtle">
          <Gift className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-4">
          You&apos;ve been invited to LegacyShield
        </h1>
        
        <p className="text-lg text-white/80 mb-8">
          A friend wants to help you secure your most important documents for your family.
        </p>

        {/* Value Prop Cards */}
        <div className="space-y-3 mb-10 text-left">
          {[
            { icon: Shield, text: "Secure, zero-knowledge document vault" },
            { icon: Users, text: "Emergency access for your loved ones" },
            { icon: Lock, text: "Encrypted on your device, not our servers" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <item.icon className="h-5 w-5 text-accent-400 flex-shrink-0" />
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* The CTA */}
        <div className="space-y-4">
          <Link href="/register">
            <Button size="lg" className="w-full bg-accent-400 text-primary-900 hover:bg-accent-500 text-lg py-6 shadow-lg shadow-black/20 group">
              Claim My Free Vault
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <div className="flex items-center justify-center gap-2 text-xs text-white/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Free forever · 3 essentials documents included</span>
          </div>
        </div>

        {/* Secondary link */}
        <Link href="/" className="inline-block mt-12 text-sm text-white/40 hover:text-white transition-colors underline underline-offset-4">
          Learn more about how encryption works
        </Link>
      </div>
    </div>
  );
}
