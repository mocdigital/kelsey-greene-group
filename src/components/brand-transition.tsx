import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useRouter, useRouterState } from '@tanstack/react-router';

export function BrandTransition() {
  const router = useRouter();
  const path = useRouterState({ select: state => state.location.pathname });
  // The server and first client paint must already contain the loading screen.
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const show = (duration: number) => {
      clearTimeout(timer.current);
      setVisible(true);
      timer.current = setTimeout(() => setVisible(false), duration);
    };
    const showForPage = (pathname: string, duration: number) => {
      if (pathname === '/') {
        try {
          if (!sessionStorage.getItem('kelsey-home-intro-seen')) {
            sessionStorage.setItem('kelsey-home-intro-seen', 'true');
            show(1100);
            return;
          }
        } catch { /* Keep feedback bounded when browser storage is unavailable. */ }
      }
      show(duration);
    };
    showForPage(path, path === '/' ? 650 : 380);
    const unsubscribe = router.subscribe('onBeforeLoad', event => {
      if (event.fromLocation?.pathname === event.toLocation.pathname) return;
      // Commit the opaque cover before the destination can render.
      flushSync(() => showForPage(event.toLocation.pathname, 380));
    });
    return () => { unsubscribe(); clearTimeout(timer.current); };
  }, [router]);
  return <div className={`brand-transition${visible ? ' is-visible' : ''}`} aria-hidden={!visible}><div role={visible ? 'status' : undefined} aria-label={visible ? 'Loading page' : undefined}><img src="/media/brand/loading-logo.png" alt="Kelsey Greene Group" width={160} height={160}/><span className="brand-loading-line"/></div></div>;
}