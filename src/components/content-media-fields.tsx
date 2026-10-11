import { MediaPicker } from './media-picker';
type Field = { path: string; label: string; value: string };
export function ContentMediaFields({ kind, slug, content }: { kind: string; slug: string; content: Record<string, unknown> }) {
  const fields = new Map<string, Field>();
  function add(path: string, label: string) { fields.set(path, { path, label, value: String(path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, content) ?? '') }); }
  if (['business','product','bundle','recipe','story','event','club_content'].includes(kind)) add('image', 'Main image URL or asset key');
  if (kind === 'page' && slug !== 'home') add('hero_image', 'Page cover image');
  if ((kind === 'campaign' && slug === 'movement') || (kind === 'page' && slug === 'movement')) { add('image', 'Movement breakfast image'); add('community_image','Community image'); }
  if (kind === 'page' && slug === 'home') add('movement_image','Movement section image');
  if (kind === 'page' && slug === 'partnerships') add('market_image','Market image');
  if (kind === 'page' && slug === 'businesses') add('movement_image','Movement section image');
  if (kind === 'site') add('logo_image','Site logo');
  function walk(value: unknown, prefix = '') { if (!value || typeof value !== 'object') return; Object.entries(value).forEach(([key, item]) => { const path = prefix ? `${prefix}.${key}` : key; if (typeof item === 'string' && /^(image|image_url|photo|portrait|hero_image|\w+_image)$/.test(key)) add(path, path.replaceAll('.', ' / ').replaceAll('_',' ')); else if (typeof item === 'object') walk(item,path); }); }
  walk(content);
  return <>{Array.from(fields.values()).map(field => <div key={field.path} className="span-two"><MediaPicker name={`cms_media:${field.path}`} label={field.label} defaultValue={field.value}/></div>)}</>;
}