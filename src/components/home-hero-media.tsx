import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { homeMedia } from '@/lib/home-media';

export function HomeHeroMedia({ content }: { content: Record<string, unknown> }) {
  const media = homeMedia(content);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReduced(preference.matches);
      if (preference.matches) video.current?.pause();
      else video.current?.play().catch(() => setPlaying(false));
    };
    sync();
    preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, [media.url]);
  useEffect(() => { setFailed(false); }, [media.url]);
  return <>
    <div className="home-hero-media" aria-hidden="true">
      <img src={media.type === 'image' ? media.url : media.poster} alt="" fetchPriority="high" />
      {media.type === 'video' && !failed && <video ref={video} src={media.url} poster={media.poster} muted loop playsInline autoPlay={!reduced} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} />}
    </div>
    {media.type === 'video' && !failed && <Button className="hero-video-control" variant="headerIcon" size="icon" title={playing ? 'Pause background video' : 'Play background video'} aria-label={playing ? 'Pause background video' : 'Play background video'} onClick={() => { const element = video.current; if (!element) return; if (element.paused) element.play().catch(() => setPlaying(false)); else element.pause(); }}>{playing ? <Pause /> : <Play />}</Button>}
  </>;
}