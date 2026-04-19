import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

/**
 * Authenticate as Staff via PIN login
 * Saves storageState to .auth/user.json for reuse in all tests
 * 
 * App uses custom auth store (useAuthStore) with restaurantId
 */
setup('authenticate as staff', async ({ page }) => {
  // Go to staff login page
  await page.goto('http://localhost:5173/staff');
  
  // Wait for PIN keypad to load
  await expect(page.getByRole('heading', { name: /staff|pos|login/i })).toBeVisible();
  
  // Look for quick-login avatars or enter PIN manually
  // Try quick-login first (if available)
  const quickLoginAvatar = page.locator('button').filter({ has: page.locator('img') }).first();
  
  if (await quickLoginAvatar.isVisible().catch(() => false)) {
    await quickLoginAvatar.click();
  } else {
    // Manual PIN entry (default: 1234 or 1111)
    const keypadButtons = page.locator('button').filter({ hasText: /^[0-9]$/ });
    
    // Enter PIN: 1-2-3-4
    for (const digit of ['1', '2', '3', '4']) {
      const btn = page.getByRole('button', { name: digit, exact: true });
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(100);
      }
    }
  }
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Verify we're on dashboard
  await expect(page.getByRole('heading', { name: /dashboard|nexus/i })).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
  
  console.log('✅ Auth state saved to:', AUTH_FILE);
});

/**
 * Alternative: ShoPro admin login (email/password)
 * For testing admin-only features
 */
// setup('authenticate as shopro admin', async ({ page }) => {
//   await page.goto('http://localhost:5173/login');
//   
//   // Enter admin credentials
//   await page.getByLabel(/email/i).fill('admin@shopro.com');
//   await page.getByLabel(/password/i).fill('admin123');
//   await page.getByRole('button', { name: /login|sign in/i }).click();
//   
//   await page.waitForURL('**/dashboard');
//   await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
//   
//   await page.context().storageState({ path: AUTH_FILE });
// });
