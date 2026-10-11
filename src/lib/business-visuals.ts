import { portableAsset } from '@/lib/media';
import poultry from '@/assets/sector-poultry.jpg';
import meat from '@/assets/sector-meat.jpg';
import greenhouse from '@/assets/sector-greenhouse.jpg';
import apparel from '@/assets/sector-apparel.jpg';
import property from '@/assets/sector-property.jpg';
import agro from '@/assets/agro.asset.json';

export function businessVisual(slug: string): { src: string; alt: string } {
  if (slug.includes('poultry')) return { src: poultry, alt: 'Illustrative poultry farming photograph' };
  if (slug.includes('meat')) return { src: meat, alt: 'Illustrative fresh meat preparation photograph' };
  if (slug.includes('greenhouse')) return { src: greenhouse, alt: 'Illustrative greenhouse crops photograph' };
  if (slug.includes('apparel') || slug.includes('quintax')) return { src: apparel, alt: 'Illustrative apparel and textile workroom' };
  if (slug.includes('propert')) return { src: property, alt: 'Illustrative contemporary residential properties' };
  return { src: portableAsset(agro), alt: 'Grains and natural food ingredients' };
}