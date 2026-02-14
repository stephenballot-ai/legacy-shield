'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Shield, Lock, Users, Server, Upload, UserPlus, CheckCircle, Heart } from 'lucide-react';
import { getCurrency } from '@/lib/utils/currency';

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Shield className="h-4 w-4 text-trust-400" />
            <span>Zero-Knowledge Encrypted Vault</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            The Swiss Bank Account for Your Most Important Files
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Securely store critical documents — passports, wills, insurance policies — with military-grade encryption and emergency access for your loved ones.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-primary-900 font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg shadow-black/20"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/50">Free plan includes 15 documents · No credit card required</p>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: '🇪🇺', label: '100% EU Hosted' },
    { icon: '🔐', label: 'Zero-Knowledge Encryption' },
    { icon: '🛡️', label: 'AES-256-GCM' },
    { icon: '✅', label: 'GDPR Native' },
  ];

  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-600 font-medium">
          {items.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Lock,
      title: 'Military-Grade Encryption',
      description: 'Your files are encrypted in your browser with AES-256-GCM before they ever leave your device. We literally cannot see your data — even if we wanted to.',
      color: 'bg-primary-100 text-primary-700',
    },
    {
      icon: Users,
      title: 'Emergency Access',
      description: 'Designate trusted contacts who can access your vault using a secret unlock phrase. When it matters most, your loved ones won\'t be locked out.',
      color: 'bg-trust-100 text-trust-700',
    },
    {
      icon: Server,
      title: 'EU-Only Hosting',
      description: 'Your encrypted data is stored exclusively in European data centers. No US jurisdiction, no CLOUD Act, no backdoors. GDPR-compliant by design.',
      color: 'bg-navy-100 text-navy-700',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Security Without Compromise
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Built from the ground up for people who take document security seriously.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} mb-6`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      step: '1',
      title: 'Upload Your Documents',
      description: 'Drag and drop your important files. They\'re encrypted instantly in your browser.',
    },
    {
      icon: UserPlus,
      step: '2',
      title: 'Set Up Emergency Access',
      description: 'Add trusted contacts and create a secret unlock phrase only they would know.',
    },
    {
      icon: CheckCircle,
      step: '3',
      title: 'Rest Easy',
      description: 'Your documents are safe, encrypted, and accessible to the right people when it matters.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Three simple steps to protect your most important documents.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-900 text-white mb-6">
                <s.icon className="h-8 w-8" />
              </div>
              <div className="absolute -top-2 left-1/2 ml-6 bg-trust-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {s.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const cases = [
    { icon: '🛂', label: 'Passports & IDs' },
    { icon: '📜', label: 'Wills & Trusts' },
    { icon: '🏠', label: 'Property Deeds' },
    { icon: '💼', label: 'Insurance Policies' },
    { icon: '🏥', label: 'Medical Records' },
    { icon: '💰', label: 'Financial Documents' },
    { icon: '🔑', label: 'Crypto Recovery Keys' },
    { icon: '📋', label: 'Tax Returns' },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            What to Store
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            The documents you hope you&apos;ll never need — but will be glad you saved.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cases.map((c) => (
            <div key={c.label} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-2xl">{c.icon}</span>
              <span className="font-medium text-gray-800 text-sm">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const currency = useMemo(() => getCurrency(), []);
  return (
    <section className="py-20 sm:py-28 bg-gray-50" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Simple Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free. Upgrade when you need more.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900">Free</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">{currency.symbol}0</span>
              <span className="text-gray-500 ml-1">forever</span>
            </div>
            <ul className="mt-8 space-y-3">
              {['15 documents', '1 emergency contact', 'Zero-knowledge encryption', 'EU hosting'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-trust-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full text-center px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl border-2 border-primary-500 p-8 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">{currency.symbol}{currency.monthly}</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">or {currency.symbol}{currency.lifetime} one-time (lifetime)</p>
            <ul className="mt-8 space-y-3">
              {['100 documents', '5 emergency contacts', 'Everything in Free', 'Priority support', '10MB file size limit'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-trust-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full text-center px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
            >
              Start Free, Upgrade Later
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Heart className="h-12 w-12 mx-auto mb-6 text-trust-400" />
        <h2 className="text-3xl sm:text-4xl font-bold">
          Protect What Matters Most
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Your documents. Your family&apos;s peace of mind. Start securing them today.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-primary-900 font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Create Your Free Vault
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-400" />
            <span className="font-semibold text-white">LegacyShield</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-sm">
            Built with 🤍 in Europe 🇪🇺
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
