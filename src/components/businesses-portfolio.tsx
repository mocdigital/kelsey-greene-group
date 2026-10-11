import { CmsImage } from '@/components/cms-image';
import { Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow, ArrowLink } from '@/components/editorial';
import { contentOptions, payload, assets } from '@/lib/content';
import { contentMedia } from '@/lib/media';
import { portfolioImage } from '@/lib/portfolio-images';

export function BusinessesPortfolio() {
  const { data } = useSuspenseQuery(contentOptions);
  const businesses = data.filter(r => r.kind === 'business');
  return <>
    <nav className="portfolio-subnav" aria-label="Business portfolio"><div className="container">{businesses.map(r => <a href={`#portfolio-${r.slug}`} key={r.id}>{r.title}<Plus /></a>)}</div></nav>
    <div className="container portfolio-heading"><Eyebrow>THE PORTFOLIO</Eyebrow><p>Independent focus. A shared corporate identity.</p></div>
    <div className="portfolio-businesses">{businesses.map(r => { const p = payload(r); return <section className="portfolio-business section" id={`portfolio-${r.slug}`} key={r.id}><div className="container portfolio-business-layout">
      <figure><CmsImage src={portfolioImage(r.slug,p)} alt={`Illustrative ${r.title} sector photography`} width={1200} height={830} loading="lazy" /><figcaption>Illustrative industry photography — Not a Group facility</figcaption></figure>
      <div><small>{String(p['category'] ?? '')}</small><h2><Link to="/businesses/$slug" params={{ slug: r.slug }}>{r.title}</Link></h2><strong className="portfolio-tagline">{String(p['tagline'] ?? '')}</strong><p>{r.description}</p><div className="portfolio-focus"><small>BUSINESS FOCUS</small><ul>{(Array.isArray(p['capabilities']) ? p['capabilities'] : []).map(c => <li key={String(c)}>{String(c)}</li>)}</ul></div><ArrowLink to="/enquiry">Enquire about {r.title}</ArrowLink></div>
    </div></section>; })}</div>
    <section className="section portfolio-dark portfolio-philosophy"><div className="container"><Eyebrow>OUR GROWTH PHILOSOPHY</Eyebrow><h2>Building businesses. Creating value.</h2><p className="brand-expression">BUILDING BUSINESSES. CREATING VALUE.</p><div className="portfolio-principles">{[{ title: 'Quality businesses', text: 'Operate with quality and professionalism, serving customers across consumer and commercial markets.' }, { title: 'Connected opportunities', text: 'Develop products, identify commercial opportunities and create relationships across distinct sectors.' }, { title: 'Long-term value', text: 'Pursue sustainable growth with integrity, innovation and responsibility for people and resources.' }].map(p => <article key={p.title}><h3>{p.title}</h3><p>{p.text}</p></article>)}</div></div></section>
    <section className="section portfolio-band"><div className="container portfolio-band-layout"><CmsImage src={contentMedia(payload(data.find(r=>r.kind==='page'&&r.slug==='businesses')),'movement_image',assets.breakfast)} alt="Illustrative African breakfast bowls" width={800} height={600} loading="lazy" /><div><Eyebrow>WITHIN FOODS &amp; AGRO-ALLIED</Eyebrow><h2>A consumer expression of a wider portfolio.</h2><p>Meet the 1 Million Breakfast Movement and discover our breakfast products. One initiative within food and agro-allied—not the whole Group.</p><div className="link-row"><ArrowLink to="/movement">Explore the movement</ArrowLink><ArrowLink to="/shop">Shop breakfast products</ArrowLink></div></div></div></section>
    <section className="section portfolio-closing"><div className="container portfolio-closing-layout"><div><Eyebrow>CONNECT WITH THE GROUP</Eyebrow><h2>Find your next conversation.</h2><p>For commercial collaboration, product interests or a business-specific enquiry, choose the path that reflects your interest.</p></div><div className="portfolio-closing-actions"><Button asChild className="editorial-button"><Link to="/partnerships">Explore partnerships<ArrowRight /></Link></Button><ArrowLink to="/enquiry">Contact &amp; business enquiries</ArrowLink></div></div></section>
  </>;
}