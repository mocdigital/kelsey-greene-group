import { useState } from 'react';
import { CmsImage } from './cms-image';
import { resolveMedia } from '@/lib/media';

export function LeadershipCard({ leader, index }: { leader: Record<string, unknown>; index: number }) {
  const [failedPhoto, setFailedPhoto] = useState('');
   const photo = resolveMedia(leader['image']);
  const name = typeof leader['name'] === 'string' ? leader['name'].trim() : '';
  const role = String(leader['role'] ?? '');
  const bio = typeof leader['bio'] === 'string' ? leader['bio'].trim() : '';

  return <article className="leadership-card">
    <div className="leadership-portrait">
      {photo && failedPhoto !== photo
        ? <CmsImage src={photo} alt={name ? `${name}, ${role}` : role} loading="lazy" width={640} height={800} onError={() => setFailedPhoto(photo)} />
        : <span>Profile coming soon</span>}
    </div>
    <div className="leadership-card-copy">
      <span className="leadership-number">{String(index + 1).padStart(2, '0')}</span>
      {name && <p className="leadership-name">{name}</p>}
      <h3>{role}</h3>
      {bio && bio.toLowerCase() !== 'profile coming soon' && <p>{bio}</p>}
    </div>
  </article>;
}