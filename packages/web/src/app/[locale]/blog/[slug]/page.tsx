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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-900 via-primary-800 to-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" variant="dark" />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-trust-300 transition-colors">Home</Link>
            <Link href="/blog" className="text-accent-400 hover:text-accent-300 transition-colors">Blog</Link>
            <Link href="/login" className="hover:text-trust-300 transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium mb-8">
          ← {locale === 'nl' ? 'Terug naar blog' : 'Back to blog'}
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span>·</span>
          <span>{post.readingTime}</span>
          <span>·</span>
          <span>{post.author}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          {post.description}
        </p>

        {/* Keywords */}
        <div className="mt-6 flex flex-wrap gap-2">
          {post.keywords.map((kw) => (
            <span key={kw} className="text-xs bg-primary-50 text-primary-700 rounded-full px-3 py-1 font-medium">
              {kw}
            </span>
          ))}
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Content */}
        <div className="prose prose-lg prose-navy max-w-none prose-headings:text-navy-900 prose-headings:font-bold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-navy-800">
          <MDXRemote source={post.content} />
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-navy-900 to-primary-900 p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl font-bold">
            {locale === 'nl'
              ? 'Beveilig je documenten gratis'
              : 'Secure your documents for free'}
          </h2>
          <p className="mt-3 text-white/70 max-w-lg mx-auto">
            {locale === 'nl'
              ? 'Begin vandaag met LegacyShield. Zero-knowledge encryptie, noodtoegang voor je dierbaren, en altijd gratis te gebruiken.'
              : 'Start with LegacyShield today. Zero-knowledge encryption, emergency access for your loved ones, and always free to use.'}
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-accent-400 text-primary-900 font-semibold text-lg hover:bg-accent-500 transition-colors shadow-lg shadow-black/20"
          >
            {locale === 'nl' ? 'Gratis beginnen' : 'Get Started Free'}
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} LegacyShield. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
