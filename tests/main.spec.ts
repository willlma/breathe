import { test, expect } from './fixtures';

test('Forces you to wait', async ({ background, extensionId, page }) => {
  await page.goto('https://old.reddit.com/');
  await expect(page.locator('body')).toContainText('Waste');
  await expect(page.locator('body')).toContainText('Focus on something 20 feet away');
});
