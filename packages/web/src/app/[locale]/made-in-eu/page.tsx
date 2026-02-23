'use client';

import { Link } from '@/i18n/routing';
import { Shield, Lock, Server, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

function HeroSection() {
  const t = useTranslations('madeInEu.hero');
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 lg:py-40">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-7xl mb-8">🇪🇺</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>
    </section>
  );
}

function InfrastructureSection() {
  const t = useTranslations('madeInEu.infrastructure');
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Server className="h-10 w-10 mx-auto mb-4 text-primary-700" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('title')}</h2>
          <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Comparison visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* AWS */}
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8">
            <div className="text-center">
              <div className="text-3xl mb-3">🇺🇸</div>
              <h3 className="text-lg font-bold text-red-900">{t('comparison.aws.title')}</h3>
              <p className="text-sm text-red-700 mt-2">{t('comparison.aws.subtitle')}</p>
              <ul className="mt-4 space-y-2 text-sm text-red-800 text-left">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>{t('comparison.aws.point1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>{t('comparison.aws.point2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>{t('comparison.aws.point3')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Hetzner */}
          <div className="rounded-2xl border-2 border-trust-200 bg-trust-50 p-8">
            <div className="text-center">
              <div className="text-3xl mb-3">🇩🇪</div>
              <h3 className="text-lg font-bold text-trust-900">{t('comparison.hetzner.title')}</h3>
              <p className="text-sm text-trust-700 mt-2">{t('comparison.hetzner.subtitle')}</p>
              <ul className="mt-4 space-y-2 text-sm text-trust-800 text-left">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>{t('comparison.hetzner.point1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>{t('comparison.hetzner.point2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>{t('comparison.hetzner.point3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ZeroKnowledgeSection() {
  const t = useTranslations('madeInEu.zeroKnowledge');
  const points = ['point1', 'point2', 'point3', 'point4'] as const;
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Lock className="h-10 w-10 mx-auto mb-4 text-primary-700" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('title')}</h2>
          <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {points.map((key) => (
            <div key={key} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-6">
              <CheckCircle className="h-6 w-6 text-trust-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">{t(key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HonestySection() {
  const t = useTranslations('madeInEu.honesty');
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-accent-500" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('title')}</h2>
          <p className="mt-4 text-lg text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-900 font-medium">{t('point1')}</p>
          </div>
          <div className="bg-trust-50 border border-trust-200 rounded-xl p-6">
            <p className="text-trust-900 font-medium">{t('point2')}</p>
          </div>
          <div className="bg-trust-50 border border-trust-200 rounded-xl p-6">
            <p className="text-trust-900 font-medium">{t('point3')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyStackSection() {
  const t = useTranslations('madeInEu.privacyStack');
  const stack = [
    { icon: '🔐', key: 'encryption' },
    { icon: '🔑', key: 'keyDerivation' },
    { icon: '🏢', key: 'storage' },
    { icon: '🔒', key: 'transit' },
    { icon: '💾', key: 'atRest' },
  ] as const;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Layers className="h-10 w-10 mx-auto mb-4 text-primary-700" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('title')}</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {stack.map((item) => (
            <div key={item.key} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-5">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{t(`${item.key}.label`)}</p>
                <p className="text-sm text-gray-600">{t(`${item.key}.value`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('madeInEu.cta');
  return (
    <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Shield className="h-12 w-12 mx-auto mb-6 text-trust-400" />
        <h2 className="text-3xl sm:text-4xl font-bold">{t('title')}</h2>
        <p className="mt-4 text-lg text-white/80">{t('subtitle')}</p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent-400 text-primary-900 font-semibold text-lg hover:bg-accent-500 transition-colors shadow-lg"
        >
          {t('button')}
        </Link>
      </div>
    </section>
  );
}

export default function MadeInEuPage() {
  return (
    <main>
      <HeroSection />
      <InfrastructureSection />
      <ZeroKnowledgeSection />
      <HonestySection />
      <PrivacyStackSection />
      <CTASection />
    </main>
  );
}
