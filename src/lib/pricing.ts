export const currencies = ['ESPEE', 'NGN', 'USD', 'GHS'] as const;
export type Currency = typeof currencies[number];
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
 const key = {NGN:'ngn_per_espee',USD:'usd_per_espee',GHS:'ghs_per_espee'}[currency];
 const rate = key ? Number(rates[key]) : 0;
 if (!Number.isFinite(rate) || rate <= 0) return 'Conversion unavailable';
 return new Intl.NumberFormat('en-US', {style:'currency', currency, maximumFractionDigits:2}).format(espee * rate);
}
