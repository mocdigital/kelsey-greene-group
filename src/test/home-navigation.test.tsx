import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HomeNavigationRail } from '@/components/page-experience';

afterEach(cleanup);
describe('Homepage progress line', () => {
  it('renders a slim progress line without section titles', () => {
    render(<HomeNavigationRail />);
    const bar = screen.getByRole('progressbar', { name: 'Homepage reading progress' });
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.queryByRole('link')).toBeNull();
  });
  it('fills as the page scrolls', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
    render(<HomeNavigationRail />);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 });
    fireEvent.scroll(window);
    return new Promise<void>(resolve => requestAnimationFrame(() => {
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
      resolve();
    }));
  });
});
