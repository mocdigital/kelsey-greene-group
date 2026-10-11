import { useEffect, useRef, useState } from 'react';
import { useRouter, useRouterState } from '@tanstack/react-router';

export function BrandTransition() {
  const router = useRouter();
  const path = useRouterState({ select: state => state.location.pathname });
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const show = (duration: number) => {
      clearTimeout(timer.current);
      setVisible(true);
      timer.current = setTimeout(() => setVisible(false), duration);
    };
    if (path === '/') show(650);
    const unsubscribe = router.subscribe('onBeforeLoad', event => {
      if (event.fromLocation?.pathname === event.toLocation.pathname) return;
      show(380);
    });
    return () => { unsubscribe(); clearTimeout(timer.current); };
  }, [router]);
  return <div className={`brand-transition${visible ? ' is-visible' : ''}`} aria-hidden={!visible}><div role={visible ? 'status' : undefined} aria-label={visible ? 'Loading page' : undefined}><img src="/media/brand/loading-logo.png" alt="Kelsey Greene Group" width={160} height={160}/><span className="brand-loading-line"/></div></div>;
}