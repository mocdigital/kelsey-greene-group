import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { trackReferralVisit } from '@/lib/commerce.functions';
export type CartItem={slug:string;quantity:number};
type Site={user:User|null;cart:CartItem[];add:(slug:string)=>void;change:(slug:string,quantity:number)=>void;clear:()=>void;currency:string;setCurrency:(c:string)=>void;referral:string};
const Context=createContext<Site>({user:null,cart:[],add:()=>{},change:()=>{},clear:()=>{},currency:'ESPEE',setCurrency:()=>{},referral:''});
export function SiteProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[cart,setCart]=useState<CartItem[]>([]),[currency,setCurrency]=useState('ESPEE'),[ready,setReady]=useState(false),[referral,setReferral]=useState('');
 useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null));try{const saved=JSON.parse(sessionStorage.getItem('kelsey-cart')??'[]');if(Array.isArray(saved))setCart(saved.filter(v=>typeof v.slug==='string'&&Number.isInteger(v.quantity)&&v.quantity>0));}catch{}
  try{const ref=new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase();if(ref&&/^[A-Z0-9-]{3,40}$/.test(ref)){if(sessionStorage.getItem('kelsey-ref')!==ref){sessionStorage.setItem('kelsey-ref',ref);trackReferralVisit({data:{code:ref,path:window.location.pathname}}).catch(()=>{});}}setReferral(sessionStorage.getItem('kelsey-ref')??'');}catch{}
  setReady(true);return()=>subscription.unsubscribe();},[]);
 useEffect(()=>{if(ready)sessionStorage.setItem('kelsey-cart',JSON.stringify(cart));},[cart,ready]);
 const change=(slug:string,quantity:number)=>setCart(c=>quantity<=0?c.filter(i=>i.slug!==slug):c.some(i=>i.slug===slug)?c.map(i=>i.slug===slug?{slug,quantity:Math.min(99,quantity)}:i):[...c,{slug,quantity:Math.min(99,quantity)}]);
 const add=(slug:string)=>setCart(c=>c.some(i=>i.slug===slug)?c.map(i=>i.slug===slug?{...i,quantity:Math.min(99,i.quantity+1)}:i):[...c,{slug,quantity:1}]);
 const clear=()=>setCart([]);
 return <Context.Provider value={{user,cart,add,change,clear,currency,setCurrency,referral}}>{children}</Context.Provider>;
}
export const useSite=()=>useContext(Context);
