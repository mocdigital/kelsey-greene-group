import { useState, type ImgHTMLAttributes } from 'react';
import { resolveMedia } from '@/lib/media';

export function CmsImage({ src, fallback = '/media/image-unavailable.svg', ...props }: ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }) {
  const primary = resolveMedia(src, fallback);
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState('');
  const current = failed.includes(primary) ? (failed.includes(fallback) ? '/media/image-unavailable.svg' : fallback) : primary;
  return <img {...props} src={current} data-loading={loaded !== current || undefined} data-image-fallback={current !== primary || undefined}
    onLoad={event => { setLoaded(current); props.onLoad?.(event); }}
    onError={event => { setFailed(values => values.includes(current) ? values : [...values, current]); props.onError?.(event); }} />;
}