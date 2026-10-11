import { portableAsset } from '@/lib/media';
import foods from '@/assets/portfolio-foods.asset.json';
import poultry from '@/assets/portfolio-poultry.asset.json';
import meat from '@/assets/portfolio-meat.asset.json';
import greenhouse from '@/assets/portfolio-greenhouse.asset.json';
import apparel from '@/assets/portfolio-apparel.asset.json';
import properties from '@/assets/portfolio-properties.asset.json';

export function portfolioImage(slug: string) {
  if (slug.includes('poultry')) return portableAsset(poultry);
  if (slug.includes('meat')) return portableAsset(meat);
  if (slug.includes('greenhouse')) return portableAsset(greenhouse);
  if (slug.includes('apparel') || slug.includes('quintax')) return portableAsset(apparel);
  if (slug.includes('propert')) return portableAsset(properties);
  return portableAsset(foods);
}