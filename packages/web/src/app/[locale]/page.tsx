'use client';

import { Link } from '@/i18n/routing';
import { useMemo } from 'react';
import { getCurrency } from '@/lib/utils/currency';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { Logo } from '@/components/ui/Logo';

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

function NavHeader() {
  return (
    <header className="fixed top-0 w-full z-50 glass-panel flex justify-between items-center px-6 py-4">
      <Link href="/">
        <Logo size="md" />
      </Link>
    </header>
  );
}

function HeroSection() {
  const t = useTranslations('homepage.hero');
  const user = useAuthStore((s) => s.user);

  return (
    <section className="sentinel-gradient relative overflow-hidden px-6 pt-32 pb-16">
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
          {t('title')}
        </h1>
        <p className="text-lg text-primary-fixed-dim/90 leading-relaxed mb-10 font-light">
          {t('subtitle')}
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
        {!user && <p className="mt-4 text-sm text-white/50">{t('disclaimer')}</p>}
      </div>
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px]" />
      <div className="absolute top-10 right-10 opacity-20 pointer-events-none">
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: '160px', fontVariationSettings: "'FILL' 1" }}
        >
          shield_with_heart
        </span>
      </div>
    </section>
  );
}

function TrustBar() {
  const t = useTranslations('homepage.trust');
  return (
    <section className="bg-surface-container-low px-6 py-8 flex justify-between items-center">
      <div className="flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-primary-900/60 text-xl">verified_user</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-900/60">{t('zeroKnowledge')}</span>
      </div>
      <div className="w-px h-8 bg-outline-variant/30" />
      <div className="flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-primary-900/60 text-xl">euro</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-900/60">{t('euInfrastructure')}</span>
      </div>
      <div className="w-px h-8 bg-outline-variant/30" />
      <div className="flex flex-col items-center gap-1">
        <span className="material-symbols-outlined text-primary-900/60 text-xl">enhanced_encryption</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary-900/60">{t('militaryGrade')}</span>
      </div>
    </section>
  );
}

