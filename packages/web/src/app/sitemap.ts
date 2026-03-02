import { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/blog';

const BASE_URL = 'https://legacyshield.eu';
const locales = ['en', 'de', 'fr', 'it', 'es', 'nl'];

// All public pages — ADD NEW PAGES HERE
// This is the single source of truth for the sitemap.
const staticPages = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/made-in-eu', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/letter-of-wishes', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'monthly' as const },
];

// Pages that only exist for specific locales
const localeSpecificPages: { path: string; locales: string[]; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '/notaris', locales: ['nl'], priority: 0.8, changeFrequency: 'weekly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages across all locales
  for (const page of staticPages) {
    for (const locale of locales) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${prefix}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // Locale-specific pages
  for (const page of localeSpecificPages) {
    for (const locale of page.locales) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      entries.push({
        url: `${BASE_URL}${prefix}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // Blog posts (auto-discovered from content files)
  const slugs = getAllSlugs();
  for (const { slug, locale } of slugs) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    entries.push({
      url: `${BASE_URL}${prefix}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    });
  }

  return entries;
}
