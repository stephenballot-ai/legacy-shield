/**
 * Locale-based currency detection
 * US locales get USD ($), everyone else gets EUR (€)
 */

export interface CurrencyInfo {
  symbol: string;
  code: string;
  monthly: number;
  lifetime: number;
}

const USD: CurrencyInfo = { symbol: '$', code: 'USD', monthly: 10, lifetime: 500 };
const EUR: CurrencyInfo = { symbol: '€', code: 'EUR', monthly: 10, lifetime: 500 };

export function getCurrency(locale?: string): CurrencyInfo {
  // If locale is specifically provided (e.g. from URL), use it
  if (locale) {
    if (locale === 'en') return USD;
    return EUR; // nl, de, fr, it, es
  }

  // Fallback to browser detection if no locale param
  if (typeof navigator === 'undefined') return EUR; 
  const lang = navigator.language || '';
  if (/[-_]US$/i.test(lang)) return USD;
  return EUR;
}
