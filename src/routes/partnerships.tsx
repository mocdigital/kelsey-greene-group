import {createFileRoute} from '@tanstack/react-router';
import {Eyebrow} from '@/components/editorial';
import {PartnershipContent,PartnershipJoinLink} from '@/components/partnership-content';
import {assets,meta} from '@/lib/content';
import {ArrowRight} from 'lucide-react';
import '@/components/portfolio-pages.css';
export const Route=createFileRoute('/partnerships')({head:()=>meta('Partnerships','Connect with Kelsey Greene Group through retail, distribution, supply, strategic partnerships and sponsorship.'),component:()=> <div className="portfolio-page partnerships-page"><section className="page-intro"><img src={assets.hero} alt="African agriculture and food" fetchPriority="high"/><div className="container"><Eyebrow>PARTNERSHIPS</Eyebrow><h1>Shared interests. Wider possibilities.</h1><p>Commercial collaboration across a diversified African business group.</p><p className="hero-supporting">From retail and supply relationships to strategic opportunities, we welcome conversations that connect your interests with the right business in our portfolio.</p><div className="hero-actions"><PartnershipJoinLink primary>Start a partnership enquiry</PartnershipJoinLink><a className="arrow-link" href="#partnership-paths">Explore the opportunities<ArrowRight/></a></div></div></section><PartnershipContent/></div>});
