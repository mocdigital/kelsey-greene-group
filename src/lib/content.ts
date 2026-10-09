import { queryOptions } from '@tanstack/react-query';
import { getContent } from './platform.functions';
import hero from '@/assets/hero.asset.json';
import agro from '@/assets/agro.asset.json';
import breakfast from '@/assets/breakfast.asset.json';
import plain from '@/assets/plain.asset.json';
import milky from '@/assets/milky.asset.json';
import spicy from '@/assets/spicy.asset.json';
import date from '@/assets/date.asset.json';
import beans from '@/assets/beans.asset.json';
import {marketplaceImages} from './marketplace-images';
export const assets={hero:hero.url,agro:agro.url,breakfast:breakfast.url,plain:plain.url,milky:milky.url,spicy:spicy.url,date:date.url,beans:beans.url};
export const contentOptions=queryOptions({queryKey:['public-content'],queryFn:()=>getContent(),staleTime:60000});
export type ContentRecord=Awaited<ReturnType<typeof getContent>>[number];
export function payload(r:ContentRecord):Record<string,unknown>{return r.payload && typeof r.payload==='object' && !Array.isArray(r.payload) ? r.payload as Record<string,unknown> : {};}
export function image(r:ContentRecord){const key=String(payload(r)['image']??'agro');return marketplaceImages[key]??assets[key as keyof typeof assets]??key;}
export function meta(title:string,description:string){return {meta:[{title:`${title} — Kelsey Greene Group`},{name:'description',content:description},{property:'og:title',content:`${title} — Kelsey Greene Group`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
