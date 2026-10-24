import {describe,it,expect} from 'vitest';
import {paymentConfig,relevantMerchants} from '@/lib/payment-options';
describe('CMS merchant options',()=>{
 const merchants=paymentConfig({espee_merchants:[{code:'KFOODS',label:'Foods',businesses:['foods-agro-allied']},{code:'KGMA',label:'Meat',businesses:['meat-arena']},{code:'KGFBENIN',businesses:['poultry']}]}).merchants;
 it('offers all codes for a bag spanning businesses',()=>expect(relevantMerchants(merchants,['foods-agro-allied','meat-arena']).map(m=>m.code)).toEqual(['KFOODS','KGMA']));
 it('allows any code tied to the same business',()=>expect(relevantMerchants([...merchants,{code:'SECOND',label:'Another',businesses:['foods-agro-allied']}],['foods-agro-allied']).map(m=>m.code)).toEqual(['KFOODS','SECOND']));
 it('deduplicates codes tied to multiple businesses',()=>expect(relevantMerchants([...merchants,...merchants],['foods-agro-allied']).map(m=>m.code)).toEqual(['KFOODS']));
 it('reads the actual saved code rather than its label',()=>expect(merchants[0]).toEqual({code:'KFOODS',label:'Foods',businesses:['foods-agro-allied']}));
});