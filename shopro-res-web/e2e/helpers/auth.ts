import { type Page } from '@playwright/test';

/**
 * Logs in as John Chef using PIN 1234.
 * Navigates to /staff, clicks the first staff card, enters the PIN.
 */
export async function loginAsJohnChef(page: Page): Promise<void> {
  await page.goto('/staff');
  await page.waitForLoadState('networkidle');

  // Click the first staff card (John Chef)
  const firstCard = page.locator('[data-testid="staff-card"]').first();
  if (await firstCard.count() > 0) {
    await firstCard.click();
  } else {
    // Fallback: click whichever card contains "Chef" or is first
    await page.locator('text=John Chef').first().click();
  }

  // Wait for PIN pad to appear
  await page.waitForSelector('button', { timeout: 5000 });

  // Enter PIN: 1, 2, 3, 4
  const pinButtons = page.locator('button');
  // Most PIN pads show digit buttons by their text
  const digits = ['1', '2', '3', '4'];
  for (const digit of digits) {
    await page.locator(`button:has-text("${digit}")`).first().click();
    await page.waitForTimeout(100);
  }

  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10_000 });
}
