import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LeadershipCard } from '@/components/leadership-card';

afterEach(cleanup);

describe('Leadership portrait cards', () => {
  it('reserves a portrait with one placeholder when no approved photo exists', () => {
    render(<LeadershipCard leader={{ role: 'Group Chairman', bio: 'Profile coming soon' }} index={0} />);
    expect(screen.getAllByText('Profile coming soon')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Group Chairman' })).toBeTruthy();
    expect(screen.getByText('01')).toBeTruthy();
  });

  it('displays an approved portrait, name, role and biography', () => {
    render(<LeadershipCard leader={{ role: 'Group Chairman', name: 'Test Leader', image: '/portrait.jpg', bio: 'Approved biography.' }} index={1} />);
    expect(screen.getByRole('img', { name: 'Test Leader, Group Chairman' }).getAttribute('src')).toBe('/portrait.jpg');
    expect(screen.getByText('Test Leader')).toBeTruthy();
    expect(screen.getByText('Approved biography.')).toBeTruthy();
    expect(screen.queryByText('Profile coming soon')).toBeNull();
  });

  it('falls back gracefully when a portrait fails to load', () => {
    render(<LeadershipCard leader={{ role: 'Group Chairman', image: '/missing.jpg' }} index={0} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('Profile coming soon')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });
});