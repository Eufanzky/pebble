import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ActivityView } from '@/features/activity';
import { AccountSection, SignInView } from '@/features/auth';
import { PebbleCharacter } from '@/features/companion';
import { PebbleChat } from '@/features/chat';
import { DocumentsView } from '@/features/documents';
import { FocusView } from '@/features/focus';
import { SettingsView } from '@/features/settings';
import { StatsView } from '@/features/stats';
import { TodayView } from '@/features/tasks';
import { newTask, seed } from '@/features/tasks/testing';
import { renderWithProviders, screen } from './render';
import { setTestPreferences } from './preferences';
import { DesignSystemPreview } from '@/shared/ui';
import { accountStore } from './msw/account';
import { server } from './msw/server';
import { taskHandlers } from './msw/tasks';
import { suggestionStore } from './msw/suggestions';
import { simplifyHandlers } from './msw/simplify';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/today' }));
vi.mock('next-auth/react', () => ({ signIn: vi.fn(), signOut: vi.fn() }));

// Animations off, so every view renders its final state at once.
beforeEach(() => {
  setTestPreferences({ reduceAnimations: true, calmMode: false });
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
    ['Sign in', <SignInView key="signin" providers={['github', 'google', 'dev']} callbackUrl="/today" />],
    ['Account', <AccountSection key="account" name="Sam" userId="github:42" />],
    ['Design system', <DesignSystemPreview key="design-system" />],
    ['Stats', <StatsView key="stats" />],
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

  it('a task with its steps and explanation open', async () => {
    seed([
      newTask('Read Chapter 4', {
        whyExplanation: 'One step per section.',
        steps: [{ id: 's', title: 'Skim the headings', timeEstimate: '~5 min', completed: false }],
      }),
    ]);
    const { container, user } = renderWithProviders(<TodayView />);
    await user.click(await screen.findByRole('button', { name: 'Show steps' }));
    await user.click(screen.getAllByRole('button', { name: /Why did Pebble do this\?/ })[0]);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Focus on one step, after stopping, with "Mark this step done" (9.2)', async () => {
    seed([
      newTask('Write the report', {
        steps: [{ id: 's', title: 'Write the intro', timeEstimate: '~20 min', completed: false }],
      }),
    ]);
    const { container, user } = renderWithProviders(<FocusView taskId="seeded-1" stepId="seeded-1-1" />);
    await screen.findByText('Write the intro');
    await user.click(screen.getByRole('button', { name: 'Start focus session' }));
    await user.click(screen.getByRole('button', { name: 'Stop' }));
    await screen.findByRole('button', { name: 'Mark this step done' });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Settings with a daily reminder set (8.6)', async () => {
    setTestPreferences({ reminderTime: '09:00', reminderNotifications: false });
    const { container } = renderWithProviders(<SettingsView />);
    await screen.findByRole('switch', { name: 'Also as a notification' });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Today with a suggestion from AdaptLens', async () => {
    suggestionStore.offer({ key: 'reading_level:3', preference: 'readingLevel', value: 3, reason: 'You read at level 3.' });
    const { container } = renderWithProviders(<TodayView />);
    await screen.findByRole('region', { name: 'A suggestion from AdaptLens' });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('a breakdown with its undo toast', async () => {
    seed([newTask('Write the essay')]);
    const { container, user } = renderWithProviders(<TodayView />);
    await user.click(await screen.findByRole('button', { name: 'Break down "Write the essay" into steps' }));
    await screen.findByRole('button', { name: 'Undo' });

    expect(container).toContainElement(screen.getByRole('button', { name: 'Undo' }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('tasks with a due day: a time-left bar, the offer near it, and the choices once it is over (8.3, 8.4)', async () => {
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    seed([
      newTask('Later', { due: day(5) }),
      newTask('Tomorrow', { due: day(1) }),
      newTask('Earlier', { due: day(-3) }),
    ]);
    const { container, user } = renderWithProviders(<TodayView />);
    await screen.findByRole('group', { name: 'Make it smaller' });
    await user.click(screen.getByRole('button', { name: 'Move "Earlier" to another day' }));

    expect(screen.getAllByRole('meter', { name: 'Time left' })).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('a task CalmSense couldn\'t break down', async () => {
    seed([newTask('Write the essay')]);
    server.use(taskHandlers.breakdownStatus(503));
    const { container, user } = renderWithProviders(<TodayView />);
    await user.click(await screen.findByRole('button', { name: 'Break down "Write the essay" into steps' }));
    await screen.findByText(/CalmSense couldn.t break this down/);

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

  it('an upload while SimplifyCore works, and when it couldn\'t', async () => {
    server.use(simplifyHandlers.status(503));
    const { container, user } = renderWithProviders(<DocumentsView />);
    await user.upload(screen.getByLabelText('Upload a document'), new File(['Some notes.'], 'Notes.txt', { type: 'text/plain' }));
    await user.click(await screen.findByRole('button', { name: /Notes/ }));
    expect(await axe(container)).toHaveNoViolations();

    await screen.findByText(/SimplifyCore couldn.t simplify this/);
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
    accountStore.setActivity([
      {
        timestamp: new Date().toISOString(),
        agent: 'CalmSense',
        action: 'Broke "Essay" into 3 steps',
        reasoning: 'Small steps first.',
        safetyStatus: 'passed',
      },
    ]);
    const { container, user } = renderWithProviders(<ActivityView />);
    await user.click((await screen.findAllByRole('button', { name: 'Show reasoning' }))[0]);

    expect(await axe(container)).toHaveNoViolations();
  });
});
