import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// The demo flow (specs/testing.md): dev login, break a task into steps, finish
// a step, simplify a document, and see the agent and its "why" in the activity log.

signInEachTest();

test('the demo flow', async ({ page }) => {
  await test.step('break a task into steps with CalmSense, through the real backend', async () => {
    await page.getByRole('button', { name: 'Chat with Pebble' }).click();
    const chat = page.getByRole('dialog', { name: 'Chat with Pebble' });
    await chat.getByRole('textbox', { name: 'Message to Pebble' }).fill('Help me break down writing my essay');
    await chat.getByRole('button', { name: 'Send message' }).click();
    await expect(chat.getByText('CalmSense')).toBeVisible();
    await expect(chat.getByText("Let's do this together.")).toBeVisible();
    await page.getByRole('button', { name: 'Close chat', exact: true }).click();
  });

  await test.step('a new list is empty and offers example tasks', async () => {
    await page.getByRole('button', { name: 'Add example tasks' }).click();
    await expect(page.getByRole('button', { name: /Break down "Read Chapter 4/ })).toBeVisible();
  });

  await test.step('break a task on Today into steps, and finish one', async () => {
    await page.getByRole('button', { name: /Break down "Read Chapter 4/ }).click();
    const step = page.locator('.subtask-item', { hasText: 'Skim the chapter headings first' });
    await step.getByRole('button', { name: 'Check subtask' }).click();
    await expect(step.getByRole('button', { name: 'Uncheck subtask' })).toBeVisible();

    // Saved in the backend: a reload shows the same list, with the step still done
    await expect
      .poll(async () => (await (await page.request.get('/api/tasks')).json())[0].subtasks[0].completed)
      .toBe(true);
    await page.reload();
    await page.getByRole('button', { name: /Break down "Read Chapter 4/ }).click();
    await expect(
      page.locator('.subtask-item', { hasText: 'Skim the chapter headings first' }).getByRole('button', {
        name: 'Uncheck subtask',
      }),
    ).toBeVisible();
  });

  await test.step('simplify a document', async () => {
    await page.getByRole('link', { name: /Documents/ }).click();
    await page.getByRole('button', { name: /Design Thinking Syllabus/ }).click();
    const doc = page.getByRole('dialog', { name: 'Design Thinking Syllabus' });
    await doc.getByRole('slider', { name: 'Complexity (FK)' }).fill('2');
    await expect(doc.getByTestId('simplified-text')).toContainText("This class is about making things people actually want.");
    await expect(doc.getByText('Showing level 2.')).toBeVisible();
    await doc.getByRole('button', { name: 'Close document' }).click();
  });

  await test.step('see the agent and its "why" in the activity log', async () => {
    await page.getByRole('link', { name: /Activity/ }).click();
    // A new user's log holds only what really happened in this flow (A-022),
    // including the second break-down after the reload
    await expect(page.getByText('Showing 5 of 5 entries')).toBeVisible();
    const entry = page.locator('.activity-entry', { hasText: 'Reading level adjusted to 2' });
    await expect(entry.getByText('AdaptLens', { exact: true })).toBeVisible();
    await entry.getByRole('button', { name: 'Show reasoning' }).click();
    await expect(entry.getByText('User manually changed reading level from 5 to 2.')).toBeVisible();

    const chat = page.locator('.activity-entry', { hasText: 'Chat: decompose' });
    await expect(chat.getByText('CalmSense', { exact: true })).toBeVisible();
  });
});
