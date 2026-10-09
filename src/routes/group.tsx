import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageIntro, Eyebrow, ArrowLink, PortfolioStrip } from '@/components/editorial';
import { contentOptions, meta, payload } from '@/lib/content';

export const Route = createFileRoute('/group')({
  loader: ({ context }) => context.queryClient.ensureQueryData(contentOptions),
  head: () => meta('About the Group & Leadership', 'Discover Kelsey Greene Group’s purpose, vision, mission, Christian foundation, core values and leadership.'),
  component: Group,
});

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item)) : [];
}

function Group() {
  const { data } = useSuspenseQuery(contentOptions);
  const group = data.find(record => record.kind === 'page' && record.slug === 'group');
  if (!group) return null;
  const content = payload(group);

  return <>
    <PageIntro eyebrow="WHO WE ARE / KELSEY GREENE GROUP" title={group.title} description={group.description} />
    <section id="purpose" className="section group-purpose">
      <div className="container group-purpose-layout">
        <Eyebrow>01 / OUR PURPOSE</Eyebrow>
        <div><h2>{String(content['purpose'] ?? '')}</h2><ArrowLink to="/businesses">Explore our portfolio</ArrowLink><PortfolioStrip/></div>
      </div>
    </section>
    <section className="section products-section">
      <div className="container group-direction">
        <div><Eyebrow>OUR VISION</Eyebrow><h2>{String(content['vision'] ?? '')}</h2></div>
        <div><Eyebrow>OUR MISSION</Eyebrow><p>{String(content['mission'] ?? '')}</p><ul className="group-pillars">{strings(content['pillars']).map((pillar, index) => <li key={pillar}><span>{String(index + 1).padStart(2, '0')}</span>{pillar}</li>)}</ul></div>
      </div>
    </section>
    <section className="section business-section group-foundation">
      <div className="container group-direction">
        <div><Eyebrow>02 / CHRISTIAN FOUNDATION</Eyebrow><h2>Faith informs character.</h2><p>{String(content['foundation'] ?? '')}</p></div>
        <ul className="group-principles">{strings(content['principles']).map(principle => <li key={principle}>{principle}</li>)}</ul>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <div className="section-heading"><div><Eyebrow>03 / CORE VALUES</Eyebrow><h2>What we stand for.</h2></div></div>
        <div className="values-grid group-values">{records(content['values']).map((value, index) => <article className="value-item" key={String(value['name'])}><span>{String(index + 1).padStart(2, '0')}</span><h3>{String(value['name'] ?? '')}</h3><p>{String(value['text'] ?? '')}</p></article>)}</div>
      </div>
    </section>
    <section id="leadership" className="section products-section group-leadership">
      <div className="container">
        <div className="group-leadership-heading"><div><Eyebrow>04 / LEADERSHIP</Eyebrow><h2>{String(content['leadership_title'] ?? '')}</h2></div><p>{String(content['leadership_intro'] ?? '')}</p></div>
        <div className="group-leaders">{records(content['leadership']).map((leader, index) => <article key={String(leader['role'])}><span className="gold-note">{String(index + 1).padStart(2, '0')} / LEADERSHIP</span><h3>{String(leader['role'] ?? '')}</h3><p>{String(leader['bio'] ?? '')}</p></article>)}</div>
      </div>
    </section>
  </>;
}
