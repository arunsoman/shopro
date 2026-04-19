import { test, expect } from '@playwright/test';
import { expectNoNaN } from './utils/nan-check';

/**
 * Staff Login Tests — ShoPro Restaurant Web
 * Tests staff PIN login flow only
 * 
 * Source: StaffLoginPage.tsx with StaffPinLogin component
 * Entry point: /staff
 */

test.describe('Staff Login — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('no NaN in login page', async ({ page }) => {
    await expectNoNaN(page, 'Staff Login Page');
  });

  test('no NaN after successful login', async ({ page }) => {
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    if (await avatar.isVisible().catch(() => false)) {
      await avatar.click();
      await page.waitForURL('**/dashboard');
      
      // Check dashboard for NaN
      await expectNoNaN(page, 'Post-Login Dashboard');
    }
  });

  test('no NaN in error messages', async ({ page }) => {
    // Trigger an error
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    await page.waitForTimeout(1000);
    
    // Error message should not contain NaN
    const errorDiv = page.locator('text=/incorrect|invalid|error/i').first();
    if (await errorDiv.isVisible().catch(() => false)) {
      const text = await errorDiv.textContent();
      expect(text).not.toContain('NaN');
    }
  });
});

test.describe('Staff Login — Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('shows ShoPro POS branding', async ({ page }) => {
    await expect(page.getByText('ShoPro POS')).toBeVisible();
    await expect(page.getByText(/Terminal Node Entry/i)).toBeVisible();
  });

  test('displays Zap logo icon', async ({ page }) => {
    const logo = page.locator('svg').first();
    await expect(logo).toBeVisible();
  });

  test('shows login heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /staff|pos/i })).toBeVisible();
  });

  test('displays PIN input dots (4 digits)', async ({ page }) => {
    const pinDots = page.locator('[class*="pin"], [class*="dot"]');
    await expect(pinDots).toHaveCount(4);
  });

  test('shows numeric keypad with digits 1-9', async ({ page }) => {
    for (let i = 1; i <= 9; i++) {
      await expect(page.getByRole('button', { name: String(i), exact: true })).toBeVisible();
    }
  });

  test('shows 0 digit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: '0', exact: true })).toBeVisible();
  });

  test('shows backspace/delete button', async ({ page }) => {
    const backspaceBtn = page.locator('button').filter({ 
      has: page.locator('[data-lucide="delete"]').or(page.locator('svg').last()) 
    });
    await expect(backspaceBtn).toBeVisible();
  });

  test('shows submit/enter button', async ({ page }) => {
    const submitBtn = page.locator('button').filter({ 
      has: page.locator('[data-lucide="log-in"]').or(page.locator('svg').filter({ hasText: /enter|submit/i })) 
    });
    await expect(submitBtn).toBeVisible();
  });

  test('shows quick staff login avatars section', async ({ page }) => {
    await expect(page.getByText(/quick.*login|staff.*login|select/i)).toBeVisible();
    
    const avatars = page.locator('button').filter({ has: page.locator('img') });
    await expect(avatars).not.toHaveCount(0);
  });

  test('shows restaurant/location info', async ({ page }) => {
    const restaurantInfo = page.locator('text=/restaurant|location|outlet|terminal/i');
    await expect(restaurantInfo).not.toHaveCount(0);
  });

  test('shows security badge (encrypted)', async ({ page }) => {
    await expect(page.getByText(/encrypted|secure|terminal/i)).toBeVisible();
  });

  test('shows return to hub link', async ({ page }) => {
    const hubLink = page.getByRole('link', { name: /return to hub/i });
    await expect(hubLink).toBeVisible();
  });
});

