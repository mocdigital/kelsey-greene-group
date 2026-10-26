// Built-in currencies; extra currencies are added globally in CMS currency settings (payload.currencies).
export const currencies = ['ESPEE', 'NGN'] as const;
export type Currency = string;
export type CurrencyOption = { code: string; label: string; per_espee: number };
const BUILT_IN_LABELS: Record<string, string> = { ESPEE: 'ESPEE', NGN: 'Naira (NGN)' };
export function extraCurrencies(rates: Record<string, unknown>): CurrencyOption[] {
 const list = Array.isArray(rates['currencies']) ? rates['currencies'] as Record<string, unknown>[] : [];
 const seen = new Set<string>(currencies);
 return list.map(c => ({ code: String(c['code'] ?? '').trim().toUpperCase(), label: String(c['label'] ?? '').trim(), per_espee: Number(c['per_espee']) || 0 }))
  .filter(c => /^[A-Z]{2,6}$/.test(c.code) && c.per_espee > 0 && !seen.has(c.code) && (seen.add(c.code), true));
}
export function currencyOptions(rates: Record<string, unknown>) {
 return [...currencies.map(code => ({ code, label: BUILT_IN_LABELS[code] ?? code })), ...extraCurrencies(rates).map(c => ({ code: c.code, label: c.label || c.code }))];
}
export function rateFor(currency: string, rates: Record<string, unknown>) {
 if (currency === 'ESPEE') return 1;
 if (currency === 'NGN') return Number(rates['ngn_per_espee']) || 0;
 return extraCurrencies(rates).find(c => c.code === currency)?.per_espee ?? 0;
}
export function formatNgnPrice(amount: number, currency: string, rates: Record<string, unknown>) {
 const rate = Number(rates['ngn_per_espee']);
 return Number.isFinite(rate) && rate > 0 ? formatPrice(amount / rate, currency, rates) : 'Conversion unavailable';
}
export function priceInEspee(product: Record<string, unknown>, rates: Record<string, unknown>) {
 const direct = Number(product['price_espee']);
 if (product['price_espee'] != null && Number.isFinite(direct) && direct >= 0) return direct;
 const ngn = Number(product['price_ngn']), rate = Number(rates['ngn_per_espee']);
 return Number.isFinite(ngn) && rate > 0 ? ngn / rate : null;
}
export function formatPrice(espee: number | null, currency: string, rates: Record<string, unknown>) {
 if (espee === null) return 'Price unavailable';
 if (currency === 'ESPEE') return `${espee.toLocaleString('en-US', {maximumFractionDigits:2})} ESPEE`;
 const rate = rateFor(currency, rates);
 if (!Number.isFinite(rate) || rate <= 0) return 'Conversion unavailable';
 const value = espee * rate;
 try { return new Intl.NumberFormat('en-US', {style:'currency', currency, maximumFractionDigits:2}).format(value); }
 catch { return `${value.toLocaleString('en-US', {maximumFractionDigits:2})} ${currency}`; }
}
