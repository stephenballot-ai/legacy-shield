import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';
import { NotaryFinder } from './NotaryFinder';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const titles: Record<string, string> = {
    nl: 'Notaris Zoeken — Vind een Notaris bij jou in de buurt | LegacyShield',
    en: 'Find a Notary — Find a Notary Near You | LegacyShield',
    de: 'Notar Finden — Finden Sie einen Notar in Ihrer Nähe | LegacyShield',
    fr: 'Trouver un Notaire — Trouvez un Notaire près de chez vous | LegacyShield',
    it: 'Trova un Notaio — Trova un Notaio vicino a te | LegacyShield',
    es: 'Buscar Notario — Encuentra un Notario cerca de ti | LegacyShield',
  };
  const descriptions: Record<string, string> = {
    nl: 'Vergelijk notarissen in heel Nederland. Vind een notaris voor testament, erfrecht, vastgoed en meer.',
    en: 'Compare notaries across the Netherlands. Find a notary for wills, estate law, real estate and more.',
    de: 'Vergleichen Sie Notare in den Niederlanden. Finden Sie einen Notar für Testamente, Erbrecht, Immobilien und mehr.',
    fr: 'Comparez les notaires aux Pays-Bas. Trouvez un notaire pour testaments, droit successoral, immobilier et plus.',
    it: 'Confronta notai nei Paesi Bassi. Trova un notaio per testamenti, diritto successorio, immobiliare e altro.',
    es: 'Compara notarios en los Países Bajos. Encuentra un notario para testamentos, derecho sucesorio, bienes raíces y más.',
  };
  return {
    title: titles[locale] || titles.nl,
    description: descriptions[locale] || descriptions.nl,
    alternates: {
      canonical: `https://legacyshield.eu/${locale}/notaris`,
    },
  };
}

export default function NotarisPage({ params }: Props) {
  const { locale } = params;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-900 via-primary-800 to-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" variant="dark" />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-trust-300 transition-colors">
              {locale === 'nl' ? 'Home' : 'Home'}
            </Link>
            <Link
              href="/notaris"
              className="text-accent-400 hover:text-accent-300 transition-colors"
            >
              {locale === 'nl' ? 'Vind een Notaris' : 'Find a Notary'}
            </Link>
            <Link href="/login" className="hover:text-trust-300 transition-colors">
              {locale === 'nl' ? 'Inloggen' : 'Sign In'}
            </Link>
          </nav>
        </div>
      </header>

      <NotaryFinder />

      {/* Bottom CTA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-primary-900 p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl font-bold">
            {locale === 'nl'
              ? 'Je testament veilig opslaan?'
              : 'Store your will securely?'}
          </h2>
          <p className="mt-3 text-white/70 max-w-lg mx-auto">
            {locale === 'nl'
              ? 'Bewaar je testament en belangrijke documenten veilig met zero-knowledge encryptie. Altijd gratis.'
              : 'Store your will and important documents securely with zero-knowledge encryption. Always free.'}
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent-400 text-primary-900 font-semibold text-lg hover:bg-accent-500 transition-colors shadow-lg shadow-black/20"
          >
            {locale === 'nl' ? 'Gratis beginnen' : 'Get Started Free'}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} LegacyShield. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
