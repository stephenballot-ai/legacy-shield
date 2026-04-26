import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import { Shield, Lock, Server, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'continuity.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://legacyshield.eu/${locale === 'en' ? '' : locale + '/'}continuity`,
    },
  };
}

function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link href="/">
          <Logo size="sm" variant="dark" />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-trust-300 transition-colors">Home</Link>
          <Link href="/blog" className="hover:text-trust-300 transition-colors">Blog</Link>
          <Link href="/login" className="hover:text-trust-300 transition-colors">Sign In</Link>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  const t = useTranslations('continuity.hero');
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white py-20 sm:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Shield className="h-16 w-16 text-trust-400 mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          {t('title')}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>
    </section>
  );
}

function ShutdownSection() {
  const t = useTranslations('continuity.shutdown');
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-8">
          <div className="flex-shrink-0 bg-trust-100 rounded-xl p-3">
            <AlertTriangle className="h-7 w-7 text-trust-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-fg mb-4">{t('title')}</h2>
            <p className="text-lg text-fg-muted mb-6">{t('intro')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point1.title')}</h3>
              <p className="text-fg-muted">{t('point1.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point2.title')}</h3>
              <p className="text-fg-muted">{t('point2.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point3.title')}</h3>
              <p className="text-fg-muted">{t('point3.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point4.title')}</h3>
              <p className="text-fg-muted">{t('point4.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point5.title')}</h3>
              <p className="text-fg-muted">{t('point5.desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HackedSection() {
  const t = useTranslations('continuity.hacked');
  return (
    <section className="py-20 bg-bg-sunken">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-8">
          <div className="flex-shrink-0 bg-primary-100 rounded-xl p-3">
            <Lock className="h-7 w-7 text-primary-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-fg mb-4">{t('title')}</h2>
            <p className="text-lg text-fg-muted mb-6">{t('intro')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point1.title')}</h3>
              <p className="text-fg-muted">{t('point1.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point2.title')}</h3>
              <p className="text-fg-muted">{t('point2.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point3.title')}</h3>
              <p className="text-fg-muted">{t('point3.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point4.title')}</h3>
              <p className="text-fg-muted">{t('point4.desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyLawsSection() {
  const t = useTranslations('continuity.privacyLaws');
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-8">
          <div className="flex-shrink-0 bg-navy-100 rounded-xl p-3">
            <Server className="h-7 w-7 text-navy-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-fg mb-4">{t('title')}</h2>
            <p className="text-lg text-fg-muted mb-6">{t('intro')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point1.title')}</h3>
              <p className="text-fg-muted">{t('point1.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point2.title')}</h3>
              <p className="text-fg-muted">{t('point2.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point3.title')}</h3>
              <p className="text-fg-muted">{t('point3.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point4.title')}</h3>
              <p className="text-fg-muted">{t('point4.desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommitmentSection() {
  const t = useTranslations('continuity.commitment');
  return (
    <section className="py-20 bg-bg-sunken">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-8">
          <div className="flex-shrink-0 bg-accent-100 rounded-xl p-3">
            <Eye className="h-7 w-7 text-accent-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-fg mb-4">{t('title')}</h2>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point1.title')}</h3>
              <p className="text-fg-muted">{t('point1.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point2.title')}</h3>
              <p className="text-fg-muted">{t('point2.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point3.title')}</h3>
              <p className="text-fg-muted">{t('point3.desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-trust-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-fg mb-1">{t('point4.title')}</h3>
              <p className="text-fg-muted">{t('point4.desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations('continuity.cta');
  return (
    <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-navy-900 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          {t('title')}
        </h2>
        <p className="text-lg text-white/80 mb-8">
          {t('subtitle')}
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent-400 text-primary-900 font-semibold text-lg hover:bg-accent-500 transition-colors shadow-lg"
        >
          {t('button')}
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-fg-muted">
        © {new Date().getFullYear()} LegacyShield. All rights reserved.
      </div>
    </footer>
  );
}

export default function ContinuityPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ShutdownSection />
      <HackedSection />
      <PrivacyLawsSection />
      <CommitmentSection />
      <CTASection />
      <Footer />
    </div>
  );
}
