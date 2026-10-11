import { portableAsset, resolveMedia } from '@/lib/media';
import hero from '@/assets/hero.asset.json';
import video from '@/assets/home-market-video.webm.asset.json';

export function mediaUrl(value: unknown, fallback = '') {
  return resolveMedia(value, fallback);
}

export function homeMedia(content: Record<string, unknown>) {
  const type = content['hero_media_type'] === 'image' ? 'image' : 'video';
  return {
    type,
    url: mediaUrl(content['hero_media_url'] || content['hero_image'] || content['image'], type === 'video' ? portableAsset(video) : portableAsset(hero)),
    poster: mediaUrl(content['hero_poster_url'], portableAsset(hero)),
    alt: String(content['hero_media_alt'] ?? 'Fresh greens, beans and grains in an African food market'),
  };
}