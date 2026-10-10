import { useState } from 'react';
import { homeMedia } from '@/lib/home-media';

export function HomeMediaFields({ content }: { content: Record<string, unknown> }) {
  const media = homeMedia(content);
  const [type, setType] = useState(media.type);
  return <fieldset className="span-two cms-home-media"><legend>Homepage background</legend><div className="form-grid">
    <label>Background type<select name="hero_media_type" value={type} onChange={event => setType(event.target.value)}><option value="image">Image</option><option value="video">Video</option></select></label>
    <label>{type === 'video' ? 'Video URL' : 'Background image URL'}<input name="hero_media_url" required defaultValue={media.url} placeholder={type === 'video' ? 'https://…/background.mp4' : 'https://…/background.jpg'} /></label>
    <label>Poster / fallback image URL<input name="hero_poster_url" defaultValue={media.poster} /></label>
    <label>Background description<input name="hero_media_alt" defaultValue={media.alt} /></label>
  </div></fieldset>;
}