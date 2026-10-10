import { describe, expect, it } from 'vitest';
import { homeMedia, mediaUrl } from '@/lib/home-media';

describe('Homepage media settings', () => {
  it('defaults to the generated video with an image poster', () => {
    const media = homeMedia({});
    expect(media.type).toBe('video');
    expect(media.url).toContain('.mp4');
    expect(media.poster).toContain('hero.jpg');
  });
  it('supports a CMS image or video override', () => {
    expect(homeMedia({ hero_media_type:'image', hero_media_url:'https://example.com/cover.jpg' }).url).toBe('https://example.com/cover.jpg');
    expect(homeMedia({ hero_media_type:'video', hero_media_url:'/uploads/cover.mp4' }).url).toBe('/uploads/cover.mp4');
  });
  it('rejects unsafe and non-media URL schemes', () => {
    expect(mediaUrl('javascript:alert(1)')).toBe('');
    expect(mediaUrl('//example.com/file')).toBe('');
  });
});