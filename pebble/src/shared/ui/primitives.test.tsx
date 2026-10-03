import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Button, Card, Chip, Dialog, Field, IconButton } from '.';

describe('Button', () => {
  it('is a plain button with its variant, never a form submit by accident', () => {
    render(<Button variant="primary">Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('ui-button', 'ui-button--primary', 'ui-button--md');
  });

  it('shows it is busy and cannot be pressed again', async () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('hides its icon from screen readers', () => {
    render(<Button icon="✦">Break it down</Button>);

    expect(screen.getByRole('button', { name: 'Break it down' })).toBeInTheDocument();
  });
});

describe('IconButton', () => {
  it('is named by its label', async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Open menu" onClick={onClick}>
        ≡
      </IconButton>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Card', () => {
  it('renders as the element asked for, with its tone and padding', () => {
    render(
      <Card as="section" tone="raised" padding="lg" aria-label="Up next">
        Read Chapter 4
      </Card>,
    );

    expect(screen.getByRole('region', { name: 'Up next' })).toHaveClass('ui-card', 'ui-card--raised', 'ui-card--pad-lg');
  });
});

describe('Field', () => {
  it('labels the control and links the hint', () => {
    render(<Field label="Task" hint="One thing you want to do." />);

    const input = screen.getByRole('textbox', { name: 'Task' });
    expect(input).toHaveAccessibleDescription('One thing you want to do.');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks the control and explains what to change', () => {
    render(<Field label="Task" note="Give it a few words." />);

    const input = screen.getByRole('textbox', { name: 'Task' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Give it a few words.');
  });

  it('can be several lines', async () => {
    render(<Field label="Notes" multiline defaultValue="" />);

    const area = screen.getByRole('textbox', { name: 'Notes' });
    expect(area.tagName).toBe('TEXTAREA');
    await userEvent.type(area, 'a{Enter}b');
    expect(area).toHaveValue('a\nb');
  });
});

describe('Chip', () => {
  it('is a label without onClick', () => {
    render(<Chip tone="study">Study</Chip>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Study').closest('.ui-chip')).toHaveAttribute('data-tone', 'study');
  });

  it('is a toggle with onClick', async () => {
    function Filter() {
      const [on, setOn] = useState(false);
      return (
        <Chip tone="wellbeing" pressed={on} onClick={() => setOn(!on)}>
          Wellbeing
        </Chip>
      );
    }
    render(<Filter />);

    const chip = screen.getByRole('button', { name: 'Wellbeing' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Dialog', () => {
  function Host({ onClose = vi.fn() }: { onClose?: () => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Edit task</button>
        {open && (
          <Dialog
            title="Edit task"
            onClose={() => {
              onClose();
              setOpen(false);
            }}
          >
            <p>Inside</p>
            <button>Save</button>
          </Dialog>
        )}
      </>
    );
  }

  it('is a modal named by its title, takes focus, and gives it back on close', async () => {
    const user = userEvent.setup();
    render(<Host />);
    const trigger = screen.getByRole('button', { name: 'Edit task' });

    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Edit task' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await vi.waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on its close button and on a click outside, not on a click inside', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Host onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Edit task' }));
    await user.click(screen.getByText('Inside'));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Edit task' }));
    await user.click(screen.getByRole('dialog').parentElement!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('axe', () => {
  it('finds nothing in any primitive', async () => {
    const { container } = render(
      <main>
        <Button variant="primary">Save</Button>
        <Button variant="ghost" size="sm">
          Later
        </Button>
        <IconButton label="Settings">⚙</IconButton>
        <Card as="section" aria-label="Card">
          <Field label="Task" hint="A few words." />
          <Field label="Notes" multiline note="Add a line." />
          <Chip tone="project">Project</Chip>
          <Chip pressed onClick={() => {}}>
            All
          </Chip>
        </Card>
        <Dialog title="Edit task" onClose={() => {}}>
          <p>Body</p>
        </Dialog>
      </main>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

// Older pieces that 5.2 and 5.7 move onto the tokens.
const LEGACY: string[] = ['ScreenBackground.tsx', 'ToastContext.tsx'];

describe('tokens only', () => {
  // Colours are defined once, in tokens.css; everything else refers to them.
  const COLOUR = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i;
  const dir = __dirname;
  const files = readdirSync(dir).filter(
    (f) => /\.(tsx|css)$/.test(f) && f !== 'tokens.css' && !f.endsWith('.test.tsx') && !LEGACY.includes(f),
  );

  it.each(files)('%s uses no colour literals', (file) => {
    const lines = readFileSync(join(dir, file), 'utf8').split('\n');
    expect(lines.filter((line) => COLOUR.test(line))).toEqual([]);
  });
});
