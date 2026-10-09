import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Store, Boxes, Compass, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow, ArrowLink } from '@/components/editorial';
import { contentOptions } from '@/lib/content';
import market from '@/assets/partnership-market.asset.json';
import { PartnershipEnquiry } from '@/components/partnership-enquiry';

export function PartnershipJoinLink({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  return primary ? <Button className="editorial-button" asChild><a href="#partnership-enquiry">{children}<ArrowRight /></a></Button> : <a className="arrow-link" href="#partnership-enquiry">{children}<ArrowRight /></a>;
}
const paths = [
  { label: 'FOR RETAILERS & DISTRIBUTORS', title: 'Retail & distribution', icon: Store, text: 'Explore the consumer product portfolio, your customer base and potential routes to market. Start with the products and markets that interest your business.', action: 'Discuss retail or distribution' },
  { label: 'FOR COMMERCIAL ORGANISATIONS', title: 'Commercial & supply', icon: Boxes, text: 'Connect around product supply, production needs and complementary commercial capabilities across food, agriculture, manufacturing, apparel and property.', action: 'Start a commercial conversation' },
  { label: 'FOR STRATEGIC PARTNERS', title: 'Strategic & market opportunities', icon: Compass, text: "Bring ideas for business opportunities, complementary strengths and future market expansion. Tell us where your ambition and the Group’s portfolio could meet.", action: 'Explore strategic collaboration' },
  { label: 'FOR COMMUNITIES & MOVEMENT STAKEHOLDERS', title: 'Sponsorship & community', icon: Users, text: 'Discuss sponsorship and participation ideas, including the 1 Million Breakfast Movement. Share the community, purpose or initiative you would like to connect with.', action: 'Share a sponsorship or community idea' },
];
const principles = [
  ['Integrity', 'Honesty, transparency and responsible business are the foundation for a relationship.'],
  ['Excellence', 'Quality, professionalism and continuous improvement guide the way we work.'],
  ['Innovation', 'Better ideas and complementary capabilities open new possibilities for growth.'],
  ['Stewardship', 'We take responsibility for people, products, resources and communities.'],
  ['Growth', 'We pursue sustainable progress and value that endures over the long term.'],
  ['Impact', 'We aim to create meaningful value for customers, communities and the wider economy.'],
];
function connection(slug: string) {
  if (slug.includes('poultry')) return ['Commercial poultry farming and production.', 'Production, food supply and commercial relationships.'];
  if (slug.includes('meat')) return ['Meat production and related food activities.', 'Supply relationships and routes-to-market conversations.'];
  if (slug.includes('greenhouse')) return ['Technology-enabled and precision-oriented agriculture.', 'Agricultural supply and strategic opportunities.'];
  if (slug.includes('apparel') || slug.includes('quintax')) return ['Manufacturing, apparel and craftsmanship.', 'Commercial production, supply and strategic relationships.'];
  if (slug.includes('propert')) return ['Real estate, architecture, space, materials and investment.', 'Property-related business and commercial opportunities.'];
  return ['Agriculture, ingredients, food innovation and consumer products.', 'Retail, distribution, supply and commercial partnerships.'];
}
export function PartnershipContent() {
  const { data } = useSuspenseQuery(contentOptions);
  return <>
    <nav className="portfolio-subnav" aria-label="Partnership sections"><div className="container"><small>FIND THE RIGHT CONVERSATION</small>{[{ id: 'partnership-paths', title: 'Partnership paths' }, { id: 'partnership-businesses', title: 'Business areas' }, { id: 'partnership-approach', title: 'Our approach' }, { id: 'partnership-enquiry', title: 'Make an enquiry' }].map(s => <a key={s.id} href={`#${s.id}`}>{s.title}<Plus /></a>)}</div></nav>
    <section className="section" id="partnership-paths"><div className="container"><div className="partnership-heading"><div><Eyebrow>WAYS TO WORK TOGETHER</Eyebrow><h2>The right relationship begins with mutual fit.</h2></div><p>Choose a starting point for your enquiry. Each opportunity is a commercial conversation with the Group’s businesses, not a consultancy service.</p></div><div className="partnership-paths">{paths.map(p => <article key={p.title} className="partnership-path"><div><small>{p.label}</small><p.icon /></div><h3>{p.title}</h3><p>{p.text}</p><PartnershipJoinLink>{p.action}</PartnershipJoinLink></article>)}</div></div></section>
    <section className="section portfolio-dark" id="partnership-businesses"><div className="container partnership-businesses"><div className="partnership-heading"><div><Eyebrow>ACROSS THE GROUP</Eyebrow><h2>One portfolio.<br />Different points of connection.</h2></div><p>Each business retains its own operational focus and identity. Select the business area most relevant to your proposed relationship.</p></div><div>{data.filter(r => r.kind === 'business').map(r => { const [description, focus] = connection(r.slug); return <Link key={r.id} to="/businesses/$slug" params={{ slug: r.slug }} className="partnership-business-row"><h3>{r.title}</h3><p>{description}</p><p>{focus}</p><ArrowUpRight /></Link>; })}</div><ArrowLink to="/businesses">Explore our businesses in depth</ArrowLink></div></section>
    <section className="section" id="partnership-approach"><div className="container"><div className="partnership-heading"><div><Eyebrow>THE PRINCIPLES WE BRING</Eyebrow><h2>Shared principles.<br />Responsible growth.</h2></div><p>We look for relationships grounded in clear interests, complementary capabilities and a commitment to long-term value. These values shape the conversation.</p></div><div className="portfolio-principles">{principles.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="section portfolio-band partnership-market"><div className="container portfolio-band-layout"><img src={market.url} alt="Illustrative city skyline and urban landscape" width={600} height={800} loading="lazy" /><div><Eyebrow>ROOTED IN NIGERIA. GLOBAL IN OUTLOOK.</Eyebrow><h2>Our home market. Our future horizons.</h2><p>Nigeria is our primary market. Our ambition extends across Africa, diaspora markets, the UK, US, Canada, UAE, Europe, Australia and other international markets.</p><p className="market-note">These are growth ambitions, not established operations or distribution coverage. If you have a market opportunity in mind, tell us about it.</p><PartnershipJoinLink>Discuss a market opportunity</PartnershipJoinLink></div></div></section>
    <PartnershipEnquiry />
    <section className="section partnership-invitation"><div className="container"><Eyebrow>CONNECTED OPPORTUNITIES</Eyebrow><h2>Let’s explore what we could create together.</h2><p>Across businesses, sectors and future markets. Start with a conversation.</p><div className="hero-actions"><PartnershipJoinLink primary>Make a partnership enquiry</PartnershipJoinLink><ArrowLink to="/group">Discover the Group</ArrowLink></div></div></section>
  </>;
}