import { useRef, useState } from 'react';
import { Upload, Images, Check, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
import { CmsImage } from './cms-image';
import { supabase } from '@/integrations/supabase/client';
import { resolveMedia } from '@/lib/media';

type Entry = { name: string; reference: string; preview: string; video: boolean };
export function MediaPicker({ name, label, defaultValue = '', video = false, required = false }: { name: string; label: string; defaultValue?: string; video?: boolean; required?: boolean }) {
  const [value, setValue] = useState(defaultValue), [preview, setPreview] = useState(''), [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [entries, setEntries] = useState<Entry[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  async function library() {
    setOpen(true); setBusy(true); setError('');
    try {
      const all: Entry[] = [];
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await supabase.storage.from('cms-media').list('uploads', { limit: 100, offset, sortBy: { column: 'created_at', order: 'desc' } });
        if (error) throw error;
        const files = (data ?? []).filter(file => video ? /\.(mp4|webm)$/i.test(file.name) : /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name));
        const paths = files.map(file => `uploads/${file.name}`);
        if (paths.length) {
          const { data: signed, error: signingError } = await supabase.storage.from('cms-media').createSignedUrls(paths, 3600);
          if (signingError) throw signingError;
          files.forEach((file, index) => all.push({ name: file.name, reference: `cms-media:uploads/${file.name}`, preview: signed?.[index]?.signedUrl ?? '', video: /\.(mp4|webm)$/i.test(file.name) }));
        }
        if ((data?.length ?? 0) < 100) break;
      }
      setEntries(all);
    } catch { setError('Media could not be loaded. Please try again.'); } finally { setBusy(false); }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    const allowed = video ? ['video/mp4', 'video/webm'] : ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowed.includes(file.type) || file.size > 20 * 1024 * 1024) { setError('Choose a supported file smaller than 20 MB.'); return; }
    setBusy(true); setError('');
    try {
      const extensions: Record<string, string> = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp', 'image/gif':'gif', 'image/avif':'avif', 'video/mp4':'mp4', 'video/webm':'webm' };
      const path = `uploads/${crypto.randomUUID()}.${extensions[file.type]}`;
      const { error } = await supabase.storage.from('cms-media').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data, error: signingError } = await supabase.storage.from('cms-media').createSignedUrl(path, 3600);
      if (signingError) throw signingError;
      setValue(`cms-media:${path}`); setPreview(data.signedUrl); setOpen(false);
    } catch { setError('Upload failed. Check your editing access and try again.'); } finally { setBusy(false); if (fileInput.current) fileInput.current.value = ''; }
  }
  return <div className="cms-media-picker"><label>{label}<input name={name} value={value} required={required} onChange={event => { setValue(event.target.value); setPreview(''); }} placeholder="https://… or select media" /></label>
    <div className="cms-media-actions"><Button type="button" variant="outline" disabled={busy} onClick={() => fileInput.current?.click()}><Upload/>Upload new</Button><Button type="button" variant="outline" disabled={busy} onClick={library}><Images/>Choose existing</Button>{busy && <span role="status"><LoaderCircle className="animate-spin"/>Loading media…</span>}</div>
    <input ref={fileInput} type="file" hidden accept={video ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif,image/avif'} aria-label={`Upload ${label}`} disabled={busy} onChange={event => upload(event.target.files?.[0])}/>
    {error && <p role="alert">{error}</p>}
    {value && !video && <CmsImage className="cms-media-preview" src={preview || resolveMedia(value)} alt={label} />}
    {value && video && <video className="cms-media-preview" src={preview || resolveMedia(value)} controls preload="metadata" />}
    {open && <div className="cms-media-library"><div className="cms-media-actions"><h3>Previously uploaded media</h3><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Close</Button></div>{!busy && !entries.length && <p>No matching uploads yet.</p>}<div className="cms-media-choices">{entries.map(entry => <Button type="button" variant="outline" className="cms-media-choice" key={entry.reference} aria-label={`Select ${entry.name}`} aria-pressed={value === entry.reference} onClick={() => { setValue(entry.reference); setPreview(entry.preview); setOpen(false); }}>{entry.video ? <video src={entry.preview} preload="metadata"/> : <CmsImage src={entry.preview} alt={entry.name}/>}<span>{value === entry.reference && <Check/>}{entry.name}</span></Button>)}</div></div>}
  </div>;
}