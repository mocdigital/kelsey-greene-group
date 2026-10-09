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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06 });
    const elements = document.querySelectorAll('main .section-heading, main .group-layout, main .business-card, main .product-card, main .value-item, main .group-leaders article, main .participation-grid > a');
    elements.forEach(element => { element.classList.add('reveal-ready'); observer.observe(element); });
    return () => { observer.disconnect(); elements.forEach(element => element.classList.remove('reveal-ready', 'is-revealed')); };
  }, [pathname]);
  return null;
}

export function HomeNavigationRail() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const update = () => {
      const sections = homeSections.map(section => ({ id: section.id, element: document.getElementById(section.id) }));
      const current = sections.filter(section => section.element && section.element.getBoundingClientRect().top <= 240).at(-1);
      setActive(current?.id ?? '');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <nav className="home-rail" aria-label="Homepage sections"><div className="container">{homeSections.map((section, index) => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{section.label}</a>)}</div></nav>;
}