import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// The demo flow (specs/testing.md): dev login, break tasks into steps with CalmSense (in chat and on
// Today), finish a step, have SimplifyCore simplify an upload, and see the agents and their "why" in the log.

signInEachTest();

test('the demo flow', async ({ page }) => {
  await test.step('ask CalmSense in chat, through the real backend, and put its steps on Today', async () => {
    await page.getByRole('button', { name: 'Chat with Pebble' }).click();
    const chat = page.getByRole('dialog', { name: 'Chat with Pebble' });
    await chat.getByRole('textbox', { name: 'Message to Pebble' }).fill('Help me break down writing my essay');
    await chat.getByRole('button', { name: 'Send message' }).click();
    await expect(chat.getByText('CalmSense')).toBeVisible();
    await expect(chat.getByRole('list', { name: /^Steps for/ })).toContainText('Do the first small part of');
    await chat.getByRole('button', { name: /^Add ".*" to Today$/ }).click();
    await expect(chat.getByRole('button', { name: /is on Today$/ })).toBeDisabled();
    await page.getByRole('button', { name: 'Close chat', exact: true }).click();
    await expect(page.getByRole('article', { name: 'Help me break down writing my essay' })).toBeVisible();
  });

  await test.step('break a task of your own into steps on Today, and finish one', async () => {
    await page.getByRole('textbox', { name: 'Add a new task' }).fill('Email Sam about the project');
    await page.getByRole('textbox', { name: 'Add a new task' }).press('Enter');
    const card = page.getByRole('article', { name: 'Email Sam about the project' });
    await card.getByRole('button', { name: 'Break down "Email Sam about the project" into steps' }).click();
    const step = card.locator('.step-item', { hasText: 'Get what you need for: Email Sam about the project' });
    await step.getByRole('button', { name: 'Check step' }).click();
    await expect(step.getByRole('button', { name: 'Uncheck step' })).toBeVisible();

    // Saved in the backend: after a reload the step is still done
    const saved = async () =>
      ((await (await page.request.get('/api/tasks')).json()) as { title: string; steps: { completed: boolean }[] }[])
        .find((t) => t.title === 'Email Sam about the project')
        ?.steps[0]?.completed;
    await expect.poll(saved).toBe(true);
    await page.reload();
    await card.getByRole('button', { name: 'Show steps' }).click();
    await expect(
      card.locator('.step-item', { hasText: 'Get what you need for' }).getByRole('button', { name: 'Uncheck step' }),
    ).toBeVisible();
  });

  await test.step('upload a document, have SimplifyCore simplify it, and put its action item on Today', async () => {
    await page.getByRole('link', { name: /Documents/ }).click();
    await page.getByLabel('Upload a document').setInputFiles({
      name: 'Project notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('The project report is long and detailed. You must send the draft to Sam by Friday. Lunch is at noon.'),
    });
    await page.getByRole('button', { name: /Project notes/ }).click();
    const doc = page.getByRole('dialog', { name: 'Project notes' });
    await expect(doc.getByTestId('simplified-text')).toHaveText(
      'The project report is long and detailed. You must send the draft to Sam by Friday.',
    );
    await doc.getByRole('button', { name: 'Tasks' }).click();
    await expect(page).toHaveURL(/\/today$/);
    await expect(page.getByRole('article', { name: 'You must send the draft to Sam by Friday' })).toBeVisible();
  });

  await test.step('see the agents and their "why" in the activity log', async () => {
    await page.getByRole('link', { name: /Activity/ }).click();
    const chat = page.locator('.activity-entry', { hasText: 'Chat: decompose' });
    await expect(chat.getByText('CalmSense', { exact: true })).toBeVisible();

    const breakdown = page.locator('.activity-entry', { hasText: 'Broke "Email Sam about the project" into 3 steps' });
    await expect(breakdown.getByText('CalmSense', { exact: true })).toBeVisible();
    await breakdown.getByRole('button', { name: 'Show reasoning' }).click();
    await expect(breakdown.getByText(/I split this into 3 steps/)).toBeVisible();

    const simplified = page.locator('.activity-entry', { hasText: 'Simplified "The project report is long' });
    await expect(simplified.getByText('SimplifyCore', { exact: true })).toBeVisible();
  });
});
