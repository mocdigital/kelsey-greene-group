import {describe,it,expect} from 'vitest';
import {formatPrice,formatNgnPrice,priceInEspee,currencyOptions} from '@/lib/pricing';
const rates={ngn_per_espee:2050,currencies:[{code:'USD',label:'US dollar',per_espee:1.54},{code:'GHS',label:'Cedis',per_espee:18.14}]};
describe('Marketplace pricing',()=>{
 it('uses ESPEE as the source price',()=>expect(priceInEspee({price_espee:50,price_ngn:1},rates)).toBe(50));
 it('converts built-in and admin-added currencies',()=>{expect(formatPrice(50,'ESPEE',rates)).toBe('50 ESPEE');expect(formatPrice(50,'NGN',rates)).toContain('102,500.00');expect(formatPrice(50,'USD',rates)).toContain('77.00');expect(formatPrice(50,'GHS',rates)).toContain('907.00');});
 it('only offers ESPEE and NGN unless more are added in settings',()=>{expect(currencyOptions({ngn_per_espee:2050}).map(c=>c.code)).toEqual(['ESPEE','NGN']);expect(currencyOptions(rates).map(c=>c.code)).toEqual(['ESPEE','NGN','USD','GHS']);});
 it('ignores legacy USD/GHS rates that are no longer listed',()=>expect(formatPrice(50,'USD',{usd_per_espee:1.5})).toBe('Conversion unavailable'));
 it('responds to edited conversion settings',()=>expect(formatPrice(50,'NGN',{ngn_per_espee:2000})).toContain('100,000.00'));
 it('does not invent missing prices or rates',()=>{expect(formatPrice(null,'ESPEE',rates)).toBe('Price unavailable');expect(formatPrice(50,'USD',{})).toBe('Conversion unavailable');});
 it('formats checkout ledger totals in the selected currency',()=>{expect(formatNgnPrice(102500,'ESPEE',rates)).toBe('50 ESPEE');expect(formatNgnPrice(102500,'USD',rates)).toContain('77.00');expect(formatNgnPrice(100,'ESPEE',{})).toBe('Conversion unavailable');});
});
