import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrandTransition } from '@/components/brand-transition';

const routing = vi.hoisted(() => ({ path: '/', listener: undefined as undefined | ((event: { fromLocation: { pathname: string }; toLocation: { pathname: string } }) => void) }));
const router = { subscribe: (_name: string, listener: typeof routing.listener) => { routing.listener = listener; return () => { routing.listener = undefined; }; } };
vi.mock('@tanstack/react-router', () => ({ useRouter: () => router, useRouterState: () => routing.path }));

beforeEach(() => { vi.useFakeTimers(); sessionStorage.clear(); routing.path = '/'; });
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('Branded page feedback', () => {
  it('extends only the first homepage opening in the session', () => {
    const first = render(<BrandTransition />);
    act(() => { vi.advanceTimersByTime(700); });
    expect(first.container.firstChild).toHaveClass('is-visible');
    act(() => { vi.advanceTimersByTime(400); });
    expect(first.container.firstChild).not.toHaveClass('is-visible');
    first.unmount();
    const repeat = render(<BrandTransition />);
    act(() => { vi.advanceTimersByTime(650); });
    expect(repeat.container.firstChild).not.toHaveClass('is-visible');
  });
  it('extends a first homepage arrival from another page but keeps later transitions brief', () => {
    routing.path = '/group';
    const view = render(<BrandTransition />);
    act(() => { routing.listener?.({ fromLocation: { pathname: '/group' }, toLocation: { pathname: '/' } }); vi.advanceTimersByTime(700); });
    expect(view.container.firstChild).toHaveClass('is-visible');
    act(() => { vi.advanceTimersByTime(400); routing.listener?.({ fromLocation: { pathname: '/' }, toLocation: { pathname: '/group' } }); vi.advanceTimersByTime(380); });
    expect(view.container.firstChild).not.toHaveClass('is-visible');
  });
});