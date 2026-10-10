import {describe,it,expect} from 'vitest';
import {formatPrice,priceInEspee} from '@/lib/pricing';
const rates={ngn_per_espee:2050,usd_per_espee:1.54,ghs_per_espee:18.14};
describe('Marketplace pricing',()=>{
 it('uses ESPEE as the source price',()=>expect(priceInEspee({price_espee:50,price_ngn:1},rates)).toBe(50));
 it('converts all approved currencies',()=>{expect(formatPrice(50,'ESPEE',rates)).toBe('50 ESPEE');expect(formatPrice(50,'NGN',rates)).toContain('102,500.00');expect(formatPrice(50,'USD',rates)).toContain('77.00');expect(formatPrice(50,'GHS',rates)).toContain('907.00');});
 it('responds to edited conversion settings',()=>expect(formatPrice(50,'NGN',{ngn_per_espee:2000})).toContain('100,000.00'));
 it('does not invent missing prices or rates',()=>{expect(formatPrice(null,'ESPEE',rates)).toBe('Price unavailable');expect(formatPrice(50,'USD',{})).toBe('Conversion unavailable');});
});

import { campaignState, subscriptionEligible } from '@/lib/growth';
describe('campaign milestones', () => {
  it('marks reached, next and upcoming milestones with remaining count', () => {
    const s = campaignState(60000, 1000000, [10000, 50000, 100000, 250000]);
    expect(s.remaining).toBe(940000);
    expect(s.milestones.map(m => m.status)).toEqual(['reached', 'reached', 'next', 'upcoming']);
    expect(s.milestones[2]?.progress).toBe(60);
    expect(s.latestReached).toBe(50000);
  });
  it('never offers subscriptions on property listings', () => {
    expect(subscriptionEligible({ listing_type: 'property' })).toBe(false);
    expect(subscriptionEligible({ business_slug: 'foods-agro-allied' })).toBe(true);
  });
});
