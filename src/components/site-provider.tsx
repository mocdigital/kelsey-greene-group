import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackReferralVisit } from '@/lib/commerce.functions';
import { currencies } from '@/lib/pricing';
import { SUBSCRIPTION_FREQUENCIES, type SubscriptionFrequency } from '@/lib/growth';
export type CartItem={slug:string;quantity:number;frequency?:SubscriptionFrequency};
type Site={user:User|null;cart:CartItem[];add:(slug:string,quantity?:number)=>void;change:(slug:string,quantity:number)=>void;setFrequency:(slug:string,frequency?:SubscriptionFrequency)=>void;clear:()=>void;currency:string;setCurrency:(c:string)=>void;referral:string};
const Context=createContext<Site>({user:null,cart:[],add:()=>{},change:()=>{},setFrequency:()=>{},clear:()=>{},currency:'ESPEE',setCurrency:()=>{},referral:''});
const REF_COOKIE='kg_ref',REF_DAYS=30,validRef=(v:string|null|undefined)=>Boolean(v&&/^[A-Z0-9-]{3,40}$/.test(v));
function readCookie(name:string){return document.cookie.split('; ').find(c=>c.startsWith(`${name}=`))?.split('=')[1]??'';}
export function SiteProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[cart,setCart]=useState<CartItem[]>([]),[currency,setCurrency]=useState('ESPEE'),[ready,setReady]=useState(false),[referral,setReferral]=useState('');
 useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null));
  try{const saved=JSON.parse(sessionStorage.getItem('kelsey-cart')??'[]');if(Array.isArray(saved))setCart(saved.filter(v=>typeof v.slug==='string'&&Number.isInteger(v.quantity)&&v.quantity>0).map(v=>({slug:v.slug,quantity:Math.min(99,v.quantity),...(SUBSCRIPTION_FREQUENCIES.includes(v.frequency)?{frequency:v.frequency}:{})})));}catch{}
  // Referral attribution: ?ref= or ?ambassador= is kept for the session and in a 30-day first-party cookie, then attached at checkout.
  try{const q=new URLSearchParams(window.location.search),incoming=(q.get('ref')??q.get('ambassador'))?.trim().toUpperCase();
   if(incoming&&validRef(incoming)){document.cookie=`${REF_COOKIE}=${incoming}; Max-Age=${REF_DAYS*86400}; Path=/; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;if(sessionStorage.getItem('kelsey-ref')!==incoming){sessionStorage.setItem('kelsey-ref',incoming);trackReferralVisit({data:{code:incoming,path:window.location.pathname}}).catch(()=>{});}}
   const stored=sessionStorage.getItem('kelsey-ref')||decodeURIComponent(readCookie(REF_COOKIE));if(validRef(stored)){sessionStorage.setItem('kelsey-ref',stored);setReferral(stored);}}catch{}
  setReady(true);return()=>subscription.unsubscribe();},[]);
 useEffect(()=>{if(ready)sessionStorage.setItem('kelsey-cart',JSON.stringify(cart));},[cart,ready]);
 const change=(slug:string,quantity:number)=>setCart(c=>quantity<=0?c.filter(i=>i.slug!==slug):c.some(i=>i.slug===slug)?c.map(i=>i.slug===slug?{...i,quantity:Math.min(99,quantity)}:i):[...c,{slug,quantity:Math.min(99,quantity)}]);
 const add=(slug:string,quantity=1)=>setCart(c=>c.some(i=>i.slug===slug)?c.map(i=>i.slug===slug?{...i,quantity:Math.min(99,i.quantity+quantity)}:i):[...c,{slug,quantity:Math.min(99,quantity)}]);
 const setFrequency=(slug:string,frequency?:SubscriptionFrequency)=>setCart(c=>c.map(i=>i.slug===slug?(frequency?{...i,frequency}:{slug:i.slug,quantity:i.quantity}):i));
 const clear=()=>setCart([]);
 return <Context.Provider value={{user,cart,add,change,setFrequency,clear,currency,setCurrency,referral}}>{children}</Context.Provider>;
}
export const useSite=()=>useContext(Context);
