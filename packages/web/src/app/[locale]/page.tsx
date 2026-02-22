'use client';

import { Link } from '@/i18n/routing';
import { useMemo } from 'react';
import { Shield, Lock, Users, Server, Upload, UserPlus, CheckCircle, Heart } from 'lucide-react';
import { getCurrency } from '@/lib/utils/currency';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';

function HeroSection() {
  const t = useTranslations('homepage.hero');
  const user = useAuthStore((s) => s.user);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 lg:py-40">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Shield className="h-4 w-4 text-trust-400" />
            <span>{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            {t.rich('subtitle', {
              strongItem: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent-400 text-primary-900 font-semibold text-lg hover:bg-accent-500 transition-colors shadow-lg shadow-black/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent-400 text-primary-900 font-semibold text-lg hover:bg-accent-500 transition-colors shadow-lg shadow-black/20"
                >
                  {t('ctaPrimary')}
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
                >
                  {t('ctaSecondary')}
                </a>
              </>
            )}
          </div>
          {!user && <p className="mt-4 text-sm text-white/50">{t('disclaimer')}</p>}
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { icon: '🇪🇺', label: 'European-Owned Infrastructure' },
    { icon: '🔐', label: 'Zero-Knowledge Encryption' },
    { icon: '🛡️', label: 'AES-256-GCM' },
    { icon: '✅', label: 'GDPR-native' },
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
  const t = useTranslations('homepage.features');
  const features = [
    {
      icon: Lock,
      title: t('encryption.title'),
      description: t('encryption.desc'),
      color: 'bg-primary-100 text-primary-700',
    },
    {
      icon: Users,
      title: t('emergency.title'),
      description: t('emergency.desc'),
      color: 'bg-trust-100 text-trust-700',
    },
    {
      icon: Server,
      title: t('hosting.title'),
      description: t('hosting.desc'),
      color: 'bg-navy-100 text-navy-700',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('sectionTitle')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('sectionSubtitle')}
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

function ProofOfPrivacySection() {
  const t = useTranslations('homepage.proof');
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Encryption Visual */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 space-y-6">
            {/* Your Device */}
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-trust-600 bg-trust-50 px-3 py-1 rounded-full">{t('visual.yourDevice')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-sm font-medium text-gray-900">my-will.pdf</p>
                <p className="text-xs text-gray-400 mt-1">{t('visual.originalFile')}</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="flex-1 bg-primary-900 rounded-xl p-4 text-center">
                <p className="text-sm font-mono text-primary-300 break-all">a7f2c9e8b1d4...</p>
                <p className="text-xs text-primary-400 mt-1">{t('visual.encryptedFile')}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="border-t-2 border-dashed border-gray-300" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-4">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Our Servers */}
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{t('visual.ourServers')}</span>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <p className="text-sm font-mono text-gray-400 break-all">a7f2c9e8b1d4f6a2e8c1b9d3f7a5...</p>
              <p className="text-xs text-gray-400 mt-1">{t('visual.blindText')}</p>
            </div>
          </div>
        </div>

        {/* Three proof points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="text-3xl mb-4">🔑</div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('points.keys.title')}</h3>
            <p className="text-sm text-gray-600">{t('points.keys.desc')}</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-4">🚫</div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('points.noReset.title')}</h3>
            <p className="text-sm text-gray-600">{t('points.noReset.desc')}</p>
          </div>
          <div className="text-center p-6">
            <div className="text-3xl mb-4">⚖️</div>
            <h3 className="font-semibold text-gray-900 mb-2">{t('points.noHandover.title')}</h3>
            <p className="text-sm text-gray-600">{t('points.noHandover.desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ id = 'how-it-works' }: { id?: string }) {
  const t = useTranslations('homepage.howItWorks');
  const steps = [
    { icon: Upload, step: '1', title: t('step1.title'), description: t('step1.desc') },
    { icon: UserPlus, step: '2', title: t('step2.title'), description: t('step2.desc') },
    { icon: CheckCircle, step: '3', title: t('step3.title'), description: t('step3.desc') },
  ];

  return (
    <section id={id} className="py-12 sm:py-20 bg-gray-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('subtitle')}
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
  const t = useTranslations('homepage.useCases');
  const cases = [
    { icon: '🛂', key: 'passports' },
    { icon: '📜', key: 'wills' },
    { icon: '🏠', key: 'property' },
    { icon: '💼', key: 'insurance' },
    { icon: '🏥', key: 'medical' },
    { icon: '💰', key: 'financial' },
    { icon: '🔑', key: 'crypto' },
    { icon: '📋', key: 'tax' },
  ];

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cases.map((c) => (
            <div key={c.key} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-2xl">{c.icon}</span>
              <span className="font-medium text-gray-800 text-sm">{t(`items.${c.key}`)}</span>
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
    <section className="py-12 sm:py-20 bg-gray-50" id="pricing">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900">{t('free.name')}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">{currency.symbol}0</span>
              <span className="text-gray-500 ml-1">{t('free.period')}</span>
            </div>
            <ul className="mt-8 space-y-3">
              {freeFeatures.map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-trust-500 flex-shrink-0" />
                  {t(`free.features.${key}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full text-center px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('free.cta')}
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl border-2 border-accent-400 p-8 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-400 text-primary-900 text-xs font-bold px-3 py-1 rounded-full">
              {t('pro.badge')}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('pro.name')}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">{currency.symbol}{currency.monthly}</span>
              <span className="text-gray-500 ml-1">{t('pro.period')}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('pro.lifetime', { symbol: currency.symbol, price: currency.lifetime })}</p>
            <ul className="mt-8 space-y-3">
              {proFeatures.map((key) => (
                <li key={key} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-trust-500 flex-shrink-0" />
                  {t(`pro.features.${key}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full text-center px-6 py-3 rounded-xl bg-accent-400 text-primary-900 font-semibold hover:bg-accent-500 transition-colors"
            >
              {t('pro.cta')}
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
    <section className="py-12 sm:py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <Heart className="h-12 w-12 mx-auto mb-6 text-trust-400" />
        <h2 className="text-3xl sm:text-4xl font-bold">
          {t('title')}
        </h2>
        <p className="mt-4 text-lg text-white/80">
          {t('subtitle')}
        </p>
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

function Footer() {
  const t = useTranslations('homepage.footer');
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-400" />
            <span className="font-semibold text-white">LegacyShield</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition-colors">{t('blog')}</Link>
            <Link href="/faq" className="hover:text-white transition-colors">{t('faq')}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('terms')}</Link>
          </div>
          <p className="text-sm">
            {t('tagline')} 🇪🇺
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <ProofOfPrivacySection />
      <HowItWorksSection />
      <UseCasesSection />
      <PricingSection locale={params.locale} />
      <CTASection />
      <Footer />
    </main>
  );
}
