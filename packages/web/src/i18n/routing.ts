import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'de', 'fr', 'it', 'es', 'nl'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

// Lightweight wrappers around Next.js' navigation APIs
// that consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
