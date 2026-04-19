import { Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

/**
 * Login as staff and stay on the current page after login
 * @param page - Playwright page instance
 * @param staffName - Name of staff to login as (default: Emma Wilson)
 * @param pin - PIN code (default: 0000)
 */
export async function loginAsStaff(page: Page, staffName: string = 'Emma Wilson', pin: string = '0000'): Promise<void> {
  // Go to staff login
  await page.goto(`${BASE_URL}/staff`);
  
  // Wait for staff list to load
  await page.waitForSelector(`button:has-text("${staffName}")`, { timeout: 10000 });
  
  // Click on staff member
  await page.getByRole('button', { name: new RegExp(staffName, 'i') }).click();
  
  // Wait for PIN input to appear
  await page.waitForSelector('[role="button"]:has-text("1")', { timeout: 5000 });
  
  // Enter PIN
  for (const digit of pin) {
    await page.getByRole('button', { name: digit }).click();
  }
  
  // Wait for post-login transition
  await page.waitForTimeout(2000);
}

/**
 * Login and navigate to a feature via sidebar menu
 * @param page - Playwright page instance
 * @param menuLabel - Label of the menu item to click (e.g., "Dashboard", "Inventory")
 */
export async function loginAndNavigateTo(page: Page, menuLabel: string): Promise<void> {
  await loginAsStaff(page);
  
  // Wait for sidebar to be available
  await page.waitForTimeout(1000);
  
  // Click the menu item
  await page.getByRole('button', { name: new RegExp(menuLabel, 'i') }).click();
  
  // Wait for navigation
  await page.waitForTimeout(1500);
}
