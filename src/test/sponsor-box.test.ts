import { describe, it, expect } from 'vitest';
import { sponsorEspee, espeeToCurrency } from '@/lib/sponsorship';
describe('sponsor a box pricing', () => {
  it('10 boxes cost 80 ESPEES', () => expect(sponsorEspee(10)).toBe(80));
  it('scales linearly to 500 boxes', () => { expect(sponsorEspee(50)).toBe(400); expect(sponsorEspee(100)).toBe(800); expect(sponsorEspee(500)).toBe(4000); });
  it('converts to the selected currency', () => expect(espeeToCurrency(80, 'NGN', { ngn_per_espee: 1000 })).toBe(80000));
});
import { SPONSOR_PAYMENT } from '@/lib/sponsorship';
describe('sponsor payment details', () => {
  it('uses the approved ESPEES merchant code and narration', () => { expect(SPONSOR_PAYMENT.merchant_code).toBe('LWCOMPS'); expect(SPONSOR_PAYMENT.narration).toBe('1MBREAKFAST'); });
  it('uses the approved naira account', () => { expect(SPONSOR_PAYMENT.account_name).toBe('CESG COMMERCE-2'); expect(SPONSOR_PAYMENT.account_number).toBe('1000296371'); expect(SPONSOR_PAYMENT.bank_name).toBe('Parallex Bank'); });
});
