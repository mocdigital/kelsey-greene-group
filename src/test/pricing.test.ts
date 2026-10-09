import {describe,it,expect} from 'vitest';
import {formatPrice,priceInEspee} from '@/lib/pricing';
const rates={ngn_per_espee:2050,usd_per_espee:1.54,ghs_per_espee:18.14};
describe('Marketplace pricing',()=>{
 it('uses ESPEE as the source price',()=>expect(priceInEspee({price_espee:50,price_ngn:1},rates)).toBe(50));
 it('converts all approved currencies',()=>{expect(formatPrice(50,'ESPEE',rates)).toBe('50 ESPEE');expect(formatPrice(50,'NGN',rates)).toContain('102,500.00');expect(formatPrice(50,'USD',rates)).toContain('77.00');expect(formatPrice(50,'GHS',rates)).toContain('907.00');});
 it('responds to edited conversion settings',()=>expect(formatPrice(50,'NGN',{ngn_per_espee:2000})).toContain('100,000.00'));
 it('does not invent missing prices or rates',()=>{expect(formatPrice(null,'ESPEE',rates)).toBe('Price unavailable');expect(formatPrice(50,'USD',{})).toBe('Conversion unavailable');});
});
