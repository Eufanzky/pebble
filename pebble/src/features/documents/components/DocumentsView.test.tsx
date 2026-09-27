import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, within } from '@/test/render';
import DocumentsView from './DocumentsView';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('DocumentsView', () => {
  it('lists the sample documents and opens one', async () => {
    const { user } = renderWithProviders(<DocumentsView />);

    await user.click(screen.getByRole('button', { name: /Design Thinking Syllabus/ }));

    expect(screen.getByRole('dialog', { name: 'Design Thinking Syllabus' })).toBeInTheDocument();
    const [latest] = JSON.parse(window.localStorage.getItem('pebble-activity')!);
    expect(latest).toMatchObject({ agent: 'CalmSense', action: 'User opened "Design Thinking Syllabus"' });

    await user.click(screen.getByRole('button', { name: 'Close document' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds an uploaded text file as a document you can open', async () => {
    const { user } = renderWithProviders(<DocumentsView />);

    await user.upload(screen.getByLabelText('Upload a document'), new File(['Plain words.'], 'My notes.txt', { type: 'text/plain' }));

    await user.click(await screen.findByRole('button', { name: /My notes/ }));
    expect(within(screen.getByRole('dialog', { name: 'My notes' })).getByTestId('simplified-text')).toHaveTextContent('Plain words.');
  });

  it('ignores files it cannot read', async () => {
    renderWithProviders(<DocumentsView />);
    const before = screen.getAllByRole('button').length;

    // Bypasses the input's `accept` filter, as a drop would
    fireEvent.change(screen.getByLabelText('Upload a document'), {
      target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] },
    });

    expect(screen.getAllByRole('button')).toHaveLength(before);
  });
});
