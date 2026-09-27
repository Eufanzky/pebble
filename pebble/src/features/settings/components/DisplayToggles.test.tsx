import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { setPreferences } from '../testing';
import SettingsView from './SettingsView';

beforeEach(() => setPreferences({}));
afterEach(() => document.documentElement.classList.remove('reduce-animations'));

const latestLog = () => JSON.parse(window.localStorage.getItem('pebble-activity')!)[0];

describe('settings toggles', () => {
  it('turns reduce animations on and off, across the whole app', async () => {
    const { user } = renderWithProviders(<SettingsView />);
    const toggle = screen.getByRole('switch', { name: 'Reduce animations' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('reduce-animations');
    expect(latestLog()).toMatchObject({ agent: 'AdaptLens', action: 'Reduce animations enabled' });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement).not.toHaveClass('reduce-animations');
    expect(latestLog()).toMatchObject({ action: 'Reduce animations disabled' });
  });

  it('turns calm mode on, which removes emoji from text', async () => {
    const { user } = renderWithProviders(<SettingsView />);
    expect(screen.getByText('💬')).toBeInTheDocument(); // Microsoft Teams

    await user.click(screen.getByRole('switch', { name: 'Calm mode' }));

    expect(screen.getByRole('switch', { name: 'Calm mode' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText('💬')).not.toBeInTheDocument();
    expect(latestLog()).toMatchObject({ agent: 'AdaptLens', action: 'Calm mode enabled' });
  });

  it('shows the mic once voice input is on', async () => {
    const { user } = renderWithProviders(<SettingsView />);
    expect(screen.queryByRole('button', { name: 'Start voice input' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('switch', { name: 'Voice input' }));

    expect(screen.getByRole('button', { name: 'Start voice input' })).toBeInTheDocument();
  });
});
