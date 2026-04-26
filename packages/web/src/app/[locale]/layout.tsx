import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { routing } from '@/i18n/routing';
import { MetaPixel } from '@/components/MetaPixel';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang={locale} className={inter.variable}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols icon font is intentionally global */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
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
      <body className="min-h-screen bg-gray-50 antialiased">
        <MetaPixel />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