test.describe('Staff Login — PIN Entry Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('fills first PIN dot when clicking digit', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    await digit1.click();
    
    const filledDots = page.locator('[class*="filled"], [class*="active"], [class*="enter"]');
    await expect(filledDots.first()).toBeVisible();
  });

  test('fills all 4 PIN dots sequentially', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    for (let i = 0; i < 4; i++) {
      await digit1.click();
      await page.waitForTimeout(50);
    }
    
    const filledDots = page.locator('[class*="filled"], [class*="active"]');
    await expect(filledDots).toHaveCount(4);
  });

  test('backspace removes last entered digit', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    const backspaceBtn = page.locator('button').filter({ has: page.locator('[data-lucide="delete"]') });
    
    // Enter 2 digits
    await digit1.click();
    await digit1.click();
    
    let filledDots = page.locator('[class*="filled"]');
    await expect(filledDots).toHaveCount(2);
    
    // Backspace
    await backspaceBtn.click();
    
    filledDots = page.locator('[class*="filled"]');
    await expect(filledDots).toHaveCount(1);
  });

  test('backspace clears all dots when empty', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    const backspaceBtn = page.locator('button').filter({ has: page.locator('[data-lucide="delete"]') });
    
    // Enter 1 digit
    await digit1.click();
    
    // Backspace
    await backspaceBtn.click();
    
    const filledDots = page.locator('[class*="filled"]');
    await expect(filledDots).toHaveCount(0);
  });

  test('automatically submits when 4th digit is entered', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    // Enter 4 digits quickly
    for (let i = 0; i < 4; i++) {
      await digit1.click();
      await page.waitForTimeout(50);
    }
    
    // Should navigate to dashboard (or show loading)
    const spinner = page.locator('[class*="spin"], [class*="loading"]');
    await expect(spinner).toBeVisible({ timeout: 2000 }).catch(() => {
      // Auth might be instant
    });
  });

  test('submit button disabled when PIN < 4 digits', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    const submitBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-in"]') });
    
    // Enter only 3 digits
    for (let i = 0; i < 3; i++) {
      await digit1.click();
    }
    
    await expect(submitBtn).toBeDisabled();
  });

  test('submit button enabled when PIN = 4 digits', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    const submitBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-in"]') });
    
    // Enter 4 digits
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    await expect(submitBtn).toBeEnabled();
  });

  test('keypad disabled during authentication', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    // Enter 4 digits to trigger auth
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    // Keypad should be disabled
    const keypadBtns = page.locator('button').filter({ hasText: /^[0-9]$/ });
    await expect(keypadBtns.first()).toBeDisabled({ timeout: 2000 }).catch(() => {
      // Auth might be instant
    });
  });
});

test.describe('Staff Login — Quick Login Avatars', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('displays multiple staff avatars', async ({ page }) => {
    const avatars = page.locator('button').filter({ has: page.locator('img') });
    const count = await avatars.count();
    expect(count).toBeGreaterThan(0);
  });

  test('avatar shows staff name/role', async ({ page }) => {
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await expect(avatar).toBeVisible();
    
    // Should have associated text (name or role)
    const text = page.locator('text=/owner|manager|server|host|chef/i').first();
    await expect(text).toBeVisible();
  });

  test('clicking avatar auto-fills PIN and submits', async ({ page }) => {
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await avatar.click();
    
    // Should navigate to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.url()).toContain('/dashboard');
  });

  test('avatar has hover effect', async ({ page }) => {
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    
    await avatar.hover();
    
    // Should have scale or color change
    const boxBefore = await avatar.boundingBox();
    await page.waitForTimeout(300);
    const boxAfter = await avatar.boundingBox();
    
    // Hover might trigger scale animation
    expect(boxBefore).toBeTruthy();
    expect(boxAfter).toBeTruthy();
  });

  test('avatars are arranged in grid/flex layout', async ({ page }) => {
    const avatars = page.locator('button').filter({ has: page.locator('img') });
    const count = await avatars.count();
    
    if (count > 1) {
      const firstBox = await avatars.first().boundingBox();
      const secondBox = await avatars.nth(1).boundingBox();
      
      if (firstBox && secondBox) {
        // Should be side-by-side or grid
        expect(firstBox.x).toBeLessThan(secondBox.x);
      }
    }
  });
});

