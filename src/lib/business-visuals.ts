import { portableAsset, resolveMedia } from '@/lib/media';
import poultry from '@/assets/sector-poultry.jpg';
import meat from '@/assets/sector-meat.jpg';
import greenhouse from '@/assets/sector-greenhouse.jpg';
import apparel from '@/assets/sector-apparel.jpg';
import property from '@/assets/sector-property.jpg';
import agro from '@/assets/agro.asset.json';

function defaultBusinessVisual(slug: string): { src: string; alt: string } {
  if (slug.includes('poultry')) return { src: poultry, alt: 'Illustrative poultry farming photograph' };
  if (slug.includes('meat')) return { src: meat, alt: 'Illustrative fresh meat preparation photograph' };
  if (slug.includes('greenhouse')) return { src: greenhouse, alt: 'Illustrative greenhouse crops photograph' };
  if (slug.includes('apparel') || slug.includes('quintax')) return { src: apparel, alt: 'Illustrative apparel and textile workroom' };
  if (slug.includes('propert')) return { src: property, alt: 'Illustrative contemporary residential properties' };
  return { src: portableAsset(agro), alt: 'Grains and natural food ingredients' };
}
export function businessVisual(slug:string, content:Record<string,unknown>={}){const fallback=defaultBusinessVisual(slug);return {src:resolveMedia(content['image_url']??content['image'],fallback.src),alt:String(content['image_alt']??fallback.alt)};}
