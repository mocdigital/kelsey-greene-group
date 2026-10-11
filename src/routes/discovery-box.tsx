import { CmsImage } from '@/components/cms-image';
import {createFileRoute,Link} from '@tanstack/react-router';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {Check,ShoppingBag} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {PageIntro,Eyebrow,Price} from '@/components/editorial';
import {useSite} from '@/components/site-provider';
import {contentOptions,payload,image,meta,assets} from '@/lib/content';
import '@/components/commerce-pages.css';
export const Route=createFileRoute('/discovery-box')({head:()=>meta('Discovery Box & Bundles','Discovery, Family, Monthly and Business Boxes from the Kelsey Greene breakfast range.'),component:Bundles});
function Bundles(){const {data}=useSuspenseQuery(contentOptions),{add}=useSite(),[added,setAdded]=useState('');const bundles=data.filter(r=>r.kind==='product'&&payload(r)['listing_type']==='bundle').sort((a,b)=>a.position-b.position);
 return <><PageIntro eyebrow="1 MILLION BREAKFAST MOVEMENT" title="Five products. A world of breakfasts." description="Choose a bundle sized for you, your family or your business." photo={assets.breakfast}/><section className="section"><div className="container"><Eyebrow>BUNDLES</Eyebrow><h2 className="mt-5">Pick your box.</h2><div className="kg-card-grid">{bundles.map(b=>{const p=payload(b),contents=Array.isArray(p['contents'])?p['contents'].map(String):[];return <article className="kg-card" key={b.id}><CmsImage src={image(b)} alt={b.title} loading="lazy" className="w-full aspect-[4/3] object-cover"/><span className="kg-tag">{String(p['size']??'')}</span><h3>{b.title}</h3><p>{b.description}</p><ul>{contents.map(c=><li key={c}>{c}</li>)}</ul><strong className="text-xl"><Price product={b}/></strong><div className="kg-actions mt-auto"><Button onClick={()=>{add(b.slug);setAdded(b.slug)}}>{added===b.slug?<><Check/>Added</>:<><ShoppingBag/>Add to bag</>}</Button><Button variant="outline" asChild><Link to="/shop/$slug" params={{slug:b.slug}}>Details</Link></Button></div></article>})}</div>{added&&<p className="notice mt-6" role="status">Added to your bag. <Link to="/cart" className="arrow-link">View bag →</Link></p>}{bundles.some(b=>payload(b)['illustrative'])&&<p className="kg-sample mt-6">Bundle contents and prices are illustrative defaults pending commercial approval.</p>}</div></section></>}
