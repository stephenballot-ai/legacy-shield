import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Link } from '@/i18n/routing';
import { getPostBySlug, getAllSlugs } from '@/lib/blog';
import { Logo } from '@/components/ui/Logo';

interface Props {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return getAllSlugs().map(({ slug, locale }) => ({ slug, locale }));
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const post = getPostBySlug(slug, locale);
  if (!post) return {};

  return {
    title: `${post.title} — LegacyShield`,
    description: post.description,
    keywords: post.keywords.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      locale: locale === 'en' ? 'en_US' : locale,
      siteName: 'LegacyShield',
    },
    alternates: {
      canonical: `https://legacyshield.eu/${locale}/blog/${slug}`,
      languages: {
        'en': `https://legacyshield.eu/en/blog/${slug}`,
        'nl': `https://legacyshield.eu/nl/blog/${slug}`,
        'de': `https://legacyshield.eu/de/blog/${slug}`,
        'fr': `https://legacyshield.eu/fr/blog/${slug}`,
        'it': `https://legacyshield.eu/it/blog/${slug}`,
        'es': `https://legacyshield.eu/es/blog/${slug}`,
        'x-default': `https://legacyshield.eu/en/blog/${slug}`,
      },
    },
  };
}

export default function BlogPostPage({ params: { locale, slug } }: Props) {
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'LegacyShield',
      url: 'https://legacyshield.eu',
    },
    mainEntityOfPage: `https://legacyshield.eu/${locale}/blog/${slug}`,
    keywords: post.keywords.join(', '),
  };

  // FAQ schema for rich snippets (if post has FAQ section)
  const faqJsonLd = post.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item: { q: string; a: string }) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  } : null;

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
            <Link href="/" className="rounded-sm px-2.5 py-1.5 text-fg-muted no-underline transition-colors hover:bg-bg-sunken hover:text-fg">
              Home
            </Link>
            <Link href="/blog" className="rounded-sm px-2.5 py-1.5 text-fg-muted no-underline transition-colors hover:bg-bg-sunken hover:text-fg">
              Notes
            </Link>
            <Link href="/login" className="rounded-sm px-2.5 py-1.5 text-fg-muted no-underline transition-colors hover:bg-bg-sunken hover:text-fg">
              Sign in
            </Link>
            <Link href="/register" className="ls-btn ls-btn--sm ml-2">
              Open a vault
            </Link>
          </nav>
        </div>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="container" style={{ padding: '64px 0 96px', maxWidth: 760 }}>
        <Link
          href="/blog"
          className="t-eyebrow inline-flex items-center gap-2 text-fg-subtle no-underline transition-colors hover:text-accent"
          style={{ marginBottom: 'var(--s-9)' }}
        >
          ← {locale === 'nl' ? 'Terug naar notities' : 'Back to notes'}
        </Link>

        <div className="mb-[var(--s-6)] flex flex-wrap items-center gap-[var(--s-4)] font-mono text-[12px] uppercase tracking-[0.06em] text-fg-subtle">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>

        <h1
          className="font-display text-fg"
          style={{
            fontSize: 'clamp(34px, 4.6vw, 56px)',
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 1.05,
            fontWeight: 400,
            margin: 0,
          }}
        >
          {post.title}
        </h1>
        <p
          className="mt-[var(--s-7)] text-fg-muted"
          style={{ fontSize: 'var(--t-md)', lineHeight: 'var(--lh-loose)' }}
        >
          {post.description}
        </p>

        {post.keywords.length > 0 && (
          <div className="mt-[var(--s-7)] flex flex-wrap gap-[var(--s-4)]">
            {post.keywords.map((kw) => (
              <span
                key={kw}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        <hr style={{ margin: 'var(--s-11) 0', border: 0, borderTop: '1px solid var(--line)' }} />

        <div
          className="prose prose-lg max-w-none"
          style={{
            color: 'var(--fg)',
            fontSize: 'var(--t-md)',
            lineHeight: 'var(--lh-loose)',
            fontFamily: 'var(--font-sans)',
            ['--tw-prose-body' as any]: 'var(--fg)',
            ['--tw-prose-headings' as any]: 'var(--fg)',
            ['--tw-prose-links' as any]: 'var(--accent)',
            ['--tw-prose-bold' as any]: 'var(--fg)',
            ['--tw-prose-quotes' as any]: 'var(--fg-muted)',
            ['--tw-prose-quote-borders' as any]: 'var(--accent)',
            ['--tw-prose-captions' as any]: 'var(--fg-subtle)',
            ['--tw-prose-code' as any]: 'var(--fg)',
            ['--tw-prose-pre-bg' as any]: 'var(--bg-inset)',
            ['--tw-prose-bullets' as any]: 'var(--fg-subtle)',
            ['--tw-prose-counters' as any]: 'var(--fg-subtle)',
            ['--tw-prose-hr' as any]: 'var(--line)',
          }}
        >
          <MDXRemote source={post.content} />
        </div>

        <div
          className="mt-[var(--s-13)] ls-surface ls-surface--ink"
          style={{ padding: 'var(--s-10)' }}
        >
          <span className="t-eyebrow" style={{ color: 'var(--accent)' }}>
            § Custody begins
          </span>
          <h2
            className="mt-[var(--s-5)] font-display"
            style={{
              fontSize: 'var(--t-2xl)',
              letterSpacing: 'var(--tracking-snug)',
              color: 'var(--ls-bone-soft)',
              margin: 0,
              lineHeight: 'var(--lh-snug)',
            }}
          >
            {locale === 'nl'
              ? 'Beveilig je documenten — gratis.'
              : 'Place your documents in custody — free.'}
          </h2>
          <p
            className="mt-[var(--s-5)]"
            style={{
              maxWidth: '52ch',
              color: 'var(--ls-bone-soft)',
              opacity: 0.78,
              fontSize: 'var(--t-sm)',
              lineHeight: 'var(--lh-loose)',
            }}
          >
            {locale === 'nl'
              ? 'Zero-knowledge encryptie, noodtoegang voor dierbaren, EU-hosting.'
              : 'Zero-knowledge encryption, designated heirs, EU-only infrastructure.'}
          </p>
          <Link
            href="/register"
            className="ls-btn ls-btn--accent ls-btn--lg mt-[var(--s-7)]"
          >
            {locale === 'nl' ? 'Gratis beginnen' : 'Open a vault'}
          </Link>
        </div>
      </article>

      <footer className="border-t border-line">
        <div
          className="container flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-fg-subtle"
          style={{ padding: '32px var(--gutter)' }}
        >
          <span>© {new Date().getFullYear()} LegacyShield · EU custody</span>
          <Link href="/blog" className="text-fg-subtle no-underline hover:text-accent">
            More notes
          </Link>
        </div>
      </footer>
    </div>
  );
}
