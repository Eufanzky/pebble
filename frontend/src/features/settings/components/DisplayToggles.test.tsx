import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { setPreferences } from '../testing';
import { usePreferences } from '@/shared/preferences';
import SettingsView from './SettingsView';

// Calm mode applies across the app; this stands in for any text using it.
function StripProbe() {
  const { stripEmoji } = usePreferences();
  return <p data-testid="probe">{stripEmoji('Study 📚')}</p>;
}

beforeEach(() => setPreferences({}));
afterEach(() => document.documentElement.classList.remove('reduce-animations'));


describe('settings toggles', () => {
  it('turns reduce animations on and off, across the whole app', async () => {
    const { user } = renderWithProviders(<SettingsView />);
    const toggle = screen.getByRole('switch', { name: 'Reduce animations' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('reduce-animations');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement).not.toHaveClass('reduce-animations');
  });

  it('turns calm mode on, which removes emoji from text across the app', async () => {
    const { user } = renderWithProviders(<><SettingsView /><StripProbe /></>);
    expect(screen.getByTestId('probe')).toHaveTextContent('Study 📚');

    await user.click(screen.getByRole('switch', { name: 'Calm mode' }));

    expect(screen.getByRole('switch', { name: 'Calm mode' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('probe')).toHaveTextContent(/^Study$/);
  });

});