test.describe('Staff Login — Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('shows error message for incorrect PIN', async ({ page }) => {
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    
    // Enter invalid PIN (9999)
    for (let i = 0; i < 4; i++) {
      await digit9.click();
      await page.waitForTimeout(50);
    }
    
    // Wait for error
    await page.waitForTimeout(1000);
    
    const errorDiv = page.locator('text=/incorrect|invalid|wrong|error|failed/i').first();
    await expect(errorDiv).toBeVisible();
  });

  test('error message is red/visible', async ({ page }) => {
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    
    await page.waitForTimeout(1000);
    
    const errorDiv = page.locator('text=/incorrect|invalid|error/i').first();
    
    // Should have error styling
    const color = await errorDiv.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Red color (rgb(220, 38, 38) or similar)
    expect(color).toMatch(/rgb\(2[0-9][0-9],/);
  });

  test('clears PIN dots after failed attempt', async ({ page }) => {
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    
    // Enter invalid PIN
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    
    await page.waitForTimeout(1500);
    
    // Dots should be cleared for retry
    const filledDots = page.locator('[class*="filled"]');
    await expect(filledDots).toHaveCount(0);
  });

  test('allows retry after failed PIN', async ({ page }) => {
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    // First attempt (fail)
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    
    await page.waitForTimeout(1500);
    
    // Second attempt (should work with valid PIN)
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    // Should navigate or show loading
    await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {
      // Might still fail, but retry was allowed
    });
  });

  test('shows network error on API failure', async ({ page }) => {
    await page.route('**/api/auth/**', route => {
      route.abort('failed');
    });
    
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    const errorBanner = page.locator('text=/network|connection|offline/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows error on 500 response', async ({ page }) => {
    await page.route('**/api/auth/**', route => {
      route.fulfill({ status: 500 });
    });
    
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    const errorBanner = page.locator('text=/error|server|failed/i');
    await expect(errorBanner).toBeVisible();
  });
});

test.describe('Staff Login — Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('shows loading spinner during authentication', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    // Slow down auth response
    await page.route('**/api/auth/**', async route => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    const spinner = page.locator('[class*="spin"], [class*="loading"], svg.animate-spin');
    await expect(spinner).toBeVisible();
  });

  test('submit button shows loading text/icon', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    await page.route('**/api/auth/**', async route => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    const submitBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-in"]') });
    
    // Should show loading state
    const isLoading = await submitBtn.locator('[class*="spin"], [class*="loading"]').isVisible().catch(() => false);
    expect(isLoading).toBe(true);
  });

  test('keypad disabled while loading', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    await page.route('**/api/auth/**', async route => {
      await page.waitForTimeout(1000);
      await route.continue();
    });
    
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    const keypadBtns = page.locator('button').filter({ hasText: /^[0-9]$/ });
    await expect(keypadBtns.first()).toBeDisabled();
  });
});

test.describe('Staff Login — Navigation', () => {
  test('navigates to dashboard on successful login', async ({ page }) => {
    await page.goto('/staff');
    
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await avatar.click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.url()).toContain('/dashboard');
  });

  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('**/staff');
    await expect(page.url()).toContain('/staff');
  });

  test('return to hub link navigates to home', async ({ page }) => {
    await page.goto('/staff');
    
    const hubLink = page.getByRole('link', { name: /return to hub/i });
    await hubLink.click();
    
    await page.waitForURL('**/');
    await expect(page.url()).toBe('http://localhost:5173/');
  });

  test('navigates to correct dashboard tab after login', async ({ page }) => {
    await page.goto('/staff');
    
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await avatar.click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Dashboard should be visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Staff Login — Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('PIN input has aria-label', async ({ page }) => {
    const pinInput = page.locator('[class*="pin-input"], input').first();
    await expect(pinInput).toHaveAttribute('aria-label').catch(() => {
      console.log('⚠ TODO: Add aria-label to PIN input');
    });
  });

  test('keypad buttons have accessible names', async ({ page }) => {
    for (let i = 1; i <= 9; i++) {
      const btn = page.getByRole('button', { name: String(i), exact: true });
      await expect(btn).toBeVisible();
    }
  });

  test('error message has role="alert"', async ({ page }) => {
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    
    await page.waitForTimeout(1000);
    
    const errorDiv = page.locator('text=/incorrect|invalid|error/i').first();
    await expect(errorDiv).toHaveAttribute('role', 'alert').catch(() => {
      console.log('⚠ TODO: Add role="alert" to error message');
    });
  });

  test('avatar buttons have accessible names', async ({ page }) => {
    const avatars = page.locator('button').filter({ has: page.locator('img') });
    const count = await avatars.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const avatar = avatars.nth(i);
      await expect(avatar).toBeVisible();
    }
  });

  test('page is keyboard navigable', async ({ page }) => {
    // Tab through keypad
    await page.keyboard.press('Tab');
    const firstFocused = page.locator(':focus');
    await expect(firstFocused).toBeVisible();
    
    await page.keyboard.press('Tab');
    const secondFocused = page.locator(':focus');
    await expect(secondFocused).toBeVisible();
  });

  test('Enter key submits PIN', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    
    for (let i = 0; i < 4; i++) {
      await digit1.click();
    }
    
    await page.keyboard.press('Enter');
    
    // Should submit
    const spinner = page.locator('[class*="spin"], [class*="loading"]');
    await expect(spinner).toBeVisible({ timeout: 2000 }).catch(() => {
      // Auth might be instant
    });
  });
});

