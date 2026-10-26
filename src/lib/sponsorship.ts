import { rateFor } from '@/lib/pricing';

export const SPONSOR_BOX_OPTIONS = [10, 50, 100, 500] as const;
export const ESPEE_PER_BOX = 8;
export const sponsorEspee = (boxes: number) => boxes * ESPEE_PER_BOX;
export const SPONSOR_PAYMENT = { merchant_code: 'LWCOMPS', narration: '1MBREAKFAST', account_name: 'CESG COMMERCE-2', account_number: '1000296371', bank_name: 'Parallex Bank' } as const;
export function espeeToCurrency(espee: number, currency: string, rates: Record<string, unknown>) {
  if (currency === 'ESPEE') return espee;
  const rate = rateFor(currency, rates);
  return rate > 0 ? Math.round(espee * rate * 100) / 100 : 0;
}

