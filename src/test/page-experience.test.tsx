import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageExperience } from '@/components/page-experience';

vi.mock('@tanstack/react-router', () => ({ useLocation: () => '/' }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Progressive editorial reveal', () => {
  it('keeps content visible without observer support', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<main><article className="market-card">Product</article><PageExperience /></main>);
    expect(document.querySelector('.market-card')).not.toHaveClass('reveal-ready');
  });
  it('reveals incoming content, registers new cards and responds to reduced motion', async () => {
    let callback: IntersectionObserverCallback | undefined;
    const observe = vi.fn();
    const unobserve = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      constructor(cb: IntersectionObserverCallback) { callback = cb; }
      observe = observe;
      unobserve = unobserve;
      disconnect = vi.fn();
    });
    let change: (() => void) | undefined;
    const preference = { matches: false, addEventListener: (_: string, cb: () => void) => { change = cb; }, removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', () => preference);
    const bounds = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000 } as DOMRect);
    const view = render(<main><article className="market-card">Product</article><PageExperience /></main>);
    const card = document.querySelector('.market-card');
    expect(card).toHaveClass('reveal-ready');
    if (card && callback) act(() => callback?.([{ target: card, isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(card).toHaveClass('is-revealed');
    expect(unobserve).toHaveBeenCalledWith(card);
    const newCard = document.createElement('article');
    newCard.className = 'market-card';
    await act(async () => { document.querySelector('main')?.append(newCard); });
    expect(newCard).toHaveClass('reveal-ready');
    act(() => { preference.matches = true; change?.(); });
    expect(card).not.toHaveClass('reveal-ready');
    expect(newCard).not.toHaveClass('reveal-ready');
    view.unmount();
    bounds.mockRestore();
  });
});