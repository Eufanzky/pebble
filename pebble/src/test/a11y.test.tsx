import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ActivityView } from '@/features/activity';
import { PebbleCharacter } from '@/features/companion';
import { PebbleChat } from '@/features/chat';
import { DocumentsView } from '@/features/documents';
import { FocusView } from '@/features/focus';
import { SettingsView } from '@/features/settings';
import { TodayView } from '@/features/tasks';
import { act, renderHookWithProviders, renderWithProviders, screen } from './render';
import { usePreferences } from '@/shared/preferences';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/today' }));

// Animations off, so every view renders its final state at once.
beforeEach(() => {
  const { result, unmount } = renderHookWithProviders(() => usePreferences());
  act(() => result.current.setPreferences((prev) => ({ ...prev, reduceAnimations: true, calmMode: false })));
  unmount();
});

async function expectNoViolations(ui: ReactElement) {
  const { container } = renderWithProviders(ui);
  expect(await axe(container)).toHaveNoViolations();
  return container;
}

// Each feature's main view, as the user first sees it.
describe('axe: feature views', () => {
  it.each([
    ['Today', <TodayView key="today" />],
    ['Documents', <DocumentsView key="documents" />],
    ['Activity', <ActivityView key="activity" />],
    ['Settings', <SettingsView key="settings" />],
    ['Focus', <FocusView key="focus" />],
    ['Pebble', <PebbleCharacter key="pebble" />],
  ])('%s has no violations', async (_, ui) => {
    await expectNoViolations(ui);
  });
});

// The states behind a click: open panels, modals and expanded cards.
describe('axe: interactive states', () => {
  it('the chat panel with a reply', async () => {
    const { container, user } = renderWithProviders(<PebbleChat />);
    await user.click(screen.getByRole('button', { name: 'Chat with Pebble' }));
    await user.type(screen.getByRole('textbox', { name: 'Message to Pebble' }), 'Hello{Enter}');
    await screen.findByText('I am here with you.');

    expect(await axe(container)).toHaveNoViolations();
  });

  it('a task broken down, with its explanation open', async () => {
    const { container, user } = renderWithProviders(<TodayView />);
    await user.click(screen.getAllByRole('button', { name: /Break down/ })[0]);
    await user.click(screen.getAllByRole('button', { name: /Why did Pebble do this\?/ })[0]);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('a document open in the modal, in both views, with the comprehension check', async () => {
    const { container, user } = renderWithProviders(<DocumentsView />);
    await user.click(screen.getByRole('button', { name: /Design Thinking Syllabus/ }));
    await user.click(screen.getByRole('button', { name: 'Check my understanding' }));
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: 'reader' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('the built-in reader with its tools on', async () => {
    const { container, user } = renderWithProviders(<DocumentsView />);
    await user.click(screen.getByRole('button', { name: /Design Thinking Syllabus/ }));
    await user.click(screen.getByRole('button', { name: 'Reader' }));
    await screen.findByRole('dialog', { name: 'Reader' });
    await user.click(screen.getByRole('button', { name: 'Parts of Speech' }));
    await user.click(screen.getByRole('button', { name: /Translate/ }));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('the activity log with reasoning shown', async () => {
    const { container, user } = renderWithProviders(<ActivityView />);
    await user.click(screen.getAllByRole('button', { name: 'Show reasoning' })[0]);

    expect(await axe(container)).toHaveNoViolations();
  });
});
