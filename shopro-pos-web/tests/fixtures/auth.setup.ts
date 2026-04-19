import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

/**
 * Authenticate as OWNER role using quick-login avatar
 * Saves storageState to .auth/user.json for reuse in all tests
 */
setup('authenticate as OWNER', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  
  // Wait for quick-login avatars to load
  await expect(page.getByRole('heading', { name: /quick staff login/i })).toBeVisible();
  
  // Click OWNER quick-login avatar (first in list, PIN: 1111)
  const ownerAvatar = page.locator('button').filter({ hasText: /owner/i }).first();
  await expect(ownerAvatar).toBeVisible();
  await ownerAvatar.click();
  
  // Wait for PIN entry to complete and navigate
  await page.waitForURL('**/dashboard');
  
  // Verify we're on dashboard
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
  
  console.log('✅ Auth state saved to:', AUTH_FILE);
});

/**
 * Alternative: Authenticate as MANAGER role (PIN: 2222)
 * Uncomment and rename if you need different role testing
 */
// setup('authenticate as MANAGER', async ({ page }) => {
//   await page.goto('http://localhost:5173/login');
//   await expect(page.getByRole('heading', { name: /quick staff login/i })).toBeVisible();
//   
//   const managerAvatar = page.locator('button').filter({ hasText: /manager/i }).first();
//   await expect(managerAvatar).toBeVisible();
//   await managerAvatar.click();
//   
//   await page.waitForURL('**/dashboard');
//   await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
//   
//   await page.context().storageState({ path: path.join(__dirname, '../.auth/manager.json') });
// });
