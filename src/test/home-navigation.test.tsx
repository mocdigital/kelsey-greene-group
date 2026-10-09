import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HomeNavigationRail, homeSections } from '@/components/page-experience';

afterEach(cleanup);
describe('Homepage section navigation', () => {
  it('links to all six homepage sections with accessible names', () => {
    render(<HomeNavigationRail />);
    expect(screen.getByRole('navigation', { name: 'Homepage sections' })).toBeInTheDocument();
    for (const section of homeSections) {
      expect(screen.getByRole('link', { name: new RegExp(section.label) })).toHaveAttribute('href', `#${section.id}`);
    }
  });
  it('marks the current section when scrolling', () => {
    const section = document.createElement('section');
    section.id = 'group';
    document.body.append(section);
    render(<HomeNavigationRail />);
    fireEvent.scroll(window);
    expect(screen.getByRole('link', { name: /The Group/ })).toHaveAttribute('aria-current', 'location');
    section.remove();
  });
});