import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
import DocumentsView from './DocumentsView';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeEach(() => {
  setTestPreferences({ reduceAnimations: true });
});

const focusables = (dialog: HTMLElement) =>
  Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])'));

async function openDocument() {
  const view = renderWithProviders(<DocumentsView />);
  const opener = screen.getByRole('button', { name: /Design Thinking Syllabus/ });
  opener.focus();
  await view.user.keyboard('{Enter}');
  const dialog = screen.getByRole('dialog', { name: 'Design Thinking Syllabus' });
  await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  return { ...view, opener, dialog };
}

describe('document modal keyboard', () => {
  it('opens from the keyboard and focuses the first control', async () => {
    const { dialog } = await openDocument();

    expect(document.activeElement).toBe(focusables(dialog)[0]);
  });

  it('keeps Tab and Shift+Tab inside the modal', async () => {
    const { user, dialog } = await openDocument();
    const items = focusables(dialog);

    items.at(-1)!.focus();
    await user.tab();
    expect(items[0]).toHaveFocus();

    await user.tab({ shift: true });
    expect(items.at(-1)).toHaveFocus();
  });

  it('closes on Escape and gives focus back to the document card', async () => {
    const { user, opener } = await openDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('traps focus in the reader on top, and returns to the Reader button when it closes', async () => {
    const { user } = await openDocument();
    const readerButton = screen.getByRole('button', { name: 'Reader' });
    readerButton.focus();
    await user.keyboard('{Enter}');
    const reader = await screen.findByRole('dialog', { name: 'Reader' });
    await waitFor(() => expect(reader).toContainElement(document.activeElement as HTMLElement));

    const items = focusables(reader);
    items.at(-1)!.focus();
    await user.tab();
    expect(items[0]).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Reader' })).not.toBeInTheDocument());
    expect(readerButton).toHaveFocus();
    expect(screen.getByRole('dialog', { name: 'Design Thinking Syllabus' })).toBeInTheDocument();
  });
});
