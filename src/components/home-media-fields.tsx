import { useState } from 'react';
import { MediaPicker } from './media-picker';
import { homeMedia } from '@/lib/home-media';

export function HomeMediaFields({ content }: { content: Record<string, unknown> }) {
  const media = homeMedia(content);
  const [type, setType] = useState(media.type);
  return <fieldset className="span-two cms-home-media"><legend>Homepage background</legend><div className="form-grid">
    <label>Background type<select name="hero_media_type" value={type} onChange={event => setType(event.target.value)}><option value="image">Image</option><option value="video">Video</option></select></label>
    <MediaPicker key={type} name="hero_media_url" label={type === 'video' ? 'Video URL' : 'Background image URL'} video={type==='video'} required defaultValue={String(content['hero_media_url']??media.url)}/>
    <MediaPicker name="hero_poster_url" label="Poster / fallback image URL" defaultValue={String(content['hero_poster_url']??media.poster)}/>
    <label>Background description<input name="hero_media_alt" defaultValue={media.alt} /></label>
  </div></fieldset>;
}