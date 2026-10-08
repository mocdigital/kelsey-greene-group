import { createFileRoute,Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight,Check } from 'lucide-react';
import { PageIntro,ProductGrid } from '@/components/editorial';
import { Button } from '@/components/ui/button';
import {contentOptions,payload,assets,meta} from '@/lib/content';
export const Route=createFileRoute('/businesses/$slug')({head:({params})=>meta(params.slug.replaceAll('-',' '),'Discover this business within the diversified Kelsey Greene Group portfolio.'),component:Business});
function Business(){const {slug}=Route.useParams(),{data}=useSuspenseQuery(contentOptions),r=data.find(v=>v.kind==='business'&&v.slug===slug);if(!r)return <section className="section container"><h1>Business not found</h1><Link to="/businesses">Return to our businesses</Link></section>;const p=payload(r);return <><PageIntro eyebrow={String(p['category']??'OUR BUSINESSES')} title={r.title} description={String(p['tagline']??'')}/><section className="section"><div className="container content-layout"><div><h2>{String(p['tagline']??'')}</h2><p>{r.description}</p><ul className="business-detail-capabilities">{(Array.isArray(p['capabilities'])?p['capabilities']:[]).map(c=><li key={String(c)}><Check size={16}/>{String(c)}</li>)}</ul><Button asChild className="mt-8"><Link to="/enquiry">Enquire about this business<ArrowRight/></Link></Button></div><img src={assets.agro} alt="Food and agricultural ingredients"/></div></section>{slug==='foods-agro-allied'&&<ProductGrid preview/>}</>}
