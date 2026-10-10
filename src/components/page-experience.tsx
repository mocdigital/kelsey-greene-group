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
    if (!main || typeof window.IntersectionObserver !== 'function') return;
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
        if (elements.has(element) || element.parentElement?.closest('.reveal-ready')) return;
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

export function HomeNavigationRail() {
  const [active, setActive] = useState('');
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const sections = homeSections.map(section => ({ id: section.id, element: document.getElementById(section.id) }));
      const current = sections.filter(section => section.element && section.element.getBoundingClientRect().top <= 240).at(-1);
      setActive(current?.id ?? '');
      const start = sections[0]?.element;
      const end = sections.at(-1)?.element;
      if (start && end) {
        const startY = start.getBoundingClientRect().top + window.scrollY - 64;
        const endY = end.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
        setProgress(Math.max(0, Math.min(100, (window.scrollY - startY) / Math.max(1, endY - startY) * 100)));
      }
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
  useEffect(() => {
    const link = document.querySelector('.home-rail a[aria-current]');
    const rail = link?.parentElement;
    if (!(link instanceof HTMLElement) || !rail || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: link.offsetLeft - rail.offsetLeft - 24, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [active]);
  return <nav className="home-rail" aria-label="Homepage sections"><div className="container">{homeSections.map((section, index) => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{section.label}</a>)}</div><progress className="home-reading-progress" value={progress} max={100} aria-label="Homepage reading progress" /></nav>;
}