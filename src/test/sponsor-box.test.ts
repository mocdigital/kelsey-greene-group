import { describe, it, expect } from 'vitest';
import { sponsorEspee, espeeToCurrency } from '@/components/sponsor-box-dialog';
describe('sponsor a box pricing', () => {
  it('10 boxes cost 80 ESPEES', () => expect(sponsorEspee(10)).toBe(80));
  it('scales linearly to 500 boxes', () => { expect(sponsorEspee(50)).toBe(400); expect(sponsorEspee(100)).toBe(800); expect(sponsorEspee(500)).toBe(4000); });
  it('converts to the selected currency', () => expect(espeeToCurrency(80, 'NGN', { ngn_per_espee: 1000 })).toBe(80000));
});
