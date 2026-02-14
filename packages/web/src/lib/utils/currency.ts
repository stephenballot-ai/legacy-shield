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

export function getCurrency(): CurrencyInfo {
  if (typeof navigator === 'undefined') return EUR; // SSR default
  const lang = navigator.language || '';
  // en-US, en-us, or any locale ending in -US
  if (/[-_]US$/i.test(lang)) return USD;
  return EUR;
}
