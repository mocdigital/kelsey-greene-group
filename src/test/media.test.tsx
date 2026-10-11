import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { resolveMedia, referencesMedia, portableAsset } from '@/lib/media';
import { image } from '@/lib/content';
import { businessVisual } from '@/lib/business-visuals';
import { portfolioImage } from '@/lib/portfolio-images';
import { CmsImage } from '@/components/cms-image';
afterEach(cleanup);
describe('Portable published media', () => {
  it('resolves immutable uploads without signed URLs in content', () => {
    expect(resolveMedia('cms-media:uploads/photo.jpg')).toBe('/api/public/media?path=uploads%2Fphoto.jpg');
    expect(resolveMedia('cms-media:uploads/../private.jpg', '/fallback.jpg')).toBe('/fallback.jpg');
    expect(resolveMedia('javascript:alert(1)', '/fallback.jpg')).toBe('/fallback.jpg');
  });
  it('replaces Lovable proxy URLs with independently hosted static paths', () => {
    expect(portableAsset({url:'/__l5e/assets-v1/id/hero.jpg',asset_id:'id',original_filename:'hero.jpg'})).toBe('/media/id/hero.jpg');
    expect(resolveMedia('/__l5e/assets-v1/id/hero.jpg')).toBe('/media/id/hero.jpg');
  });
  it('prioritises selected images consistently for sectors and products', () => {
    const selected='https://example.com/published.jpg';
    expect(businessVisual('poultry',{image:selected}).src).toBe(selected);
    expect(portfolioImage('poultry',{image:selected})).toBe(selected);
    expect(image({slug:'plain-millet-pap',payload:{image:selected}} as Parameters<typeof image>[0])).toBe(selected);
  });
  it('finds published references in nested section and portrait fields only by exact match', () => {
    expect(referencesMedia({leadership:[{image:'cms-media:uploads/photo.jpg'}]},'cms-media:uploads/photo.jpg')).toBe(true);
    expect(referencesMedia({image:'cms-media:uploads/other.jpg'},'cms-media:uploads/photo.jpg')).toBe(false);
  });
  it('shows loading, falls back on failure and renders replacements immediately', () => {
    const {rerender}=render(<CmsImage src="/bad.jpg" fallback="/default.jpg" alt="Product"/>);
    const img=screen.getByRole('img');expect(img.getAttribute('data-loading')).toBe('true');
    fireEvent.error(img);expect(img.getAttribute('src')).toBe('/default.jpg');
    fireEvent.load(img);expect(img.getAttribute('data-loading')).toBeNull();
    rerender(<CmsImage src="/new.jpg" fallback="/default.jpg" alt="Product"/>);
    expect(img.getAttribute('src')).toBe('/new.jpg');
    fireEvent.error(img);fireEvent.error(img);expect(img.getAttribute('src')).toBe('/media/image-unavailable.svg');
  });
});