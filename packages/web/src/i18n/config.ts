export const locales = ['en', 'de', 'fr', 'it', 'es'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';
