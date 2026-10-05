import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '@/test/render';
import { devicePreferences } from '@/test/preferences';
import { setPreferences } from '../testing';
import SettingsView from './SettingsView';

beforeEach(() => setPreferences({ readingLevel: 5, stepSize: 'medium', pebbleColor: 'lavender', pebbleModel: 'classic', pebblePersonality: 'gentle' }));
afterEach(() => vi.useRealTimers());

const stored = devicePreferences;

describe('SettingsView', () => {
  it('greets in the chosen personality and switches it', async () => {
    const { user } = renderWithProviders(<SettingsView />);
    expect(screen.getByText('Make this space yours')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Calm & minimal/ }));

    expect(screen.getByText('Your settings.')).toBeInTheDocument();
    expect(stored().pebblePersonality).toBe('calm');
  });

  it('picks a model and a color', async () => {
    const { user } = renderWithProviders(<SettingsView />);

    await user.click(screen.getByRole('button', { name: /Mochi Ball/ }));
    await user.click(screen.getByRole('button', { name: 'Sage' }));

    expect(stored()).toMatchObject({ pebbleModel: 'mochi', pebbleColor: 'sage' });
    expect(screen.getByRole('button', { name: 'Sage' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Pebble is now sage!')).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue('--pebble-color')).toBe('#8FAF8A');
  });

  it('sets the default reading level and step size', async () => {
    const { user } = renderWithProviders(<SettingsView />);

    fireEvent.change(screen.getByRole('slider', { name: 'Default reading level' }), { target: { value: '3' } });
    await user.click(screen.getByRole('button', { name: 'Small (5-10 min)' }));

    expect(stored()).toMatchObject({ readingLevel: 3, stepSize: 'small' });
    expect(screen.getByRole('slider', { name: 'Default reading level' })).toHaveAttribute('aria-valuetext', 'Reading level 3 of 10');
  });

  it('resets preferences only after asking', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { user } = renderWithProviders(<SettingsView />);

    await user.click(screen.getByRole('button', { name: 'Reset all preferences' }));

    expect(confirm).toHaveBeenCalledOnce();
    expect(stored().pebbleModel).toBe('classic');
  });
});