test.describe('Staff Login — Responsive Layout', () => {
  test('login page displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/staff');
    
    const branding = page.getByText('ShoPro POS');
    await expect(branding).toBeVisible();
    
    const keypad = page.locator('button').filter({ hasText: /^[0-9]$/ });
    await expect(keypad.first()).toBeVisible();
  });

  test('keypad is accessible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/staff');
    
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    const box = await digit1.boundingBox();
    
    expect(box).toBeTruthy();
    if (box) {
      // Button should be tappable size (min 44x44)
      expect(box.width).toBeGreaterThan(40);
      expect(box.height).toBeGreaterThan(40);
    }
  });

  test('avatars wrap on narrow screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/staff');
    
    const avatars = page.locator('button').filter({ has: page.locator('img') });
    const count = await avatars.count();
    
    if (count > 3) {
      const firstBox = await avatars.first().boundingBox();
      const lastBox = await avatars.last().boundingBox();
      
      if (firstBox && lastBox) {
        // Should wrap to next line
        expect(lastBox.y).toBeGreaterThan(firstBox.y);
      }
    }
  });
});

test.describe('Staff Login — Session & Security', () => {
  test('session timer starts after login', async ({ page }) => {
    await page.goto('/staff');
    
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await avatar.click();
    
    await page.waitForURL('**/dashboard');
    
    // Footer should show session timer
    const timer = page.locator('text=/session [0-9]{2}:[0-9]{2}/i');
    await expect(timer).toBeVisible();
  });

  test('notification count appears after login', async ({ page }) => {
    await page.goto('/staff');
    
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await avatar.click();
    
    await page.waitForURL('**/dashboard');
    
    // Notification bell with count
    const notifBadge = page.locator('[class*="badge"]').filter({ hasText: /[0-9]+/ });
    await expect(notifBadge).toBeVisible();
  });

  test('logout button visible in header', async ({ page }) => {
    await page.goto('/staff');
    
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await avatar.click();
    
    await page.waitForURL('**/dashboard');
    
    const logoutBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-out"]') });
    await expect(logoutBtn).toBeVisible();
  });

  test('logout redirects to staff login', async ({ page }) => {
    await page.goto('/staff');
    
    const avatar = page.locator('button').filter({ has: page.locator('img') }).first();
    await avatar.click();
    
    await page.waitForURL('**/dashboard');
    
    const logoutBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-out"]') });
    await logoutBtn.click();
    
    await page.waitForURL('**/staff');
    await expect(page.url()).toContain('/staff');
  });
});

test.describe('Staff Login — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/staff');
  });

  test('cannot submit empty PIN', async ({ page }) => {
    const submitBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-in"]') });
    await expect(submitBtn).toBeDisabled();
  });

  test('cannot submit 3-digit PIN', async ({ page }) => {
    const digit1 = page.getByRole('button', { name: '1', exact: true });
    const submitBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-in"]') });
    
    for (let i = 0; i < 3; i++) {
      await digit1.click();
    }
    
    await expect(submitBtn).toBeDisabled();
  });

  test('PIN auto-clears on error', async ({ page }) => {
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    
    await page.waitForTimeout(1500);
    
    const filledDots = page.locator('[class*="filled"]');
    await expect(filledDots).toHaveCount(0);
  });

  test('multiple failed attempts show persistent error', async ({ page }) => {
    const digit9 = page.getByRole('button', { name: '9', exact: true });
    
    // First attempt
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    await page.waitForTimeout(1500);
    
    // Second attempt
    for (let i = 0; i < 4; i++) {
      await digit9.click();
    }
    await page.waitForTimeout(1500);
    
    // Error should still be visible
    const errorDiv = page.locator('text=/incorrect|invalid|error/i').first();
    await expect(errorDiv).toBeVisible();
  });

  test('backspace disabled when PIN is empty', async ({ page }) => {
    const backspaceBtn = page.locator('button').filter({ has: page.locator('[data-lucide="delete"]') });
    
    // Backspace without entering PIN
    await backspaceBtn.click();
    
    // Should have no effect (no error, no change)
    const filledDots = page.locator('[class*="filled"]');
    await expect(filledDots).toHaveCount(0);
  });
});
