import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getAllPosts } from '@/lib/blog';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    en: 'Blog — LegacyShield',
    nl: 'Blog — LegacyShield',
    de: 'Blog — LegacyShield',
    fr: 'Blog — LegacyShield',
    it: 'Blog — LegacyShield',
    es: 'Blog — LegacyShield',
  };
  const descriptions: Record<string, string> = {
    en: 'Tips and guides on digital estate planning, secure document storage, and protecting your digital legacy.',
    nl: 'Tips en gidsen over digitale nalatenschapsplanning, veilige documentopslag en het beschermen van je digitale nalatenschap.',
    de: 'Tipps und Leitfäden zur digitalen Nachlassplanung, sicheren Dokumentenaufbewahrung und zum Schutz Ihres digitalen Erbes.',
    fr: 'Conseils et guides sur la planification successorale numérique et le stockage sécurisé de documents.',
    it: 'Consigli e guide sulla pianificazione patrimoniale digitale e l&apos;archiviazione sicura dei documenti.',
    es: 'Consejos y guías sobre planificación patrimonial digital y almacenamiento seguro de documentos.',
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: `https://legacyshield.eu/${locale}/blog`,
    },
  };
}

export default function BlogListingPage({ params: { locale } }: { params: { locale: string } }) {
  const posts = getAllPosts(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-900 via-primary-800 to-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            🛡️ LegacyShield
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-trust-300 transition-colors">Home</Link>
            <span className="text-accent-400">Blog</span>
            <Link href="/login" className="hover:text-trust-300 transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 to-primary-900 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {locale === 'nl' ? 'LegacyShield Blog' : 'LegacyShield Blog'}
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            {locale === 'nl'
              ? 'Inzichten over digitale nalatenschapsplanning, encryptie en het beschermen van wat belangrijk is.'
              : 'Insights on digital estate planning, encryption, and protecting what matters most.'}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            {locale === 'nl' ? 'Nog geen artikelen beschikbaar.' : 'No articles available yet.'}
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-2xl border border-gray-200 hover:border-trust-400 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-navy-900 group-hover:text-primary-600 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.keywords.slice(0, 3).map((kw) => (
                      <span key={kw} className="inline-block text-xs bg-primary-50 text-primary-700 rounded-full px-2.5 py-0.5 font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} LegacyShield. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
