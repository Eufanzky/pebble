import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, within } from '@/test/render';
import { documentHandlers } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import DocumentsView from './DocumentsView';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('DocumentsView', () => {
  it('lists the sample documents, labelled as examples, and opens one', async () => {
    const { user } = renderWithProviders(<DocumentsView />);
    expect(within(screen.getByRole('button', { name: /Design Thinking Syllabus/ })).getByText('Example')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Design Thinking Syllabus/ }));

    expect(screen.getByRole('dialog', { name: 'Design Thinking Syllabus' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close document' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('adds an uploaded text file as a document you can open', async () => {
    const { user } = renderWithProviders(<DocumentsView />);

    await user.upload(screen.getByLabelText('Upload a document'), new File(['Plain words.'], 'My notes.txt', { type: 'text/plain' }));

    await user.click(await screen.findByRole('button', { name: /My notes/ }));
    expect(await within(screen.getByRole('dialog', { name: 'My notes' })).findByTestId('simplified-text')).toHaveTextContent('Level 5: Plain words.');
  });

  // A-019: PDFs used to become a placeholder crediting a service the app doesn't use.
  it('shows the text of an uploaded PDF, read by the backend', async () => {
    server.use(documentHandlers.parsed('Words from the PDF.'));
    const { user } = renderWithProviders(<DocumentsView />);

    await user.upload(screen.getByLabelText('Upload a document'), new File(['%PDF'], 'Spec.pdf', { type: 'application/pdf' }));

    await user.click(await screen.findByRole('button', { name: /Spec/ }));
    expect(await within(screen.getByRole('dialog', { name: 'Spec' })).findByTestId('simplified-text')).toHaveTextContent('Level 5: Words from the PDF.');
    expect(screen.queryByText(/Document Intelligence/)).not.toBeInTheDocument();
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
