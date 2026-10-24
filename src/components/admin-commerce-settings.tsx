import {useState} from 'react';
import {Plus, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';

type Zone={id:string;label:string;fee_ngn:number;eta:string;active:boolean};
type Merchant={code:string;label:string;businesses:string[]};
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export function DeliveryZonesFields({content}:{content:Record<string,unknown>}){
  const [zones,setZones]=useState<Zone[]>(()=>(Array.isArray(content['zones'])?content['zones'] as Record<string,unknown>[]:[]).map(z=>({id:String(z['id']??''),label:String(z['label']??''),fee_ngn:Number(z['fee_ngn'])||0,eta:String(z['eta']??''),active:z['active']!==false})));
  const upd=(i:number,p:Partial<Zone>)=>setZones(zs=>zs.map((z,j)=>j===i?{...z,...p}:z));
  return <fieldset className="span-two admin-subform"><legend>Delivery zones</legend><input type="hidden" name="zones_json" value={JSON.stringify(zones.map(z=>({...z,id:z.id||slug(z.label)})))}/>
    {zones.map((z,i)=><div key={i} className="form-grid admin-row"><label>Zone name<input required value={z.label} onChange={e=>upd(i,{label:e.target.value})}/></label><label>Fee (₦)<input type="number" min={0} required value={z.fee_ngn} onChange={e=>upd(i,{fee_ngn:Number(e.target.value)})}/></label><label>Delivery time<input value={z.eta} onChange={e=>upd(i,{eta:e.target.value})} placeholder="e.g. 1–2 working days"/></label><label><span><input type="checkbox" checked={z.active} onChange={e=>upd(i,{active:e.target.checked})}/> Available to customers</span></label><Button type="button" variant="ghost" onClick={()=>setZones(zs=>zs.filter((_,j)=>j!==i))}><Trash2/>Remove zone</Button></div>)}
    <Button type="button" variant="outline" onClick={()=>setZones(zs=>[...zs,{id:'',label:'',fee_ngn:0,eta:'',active:true}])}><Plus/>Add delivery zone</Button></fieldset>;
}

export function PaymentSettingsFields({content,businesses}:{content:Record<string,unknown>;businesses:{slug:string;title:string}[]}){
  const [merchants,setMerchants]=useState<Merchant[]>(()=>(Array.isArray(content['espee_merchants'])?content['espee_merchants'] as Record<string,unknown>[]:[]).map(m=>({code:String(m['code']??''),label:String(m['label']??''),businesses:Array.isArray(m['businesses'])?(m['businesses'] as unknown[]).map(String):[]})));
  const upd=(i:number,p:Partial<Merchant>)=>setMerchants(ms=>ms.map((m,j)=>j===i?{...m,...p}:m));
  const v=(k:string)=>String(content[k]??'');
  return <>
    <fieldset className="span-two admin-subform"><legend>Direct bank transfer</legend><div className="form-grid"><label>Bank name<input name="bank_name" defaultValue={v('bank_name')}/></label><label>Account name<input name="account_name" defaultValue={v('account_name')}/></label><label>Account number<input name="account_number" defaultValue={v('account_number')}/></label></div></fieldset>
    <fieldset className="span-two admin-subform"><legend>ESPEES merchant codes</legend><p><small>Tie each code to one or more businesses. At checkout, customers see the code for the business that sells each item.</small></p><input type="hidden" name="merchants_json" value={JSON.stringify(merchants)}/>
      {merchants.map((m,i)=><div key={i} className="form-grid admin-row"><label>Merchant code<input required value={m.code} onChange={e=>upd(i,{code:e.target.value})}/></label><label>Label (optional)<input value={m.label} onChange={e=>upd(i,{label:e.target.value})}/></label><div className="span-two"><b>Businesses using this code</b>{businesses.map(b=><label key={b.slug}><span><input type="checkbox" checked={m.businesses.includes(b.slug)} onChange={e=>upd(i,{businesses:e.target.checked?[...m.businesses,b.slug]:m.businesses.filter(x=>x!==b.slug)})}/> {b.title}</span></label>)}</div><Button type="button" variant="ghost" onClick={()=>setMerchants(ms=>ms.filter((_,j)=>j!==i))}><Trash2/>Remove code</Button></div>)}
      <Button type="button" variant="outline" onClick={()=>setMerchants(ms=>[...ms,{code:'',label:'',businesses:[]}])}><Plus/>Add merchant code</Button></fieldset>
    <fieldset className="span-two admin-subform"><legend>Card payments (staged)</legend><div className="form-grid"><label>Provider<select name="card_provider" defaultValue={v('card_provider')||'paystack'}><option value="paystack">Paystack</option><option value="stripe">Stripe</option></select></label><label>Card status<select name="card_mode" defaultValue={v('card_mode')||'staging'}><option value="staging">Coming soon (hidden from customers)</option><option value="live">Live</option></select></label><label>Paystack public key<input name="paystack_public_key" defaultValue={v('paystack_public_key')} placeholder="pk_live_..."/></label><label>Stripe publishable key<input name="stripe_publishable_key" defaultValue={v('stripe_publishable_key')} placeholder="pk_live_..."/></label></div><p className="notice"><small>Secret keys are never stored here. When ready, the private keys (PAYSTACK_SECRET_KEY or STRIPE_SECRET_KEY, plus the matching webhook secret) are added as secure backend secrets, then the payment connection is switched on. Keep status on “Coming soon” until that is done.</small></p></fieldset>
  </>;
}
