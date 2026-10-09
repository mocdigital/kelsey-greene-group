import foods from '@/assets/portfolio-foods.asset.json';
import poultry from '@/assets/portfolio-poultry.asset.json';
import meat from '@/assets/portfolio-meat.asset.json';
import greenhouse from '@/assets/portfolio-greenhouse.asset.json';
import apparel from '@/assets/portfolio-apparel.asset.json';
import properties from '@/assets/portfolio-properties.asset.json';

export function portfolioImage(slug: string) {
  if (slug.includes('poultry')) return poultry.url;
  if (slug.includes('meat')) return meat.url;
  if (slug.includes('greenhouse')) return greenhouse.url;
  if (slug.includes('apparel') || slug.includes('quintax')) return apparel.url;
  if (slug.includes('propert')) return properties.url;
  return foods.url;
}