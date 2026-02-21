import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { routing } from '@/i18n/routing';
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
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
