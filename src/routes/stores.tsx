import {createFileRoute} from '@tanstack/react-router';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {MapPin} from 'lucide-react';
import {PageIntro} from '@/components/editorial';
import {contentOptions,payload,meta} from '@/lib/content';
export const Route=createFileRoute('/stores')({head:()=>meta('Find Our Products','Find published Kelsey Greene retail and distribution locations.'),component:Stores});
function Stores(){const {data}=useSuspenseQuery(contentOptions),[search,setSearch]=useState(''),rows=data.filter(r=>r.kind==='location').filter(r=>`${r.title} ${r.description} ${JSON.stringify(r.payload)}`.toLowerCase().includes(search.toLowerCase()));return <><PageIntro eyebrow="STORE LOCATOR" title="Closer to your breakfast table." description="Discover our published retail and distribution locations."/><section className="section"><div className="container"><div className="store-filters"><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search city, country or store" aria-label="Search locations"/></div>{rows.length?rows.map(r=><div className="admin-item" key={r.id}><div><h3><MapPin size={18} className="inline mr-2"/>{r.title}</h3><p>{r.description}</p><p>{String(payload(r)['address']??'')}</p></div></div>):<p className="empty-state">No confirmed locations are published{search?' for this search':''}. Please contact the team about product availability.</p>}</div></section></>}
