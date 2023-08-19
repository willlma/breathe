import { test, expect } from './fixtures';

test('Forces you to wait', async ({ background, extensionId, page }) => {
  await page.goto('https://old.reddit.com/');
  await expect(page.locator('body')).toContainText('I want to procrastinate for');
});
