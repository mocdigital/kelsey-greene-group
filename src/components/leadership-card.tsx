import { useState } from 'react';

export function LeadershipCard({ leader, index }: { leader: Record<string, unknown>; index: number }) {
  const [failedPhoto, setFailedPhoto] = useState('');
  const photo = typeof leader['image'] === 'string' ? leader['image'].trim() : '';
  const name = typeof leader['name'] === 'string' ? leader['name'].trim() : '';
  const role = String(leader['role'] ?? '');
  const bio = typeof leader['bio'] === 'string' ? leader['bio'].trim() : '';

  return <article className="leadership-card">
    <div className="leadership-portrait">
      {photo && failedPhoto !== photo
        ? <img src={photo} alt={name ? `${name}, ${role}` : role} loading="lazy" width={640} height={800} onError={() => setFailedPhoto(photo)} />
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