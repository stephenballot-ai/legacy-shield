'use client';

import { Link } from '@/i18n/routing';
import { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { getCurrency } from '@/lib/utils/currency';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';

function JsonLd({ locale }: { locale: string }) {
  const t = useTranslations('homepage.hero');
  const currency = useMemo(() => getCurrency(locale), [locale]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'LegacyShield',
    'operatingSystem': 'Web',
    'applicationCategory': 'SecurityApplication',
    'offers': {
      '@type': 'Offer',
      'price': currency.monthly,
      'priceCurrency': locale === 'nl' || locale === 'de' || locale === 'fr' || locale === 'it' || locale === 'es' ? 'EUR' : 'USD',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'ratingCount': '12',
    },
    'description': t('title') + ' ' + t('subtitle'),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function HeroSection() {
  const t = useTranslations('homepage.hero');
  const user = useAuthStore((s) => s.user);

  return (
    <section className="px-6 pt-12 pb-16 sentinel-gradient relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto sm:py-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 font-sans">
          {t('title')}
        </h1>
        <p className="text-lg sm:text-xl text-primary-fixed-dim/90 leading-relaxed mb-10 font-light max-w-2xl">
          {t.rich('subtitle', {
            strongItem: (chunks) => <strong className="text-white">{chunks}</strong>
          })}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-secondary-container text-on-secondary-container font-semibold py-4 px-8 rounded-xl shadow-lg active:scale-95 transition-all text-center"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-secondary-container text-on-secondary-container font-semibold py-4 px-8 rounded-xl shadow-lg active:scale-95 transition-all text-center"
              >
                {t('ctaPrimary')}
              </Link>
              <a
                href="#how-it-works"
                className="bg-transparent border border-white/20 text-white font-medium py-4 px-8 rounded-xl active:scale-95 transition-all text-center"
              >
                {t('ctaSecondary')}
              </a>
            </>
          )}
        </div>
        {!user && <p className="mt-4 text-sm text-white/40">{t('disclaimer')}</p>}
      </div>
      {/* Abstract glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px]" />
      <div className="absolute top-10 right-10 opacity-20 hidden sm:block">
        <span className="material-symbols-outlined text-[160px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: 'verified_user', label: 'Zero-Knowledge' },
    { icon: 'euro', label: 'EU Infrastructure' },
    { icon: 'enhanced_encryption', label: 'Military Grade' },
  ];

  return (
    <section className="bg-surface-container-low px-6 py-8 flex justify-center sm:justify-between items-center max-w-6xl mx-auto gap-6 flex-wrap">
      {items.map((item, i) => (
        <div key={item.label} className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-primary-900/60 text-xl">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-900/60">{item.label}</span>
        </div>
      ))}
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations('homepage.features');

  return (
    <section className="px-6 py-16 bg-surface max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-8">{t('sectionTitle')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 md:col-span-3 lg:col-span-1">
          <span className="material-symbols-outlined text-secondary-container text-3xl mb-4">description</span>
          <h3 className="text-lg font-bold text-primary-900 mb-2">{t('encryption.title')}</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">{t('encryption.desc')}</p>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
          <span className="material-symbols-outlined text-primary-900 text-2xl mb-4">account_balance</span>
          <h3 className="text-md font-bold text-primary-900 mb-1">{t('emergency.title')}</h3>
          <p className="text-on-surface-variant text-xs">{t('emergency.desc')}</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-2xl">
          <span className="material-symbols-outlined text-primary-900 text-2xl mb-4">history_edu</span>
          <h3 className="text-md font-bold text-primary-900 mb-1">{t('hosting.title')}</h3>
          <p className="text-on-surface-variant text-xs">{t('hosting.desc')}</p>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const t = useTranslations('homepage.proof');

  return (
    <section className="px-6 py-16 bg-primary-900 text-white overflow-hidden relative">
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{t('title')}</h2>
        <p className="text-primary-fixed-dim/80 mb-8 font-light max-w-xl">{t('subtitle')}</p>
        <div className="aspect-square w-full max-w-[280px] mx-auto bg-primary-container rounded-full flex items-center justify-center relative shadow-[0_0_100px_rgba(253,187,18,0.15)]">
          <div className="absolute inset-0 rounded-full border border-secondary-container/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-secondary-container/10" />
          <span className="material-symbols-outlined text-secondary-container text-8xl" style={{ fontVariationSettings: "'wght' 100" }}>fingerprint</span>
        </div>
      </div>
      <div className="absolute -left-20 top-20 w-64 h-64 bg-secondary-container/5 rounded-full blur-[80px]" />
    </section>
  );
}

function HowItWorksSection({ id = 'how-it-works' }: { id?: string }) {
  const t = useTranslations('homepage.howItWorks');
  const steps = [
    { step: '1', title: t('step1.title'), description: t('step1.desc') },
    { step: '2', title: t('step2.title'), description: t('step2.desc') },
    { step: '3', title: t('step3.title'), description: t('step3.desc') },
  ];

  return (
    <section id={id} className="px-6 py-16 bg-surface scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-2">{t('title')}</h2>
          <div className="w-12 h-1 bg-secondary-container mx-auto" />
        </div>
        <div className="space-y-12 max-w-2xl mx-auto">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-900 text-white rounded-full flex items-center justify-center font-bold">
                {s.step}
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-900 mb-2">{s.title}</h3>
                <p className="text-on-surface-variant text-sm">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const t = useTranslations('homepage.useCases');
  const cases = [
    { icon: 'travel', key: 'passports' },
    { icon: 'contract', key: 'wills' },
    { icon: 'domain', key: 'property' },
    { icon: 'vpn_key', key: 'crypto' },
  ];

  return (
    <section className="px-6 py-16 bg-surface-container-low">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-8 text-center">{t('title')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cases.map((c) => (
            <div key={c.key} className="bg-surface-container-lowest p-4 rounded-xl flex flex-col items-center text-center gap-3">
              <span className="material-symbols-outlined text-primary-900/70">{c.icon}</span>
              <span className="text-sm font-medium text-primary-900">{t(`items.${c.key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ locale }: { locale: string }) {
  const t = useTranslations('homepage.pricing');
  const currency = useMemo(() => getCurrency(locale), [locale]);
  const freeFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;
  const proFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;

  return (
    <section className="px-6 py-16 bg-surface" id="pricing">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-8 text-center">{t('title')}</h2>
        <div className="space-y-6 max-w-lg mx-auto">
          {/* Pro Card */}
          <div className="bg-primary-900 text-white p-8 rounded-3xl relative overflow-hidden ring-4 ring-secondary-container/20">
            <div className="absolute top-0 right-0 bg-secondary-container text-on-secondary-container px-4 py-1 text-[10px] font-bold uppercase rounded-bl-xl tracking-tighter">
              {t('pro.badge')}
            </div>
            <h3 className="text-xl font-bold mb-2">{t('pro.name')}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-secondary-container">{currency.symbol}{currency.monthly}</span>
              <span className="text-primary-fixed-dim/60 text-sm">{t('pro.period')}</span>
            </div>
            <ul className="space-y-4 mb-8">
              {proFeatures.map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {t(`pro.features.${key}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="w-full block text-center bg-secondary-container text-on-secondary-container font-bold py-3 rounded-xl active:scale-95 transition-all"
            >
              {t('pro.cta')}
            </Link>
          </div>

          {/* Free Card */}
          <div className="bg-surface-container-high p-8 rounded-3xl border border-outline-variant/20">
            <h3 className="text-xl font-bold text-primary-900 mb-2">{t('free.name')}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-primary-900">{currency.symbol}0</span>
              <span className="text-on-surface-variant text-sm">{t('free.period')}</span>
            </div>
            <ul className="space-y-4 mb-8">
              {freeFeatures.map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary-900 text-lg">check_circle</span>
                  {t(`free.features.${key}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="w-full block text-center bg-primary-900 text-white font-bold py-3 rounded-xl active:scale-95 transition-all"
            >
              {t('free.cta')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('homepage.cta');
  return (
    <section className="px-6 py-20 bg-primary-container text-white text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('title')}</h2>
        <p className="text-on-primary-container mb-10">{t('subtitle')}</p>
        <Link
          href="/register"
          className="bg-secondary-container text-on-secondary-container font-bold py-4 px-12 rounded-full shadow-2xl active:scale-95 transition-all inline-block"
        >
          {t('button')}
        </Link>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: string }) {
  const t = useTranslations('homepage.footer');
  return (
    <footer className="bg-primary-900 text-on-primary-container/60 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container">security</span>
            <span className="font-semibold text-white">LegacyShield</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm justify-center">
            <Link href="/blog" className="hover:text-white transition-colors">{t('blog')}</Link>
            {locale === 'nl' && <Link href="/notaris" className="hover:text-white transition-colors">{t('notary')}</Link>}
            <Link href="/faq" className="hover:text-white transition-colors">{t('faq')}</Link>
            <Link href="/continuity" className="hover:text-white transition-colors">{t('continuity')}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('terms')}</Link>
            <Link href="/made-in-eu" className="hover:text-white transition-colors">{t('madeInEu')}</Link>
          </div>
          <p className="text-sm">{t('tagline')} 🇪🇺</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <main className="bg-surface text-on-surface">
      <JsonLd locale={params.locale} />
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <SecuritySection />
      <HowItWorksSection />
      <UseCasesSection />
      <PricingSection locale={params.locale} />
      <CTASection />
      <Footer locale={params.locale} />
    </main>
  );
}
