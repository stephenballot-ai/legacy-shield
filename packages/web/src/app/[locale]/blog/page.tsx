import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { getAllPosts } from '@/lib/blog';
import { Logo } from '@/components/ui/Logo';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const titles: Record<string, string> = {
    en: 'Notes — LegacyShield',
    nl: 'Notities — LegacyShield',
    de: 'Notizen — LegacyShield',
    fr: 'Notes — LegacyShield',
    it: 'Note — LegacyShield',
    es: 'Notas — LegacyShield',
  };
  const descriptions: Record<string, string> = {
    en: 'Notes on digital estate planning, secure document custody, and protecting your digital legacy.',
    nl: 'Notities over digitale nalatenschapsplanning, veilige documentopslag en het beschermen van je digitale nalatenschap.',
    de: 'Notizen zur digitalen Nachlassplanung, sicheren Dokumentenaufbewahrung und zum Schutz Ihres digitalen Erbes.',
    fr: 'Notes sur la planification successorale numérique et la garde sécurisée des documents.',
    it: 'Note sulla pianificazione patrimoniale digitale e la custodia sicura dei documenti.',
    es: 'Notas sobre planificación patrimonial digital y custodia segura de documentos.',
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
    <div className="min-h-screen bg-bg text-fg">
      <header
        className="border-b border-line"
        style={{
          background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
          backdropFilter: 'blur(12px) saturate(140%)',
        }}
      >
        <div
          className="container flex items-center justify-between"
          style={{ padding: '14px var(--gutter)' }}
        >
          <Link href="/" className="no-underline">
            <Logo size="sm" />
          </Link>
          <nav className="flex items-center gap-[var(--s-2)] text-[13px]">
            <Link
              href="/"
              className="rounded-sm px-2.5 py-1.5 text-fg-muted no-underline transition-colors hover:bg-bg-sunken hover:text-fg"
            >
              Home
            </Link>
            <span
              className="rounded-sm px-2.5 py-1.5 text-fg"
              style={{ background: 'var(--bg-sunken)' }}
            >
              Notes
            </span>
            <Link
              href="/login"
              className="rounded-sm px-2.5 py-1.5 text-fg-muted no-underline transition-colors hover:bg-bg-sunken hover:text-fg"
            >
              Sign in
            </Link>
            <Link href="/register" className="ls-btn ls-btn--sm ml-2">
              Open a vault
            </Link>
          </nav>
        </div>
      </header>

      <section
        className="border-b border-line"
        style={{
          padding: '88px 0 72px',
          background:
            'radial-gradient(900px 320px at 80% -100px, color-mix(in oklab, var(--accent) 8%, transparent), transparent 60%), linear-gradient(180deg, var(--bg-sunken), var(--bg) 60%)',
        }}
      >
        <div className="container">
          <span className="t-eyebrow text-fg-subtle">§ Notes — vol. {posts.length}</span>
          <h1
            className="mt-[var(--s-7)] font-display text-fg"
            style={{
              fontSize: 'clamp(40px, 5vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: 'var(--tracking-tight)',
              fontWeight: 400,
              margin: 0,
              maxWidth: '20ch',
            }}
          >
            Field notes on digital{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--accent)',
                fontFamily: 'var(--font-display)',
              }}
            >
              custody
            </em>
            .
          </h1>
          <p
            className="mt-[var(--s-7)] text-fg-muted"
            style={{
              fontSize: 'var(--t-md)',
              lineHeight: 'var(--lh-loose)',
              maxWidth: '54ch',
            }}
          >
            {locale === 'nl'
              ? 'Notities over digitale nalatenschapsplanning, encryptie en het beschermen van wat belangrijk is.'
              : 'Quiet writing on digital estate planning, encryption, and the protection of what outlives us.'}
          </p>
        </div>
      </section>

      <section className="container" style={{ padding: '72px 0 96px' }}>
        {posts.length === 0 ? (
          <div className="ls-empty">
            <div className="ls-empty__crest">L</div>
            <h2 className="ls-empty__title">The archive is awaiting its first note.</h2>
            <p className="ls-empty__body">Check back soon.</p>
          </div>
        ) : (
          <ol
            className="m-0 grid list-none gap-px overflow-hidden p-0"
            style={{ borderTop: '1px solid var(--line-ink)' }}
          >
            {posts.map((post, i) => (
              <li
                key={post.slug}
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <Link
                  href={`/blog/${post.slug}` as any}
                  className="group grid items-baseline gap-[var(--s-7)] py-[var(--s-9)] no-underline transition-colors hover:bg-bg-sunken md:grid-cols-[80px_1fr_220px]"
                >
                  <span className="font-mono text-[12px] tracking-[0.08em] text-fg-subtle">
                    № {String(i + 1).padStart(3, '0')}
                  </span>
                  <div className="min-w-0">
                    <h2
                      className="font-display text-fg transition-colors group-hover:text-accent"
                      style={{
                        fontSize: 'var(--t-2xl)',
                        letterSpacing: 'var(--tracking-snug)',
                        lineHeight: 'var(--lh-snug)',
                        margin: 0,
                        fontWeight: 400,
                      }}
                    >
                      {post.title}
                    </h2>
                    <p
                      className="mt-[var(--s-4)] text-fg-muted"
                      style={{
                        fontSize: 'var(--t-sm)',
                        lineHeight: 'var(--lh-loose)',
                        maxWidth: '60ch',
                      }}
                    >
                      {post.description}
                    </p>
                    {post.keywords.slice(0, 3).length > 0 && (
                      <div className="mt-[var(--s-5)] flex flex-wrap gap-[var(--s-3)]">
                        {post.keywords.slice(0, 3).map((kw) => (
                          <span
                            key={kw}
                            className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-fg-subtle md:text-right">
                    <time
                      dateTime={post.date}
                      className="block font-mono text-[12px] tracking-[0.04em]"
                    >
                      {new Date(post.date).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })}
                    </time>
                    <span className="mt-1 block font-mono text-[11px] text-fg-subtle">
                      {post.readingTime}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="border-t border-line">
        <div
          className="container flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-fg-subtle"
          style={{ padding: '32px var(--gutter)' }}
        >
          <span>© {new Date().getFullYear()} LegacyShield · EU custody</span>
          <Link href="/" className="text-fg-subtle no-underline hover:text-accent">
            Return to vault
          </Link>
        </div>
      </footer>
    </div>
  );
}
