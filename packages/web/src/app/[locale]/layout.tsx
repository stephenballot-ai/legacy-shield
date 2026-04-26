import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { routing } from '@/i18n/routing';
import { MetaPixel } from '@/components/MetaPixel';
import './globals.css';

// Fonts: loaded via <link> in <head> below.
// Geist isn't available in next/font/google on Next 14.1, so we keep all three on
// Google Fonts CDN (matches the design system handover HTML).
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: 'document vault, encryption, estate planning, emergency access, GDPR, privacy, digital legacy',
    authors: [{ name: 'Legacy Shield Team' }],
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'en' ? 'en_US' : locale,
      siteName: 'LegacyShield',
      url: `https://legacyshield.eu/${locale}`,
    },
    alternates: {
      canonical: `https://legacyshield.eu/${locale}`,
      languages: {
        'en': 'https://legacyshield.eu/en',
        'nl': 'https://legacyshield.eu/nl',
        'de': 'https://legacyshield.eu/de',
        'fr': 'https://legacyshield.eu/fr',
        'it': 'https://legacyshield.eu/it',
        'es': 'https://legacyshield.eu/es',
        'x-default': 'https://legacyshield.eu/en',
      },
    },
    verification: {
      google: 'rCaiCC_VLBMV6hyyB8NAQwNWMGZKxLGQaGeF2fjfHiQ',
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return (
    <html lang={locale} data-theme="light" data-display="serif">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- design system fonts are intentionally global */}
        <link rel="stylesheet" href={FONTS_HREF} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              'name': 'LegacyShield',
              'operatingSystem': 'Web',
              'applicationCategory': 'SecurityApplication',
              'description': t('description'),
              'isBasedOn': 'https://bitatlas.com',
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'EUR'
              },
              'author': {
                '@type': 'Organization',
                'name': 'LegacyShield Team',
                'url': 'https://legacyshield.eu'
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <MetaPixel />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
