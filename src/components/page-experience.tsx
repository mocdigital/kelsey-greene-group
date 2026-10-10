import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';

export const homeSections = [
  { id: 'group', label: 'The Group' },
  { id: 'businesses', label: 'Our Businesses' },
  { id: 'products', label: 'Our Products' },
  { id: 'breakfasts', label: '1 Million Breakfasts' },
  { id: 'partnerships', label: 'Partnerships' },
  { id: 'enquire', label: 'Enquire' },
];

export function PageExperience() {
  const pathname = useLocation({ select: location => location.pathname });
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main || typeof IntersectionObserver !== 'function') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const elements = new Set<Element>();
    const selector = '.section-heading, .group-layout, .group-purpose-layout, .group-direction > div, .group-leadership-heading, .business-feature, .business-card, .product-card, .value-item, .leadership-card, .portfolio-strip > a, .partnerships-layout > div, .movement-layout > div, .movement-ambition > div, .enquiry-layout > div, .portfolio-business-layout > *, .portfolio-principles > article, .portfolio-band-layout > *, .partnership-heading > *, .partnership-path, .partnership-business-row, .movement-two-column > *, .movement-range-heading, .movement-path, .market-intro > *, .market-card, .market-featured > div, .article-item, .kg-card, .participation-grid > a';
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    const register = () => {
      if (preference.matches) return;
      main.querySelectorAll(selector).forEach(element => {
        if (elements.has(element) || element.parentElement?.closest('.reveal-ready') || element.closest('.product-marquee')) return;
        elements.add(element);
        // Already-visible content stays visible; only incoming content animates.
        if (element.getBoundingClientRect().top < window.innerHeight - 32) return;
        const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
        element.setAttribute('data-reveal-order', String(Math.max(0, siblings.indexOf(element)) % 4));
        element.classList.add('reveal-ready');
        observer.observe(element);
      });
    };
    const updatePreference = () => {
      observer.disconnect();
      elements.forEach(element => {
        element.classList.remove('reveal-ready', 'is-revealed');
        element.removeAttribute('data-reveal-order');
      });
      elements.clear();
      register();
    };
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(main, { childList: true, subtree: true });
    preference.addEventListener('change', updatePreference);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      preference.removeEventListener('change', updatePreference);
      elements.forEach(element => {
        element.classList.remove('reveal-ready', 'is-revealed');
        element.removeAttribute('data-reveal-order');
      });
    };
  }, [pathname]);
  return null;
}

/** Sleek reading-progress line beneath the sticky navbar; fills left to right as the homepage scrolls. */
export function HomeNavigationRail() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.max(0, Math.min(100, window.scrollY / max * 100)) : 0);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return <div className="home-progress-line" role="progressbar" aria-label="Homepage reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ transform: `scaleX(${progress / 100})` }} /></div>;
}
