import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
export type CartItem={slug:string;quantity:number};
const Context=createContext<{user:User|null;cart:CartItem[];add:(slug:string)=>void;change:(slug:string,quantity:number)=>void;currency:string;setCurrency:(c:string)=>void}>({user:null,cart:[],add:()=>{},change:()=>{},currency:'NGN',setCurrency:()=>{}});
export function SiteProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<User|null>(null),[cart,setCart]=useState<CartItem[]>([]),[currency,setCurrency]=useState('NGN'),[ready,setReady]=useState(false);
 useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null));try{const saved=JSON.parse(sessionStorage.getItem('kelsey-cart')??'[]');if(Array.isArray(saved))setCart(saved.filter(v=>typeof v.slug==='string'&&Number.isInteger(v.quantity)&&v.quantity>0));}catch{}setReady(true);return()=>subscription.unsubscribe();},[]);
 useEffect(()=>{if(ready)sessionStorage.setItem('kelsey-cart',JSON.stringify(cart));},[cart,ready]);
 const change=(slug:string,quantity:number)=>setCart(c=>quantity<=0?c.filter(i=>i.slug!==slug):c.some(i=>i.slug===slug)?c.map(i=>i.slug===slug?{slug,quantity:Math.min(99,quantity)}:i):[...c,{slug,quantity:Math.min(99,quantity)}]);
 const add=(slug:string)=>setCart(c=>c.some(i=>i.slug===slug)?c.map(i=>i.slug===slug?{...i,quantity:Math.min(99,i.quantity+1)}:i):[...c,{slug,quantity:1}]);
 return <Context.Provider value={{user,cart,add,change,currency,setCurrency}}>{children}</Context.Provider>;
}
export const useSite=()=>useContext(Context);