function FeatureBentoSection() {
  const t = useTranslations('homepage.features');
  return (
    <section className="px-6 py-16 bg-surface">
      <h2 className="text-2xl font-bold text-primary-900 mb-8">{t('bentoTitle')}</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <span className="material-symbols-outlined text-secondary-container text-3xl mb-4 block">description</span>
          <h3 className="text-lg font-bold text-primary-900 mb-2">{t('insurance.title')}</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">{t('insurance.desc')}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
            <span className="material-symbols-outlined text-primary-900 text-2xl mb-4 block">account_balance</span>
            <h3 className="text-base font-bold text-primary-900 mb-1">{t('bank.title')}</h3>
            <p className="text-on-surface-variant text-xs">{t('bank.desc')}</p>
          </div>
          <div className="bg-surface-container-high p-6 rounded-2xl">
            <span className="material-symbols-outlined text-primary-900 text-2xl mb-4 block">history_edu</span>
            <h3 className="text-base font-bold text-primary-900 mb-1">{t('wills.title')}</h3>
            <p className="text-on-surface-variant text-xs">{t('wills.desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SentinelXSection() {
  const t = useTranslations('homepage.sentinelX');
  return (
    <section className="px-6 py-16 bg-primary-900 text-white overflow-hidden relative">
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-4 leading-tight">{t('title')}</h2>
        <p className="text-primary-fixed-dim/80 mb-8 font-light">{t('subtitle')}</p>
        <div className="aspect-square w-full max-w-[280px] mx-auto bg-primary-container rounded-full flex items-center justify-center relative shadow-[0_0_100px_rgba(253,187,18,0.15)]">
          <div className="absolute inset-0 rounded-full border border-secondary-container/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-secondary-container/10" />
          <span
            className="material-symbols-outlined text-secondary-container text-8xl"
            style={{ fontVariationSettings: "'wght' 100" }}
          >
            fingerprint
          </span>
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
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-primary-900 mb-2">{t('title')}</h2>
        <div className="w-12 h-1 bg-secondary-container mx-auto" />
      </div>
      <div className="space-y-12">
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
    </section>
  );
}

function UseCasesSection() {
  const t = useTranslations('homepage.useCases');
  const cases = [
    { icon: 'travel_explore', key: 'passports' },
    { icon: 'contract', key: 'wills' },
    { icon: 'domain', key: 'property' },
    { icon: 'vpn_key', key: 'crypto' },
  ] as const;

  return (
    <section className="px-6 py-16 bg-surface-container-low">
      <h2 className="text-2xl font-bold text-primary-900 mb-8 text-center">{t('title')}</h2>
      <div className="grid grid-cols-2 gap-4">
        {cases.map((c) => (
          <div key={c.key} className="bg-surface-container-lowest p-4 rounded-xl flex flex-col items-center text-center gap-3">
            <span className="material-symbols-outlined text-primary-900/70">{c.icon}</span>
            <span className="text-sm font-medium text-primary-900">{t(`items.${c.key}`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection({ locale }: { locale: string }) {
  const t = useTranslations('homepage.pricing');
  const currency = useMemo(() => getCurrency(locale), [locale]);
  const proFeatures = ['f1', 'f2', 'f3', 'f4', 'f5'] as const;
  const freeFeatures = ['f1', 'f2'] as const;

  return (
    <section className="px-6 py-16 bg-surface" id="pricing">
      <h2 className="text-2xl font-bold text-primary-900 mb-8 text-center">{t('title')}</h2>
      <div className="space-y-6">
        {/* Pro Card */}
        <div className="bg-primary-900 text-white p-8 rounded-3xl relative overflow-hidden ring-4 ring-secondary-container/20">
          <div className="absolute top-0 right-0 bg-secondary-container text-on-secondary-container px-4 py-1 text-[10px] font-bold uppercase rounded-bl-xl tracking-tighter">
            {t('pro.badge')}
          </div>
          <h3 className="text-xl font-bold mb-2">{t('pro.name')}</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-extrabold text-secondary-container">
              {currency.symbol}{currency.monthly}
            </span>
            <span className="text-primary-fixed-dim/60 text-sm">{t('pro.period')}</span>
          </div>
          <ul className="space-y-4 mb-8">
            {proFeatures.map((key) => (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span
                  className="material-symbols-outlined text-secondary-container text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                {t(`pro.features.${key}`)}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block w-full bg-secondary-container text-on-secondary-container font-bold py-3 rounded-xl active:scale-95 transition-all text-center"
          >
            {t('pro.cta')}
          </Link>
        </div>

        {/* Basic Card */}
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
            className="block w-full bg-primary-900 text-white font-bold py-3 rounded-xl active:scale-95 transition-all text-center"
          >
            {t('free.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('homepage.cta');
  return (
    <section className="px-6 py-20 bg-primary-container text-white text-center">
      <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
      <p className="text-on-primary-container mb-10">{t('subtitle')}</p>
      <Link
        href="/register"
        className="inline-block bg-secondary-container text-on-secondary-container font-bold py-4 px-12 rounded-full shadow-2xl active:scale-95 transition-all"
      >
        {t('button')}
      </Link>
    </section>
  );
}

function Footer({ locale }: { locale: string }) {
  const t = useTranslations('homepage.footer');
  return (
    <footer className="px-6 py-12 bg-primary-container border-t border-white/10 text-center">
      <div className="flex flex-wrap justify-center gap-6 text-xs text-on-primary-container uppercase tracking-widest font-medium mb-8">
        <Link href="/blog" className="hover:text-secondary-container transition-colors">{t('blog')}</Link>
        {locale === 'nl' && (
          <Link href="/notaris" className="hover:text-secondary-container transition-colors">{t('notary')}</Link>
        )}
        <Link href="/faq" className="hover:text-secondary-container transition-colors">{t('faq')}</Link>
        <Link href="/continuity" className="hover:text-secondary-container transition-colors">{t('continuity')}</Link>
        <Link href="/privacy" className="hover:text-secondary-container transition-colors">{t('privacy')}</Link>
        <Link href="/terms" className="hover:text-secondary-container transition-colors">{t('terms')}</Link>
        <Link href="/made-in-eu" className="hover:text-secondary-container transition-colors">{t('madeInEu')}</Link>
      </div>
      <p className="text-[10px] text-on-primary-container/50">
        © {new Date().getFullYear()} LegacyShield. {t('tagline')} 🇪🇺
      </p>
    </footer>
  );
}

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <main className="bg-surface text-on-surface">
      <JsonLd locale={params.locale} />
      <NavHeader />
      <HeroSection />
      <TrustBar />
      <FeatureBentoSection />
      <SentinelXSection />
      <HowItWorksSection />
      <UseCasesSection />
      <PricingSection locale={params.locale} />
      <CTASection />
      <Footer locale={params.locale} />
    </main>
  );
}
