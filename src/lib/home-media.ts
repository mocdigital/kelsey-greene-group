import hero from '@/assets/hero.asset.json';
import video from '@/assets/home-market-video.webm.asset.json';

export function mediaUrl(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const url = value.trim();
  return /^https:\/\//i.test(url) || (url.startsWith('/') && !url.startsWith('//')) ? url : fallback;
}

export function homeMedia(content: Record<string, unknown>) {
  const type = content['hero_media_type'] === 'image' ? 'image' : 'video';
  return {
    type,
    url: mediaUrl(content['hero_media_url'], type === 'video' ? video.url : hero.url),
    poster: mediaUrl(content['hero_poster_url'], hero.url),
    alt: String(content['hero_media_alt'] ?? 'Fresh greens, beans and grains in an African food market'),
  };
}