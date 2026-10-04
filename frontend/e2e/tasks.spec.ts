import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// Editing, reordering and filtering the list (5.5).

signInEachTest();

test('editing, reordering and filtering the list (5.5)', async ({ page }) => {
  // Tall enough that every card is on screen: the drag below uses raw mouse moves, which don't scroll
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.getByRole('button', { name: 'Add example tasks' }).click();
  const todo = page.getByRole('region', { name: /To do/ });
  await expect(todo.getByRole('article')).toHaveCount(4);
  const titles = () => todo.getByRole('article').evaluateAll((cards) => cards.map((c) => c.getAttribute('aria-label')));

  // Edit
  await page.getByRole('button', { name: 'Edit "Take a 10-minute walk"' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit task' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Take a short walk');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(todo.getByRole('article', { name: 'Take a short walk' })).toBeVisible();

  // Reorder by keyboard: the walk to the top
  await page.getByRole('button', { name: 'Move "Take a short walk"' }).focus();
  await page.keyboard.press('Home');
  await expect.poll(titles).toEqual([
    'Take a short walk',
    'Read Chapter 4 of the design textbook',
    "Reply to Professor Martinez's email",
    'Work on group project proposal',
  ]);

  // Reorder by dragging the handle: the email to the bottom
  const handle = page.getByRole('button', { name: `Move "Reply to Professor Martinez's email"` });
  const from = (await handle.boundingBox())!;
  const last = (await todo.getByRole('article').last().boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, last.y + last.height - 4, { steps: 8 });
  await page.mouse.up();
  await expect.poll(titles).toEqual([
    'Take a short walk',
    'Read Chapter 4 of the design textbook',
    'Work on group project proposal',
    "Reply to Professor Martinez's email",
  ]);

  // Saved: the same order after a reload
  await page.reload();
  await expect.poll(titles).toEqual([
    'Take a short walk',
    'Read Chapter 4 of the design textbook',
    'Work on group project proposal',
    "Reply to Professor Martinez's email",
  ]);

  // Filter
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('walk');
  await expect.poll(titles).toEqual(['Take a short walk']);
});
