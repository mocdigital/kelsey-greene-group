import { portableAsset } from '@/lib/media';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Utensils, Megaphone, Store, Truck } from 'lucide-react';
import { Eyebrow, ArrowLink } from '@/components/editorial';
import { Button } from '@/components/ui/button';
import { MovementEnquiry } from '@/components/movement-enquiry';
import { MovementProgress } from '@/components/movement-progress';
import { meta } from '@/lib/content';
import breakfast from '@/assets/movement-breakfast.asset.json';
import discovery from '@/assets/movement-discovery.asset.json';
import community from '@/assets/movement-community.asset.json';
import '@/components/movement-page.css';

export const Route = createFileRoute('/movement')({
  head: () => meta('1 Million Breakfast Movement', 'Nourishing People, Empowering Communities, Feeding a Global Future. Discover African breakfast products and find your place at our shared table.'),
  component: MovementPage,
});

function JoinLink({ children = 'Join the movement' }: { children?: React.ReactNode }) {
  return <a className="arrow-link" href="#join-movement">{children}<ArrowRight size={16} /></a>;
}

function MovementPage() {
  return <div className="movement-page">
    <div className="movement-subnav"><div className="container"><small>Kelsey Greene Group / Foods & Agro-Allied</small><nav aria-label="Movement sections"><a href="#the-movement">The movement</a><a href="#breakfast-range">Breakfast products</a><a href="#ways-to-participate">Ways to participate</a><a href="#join-movement">Join the movement</a></nav></div></div>

    <section id="the-movement" className="section movement-hero"><div className="container movement-hero-layout">
      <div className="movement-hero-copy"><Eyebrow>AFRICAN FOOD. A SHARED TABLE.</Eyebrow><h1>1 Million<br />Breakfast<br />Movement</h1><p className="movement-hero-tagline">Nourishing People, Empowering Communities, Feeding a Global Future.</p><p>A celebration of African breakfast culture. Discover the products, bring your family to the table and find your place in a shared ambition.</p><div className="movement-actions"><Button className="movement-button" asChild><Link to="/shop">Explore breakfast products <ArrowRight /></Link></Button><JoinLink /></div></div>
      <figure><img src={portableAsset(breakfast)} alt="Bowls of millet breakfast with dates, grains and nuts on a shared table" width={1145} height={768} fetchPriority="high" /><figcaption><span>A familiar beginning. A new possibility.</span><span>Illustrative food styling</span></figcaption></figure>
    </div></section>

    <div className="movement-promise"><div className="container"><p>Organic. No Preservatives. No Additives.</p><small>An initiative of Kelsey Greene Group</small></div></div>

    <section className="section movement-why"><div className="container movement-two-column"><div><Eyebrow>WHY BREAKFAST MATTERS</Eyebrow><h2>More than a morning meal.<br />A connection to who we are.</h2></div><div><p>Breakfast carries the flavours of home, the memories of family and the everyday rituals that bring us together.</p><p>The 1 Million Breakfast Movement connects African breakfast products with people and participation. It is one consumer-facing initiative within Kelsey Greene Group’s wider food and agro-allied portfolio.</p></div></div></section>

    <section className="section movement-dark movement-ambition-band"><div className="container movement-two-column"><div><Eyebrow>OUR AMBITION — A GOAL WE SHARE</Eyebrow><div className="movement-goal">1,000,000</div><p>tracked breakfast experiences.</p></div><div><h3>One breakfast. Part of something bigger.</h3><p>An ambition built around products, people and participation: from a family breakfast to the stories and relationships that grow around it.</p></div></div><div className="container"><MovementProgress/></div></section>

    <section id="breakfast-range" className="section movement-range"><div className="container"><div className="movement-range-heading"><div><Eyebrow>THE BREAKFAST RANGE</Eyebrow><h2>Rooted in our food culture.<br />Made for your morning.</h2></div><p>Organic. No Preservatives. No Additives.</p></div><div className="movement-discovery-layout"><article className="movement-discovery-copy"><Eyebrow>DISCOVERY BOX</Eyebrow><h3>Try a curated pack of our breakfast products.</h3><p>Explore a selection of our breakfast products in one convenient pack. For first-time customers, gifting, or discovering the range before choosing larger quantities.</p><div className="movement-actions"><Button className="movement-button movement-gold-button" asChild><Link to="/discovery-box">Try the Discovery Box</Link></Button><Button variant="outline" className="movement-button" asChild><Link to="/shop">Explore other breakfast products</Link></Button></div></article><figure className="movement-discovery-photo"><img src={portableAsset(discovery)} alt="Illustrative breakfast gift box, not confirmed Discovery Box contents" width={1584} height={672} loading="lazy" /><figcaption>Illustrative styling; pack contents and availability to be confirmed.</figcaption></figure></div></div></section>

    <section id="ways-to-participate" className="section movement-participate"><div className="container"><div className="movement-participate-heading"><div><Eyebrow>FIND YOUR PLACE</Eyebrow><h2>Many ways to take part.</h2></div><p>Whether breakfast begins in your home or your business, there is a conversation for you. Choose the path that reflects your interest.</p></div><div className="movement-paths">
      <article className="movement-path"><Utensils /><h3>Consumers &amp;<br />families</h3><p>Explore the breakfast range, express your product interest and share the food stories that matter to you.</p><JoinLink>Join as a consumer</JoinLink></article>
      <article className="movement-path"><Megaphone /><h3>Ambassadors</h3><p>Help tell the story of African breakfast culture and express interest in bringing others into the movement.</p><ArrowLink to="/participate/ambassador">Become an ambassador</ArrowLink></article>
      <article className="movement-path"><Store /><h3>Retailers</h3><p>Start a conversation about the breakfast range and its potential place within your retail business.</p><ArrowLink to="/participate/retailer">Explore retail participation</ArrowLink></article>
      <article className="movement-path"><Truck /><h3>Distributors</h3><p>Discuss distribution opportunities and how you could help connect products with new customers.</p><ArrowLink to="/participate/distributor">Discuss distribution</ArrowLink></article>
    </div></div></section>

    <section className="section movement-dark movement-community"><div className="container movement-two-column"><figure><img src={portableAsset(community)} alt="Illustrative family sharing breakfast together at home" width={768} height={768} loading="lazy" /><figcaption>The community we imagine · Illustrative lifestyle photography</figcaption></figure><div><Eyebrow>A COMMUNITY IN THE MAKING</Eyebrow><h2>A shared table.<br />A shared sense of belonging.</h2><p>We envision a movement shaped by the people in it: families, food lovers, ambassadors and communities connected through African breakfast culture.</p><div className="movement-community-topics"><div><h3><Link to="/recipes">Recipes</Link> &amp; <Link to="/stories">stories</Link></h3><p>A space we aim to build for the flavours, family rituals and food memories people want to share.</p></div><div><h3><Link to="/breakfast-day">Gatherings &amp; events</Link></h3><p>A vision for bringing people together around breakfast, food culture and shared experiences.</p></div></div><JoinLink>Bring your ideas to the movement</JoinLink></div></div></section>

    <section className="section movement-growth"><div className="container movement-two-column"><div><Eyebrow>GROW WITH THE MOVEMENT</Eyebrow><h2>Local roots.<br />Wider possibilities.</h2><p>Nigeria is our primary market. Our ambition extends across Africa, diaspora communities and international markets, with partnerships as part of that future.</p><small>These are participation and growth ambitions, not a statement of established reach or distribution coverage.</small><Button className="movement-button" asChild><a href="#join-movement">Register partnership interest <ArrowRight /></a></Button></div><div className="movement-growth-list"><div><h3>Retail &amp; distribution</h3><p>Explore commercial conversations around the breakfast range, your customer base and routes to market.</p><ArrowLink to="/participate/distributor">Discuss a commercial opportunity</ArrowLink></div><div><h3>Community &amp; sponsorship</h3><p>Bring ideas for community participation, food storytelling and potential breakfast-led gatherings.</p><ArrowLink to="/participate/sponsorship">Explore a community partnership</ArrowLink></div><div><h3>Strategic &amp; supply relationships</h3><p>Discuss complementary capabilities, supply relationships and wider collaboration within food and agro-allied.</p><ArrowLink to="/partnerships">Start a partnership conversation</ArrowLink></div></div></div></section>

    <MovementEnquiry />

    <section className="section movement-invitation"><div className="container"><Eyebrow>THE NEXT MORNING IS AN INVITATION</Eyebrow><h2>A million breakfasts begin with us.</h2><p>Discover the range. Share your interest. Be part of the ambition.</p><div className="movement-actions"><Button className="movement-button" asChild><a href="#join-movement">Join the movement <ArrowRight /></a></Button><ArrowLink to="/shop">Explore breakfast products</ArrowLink></div></div></section>
  </div>;
}
