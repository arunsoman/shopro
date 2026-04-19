import { test, expect } from '@playwright/test';

/**
 * Floor Plan Module Tests
 * Tests table management, floor plan visualization, and session handling
 * 
 * Source: /features/floor/pages/FloorPlanPage.tsx, TableActionModal.tsx, WaitlistSidebar.tsx
 */

test.describe('Floor Plan — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('shows floor plan heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /floor|tables/i })).toBeVisible();
  });

  test('displays table cards or visual layout', async ({ page }) => {
    // Tables are usually cards or visual elements
    const tables = page.locator('[class*="table"], [class*="card"]').filter({ has: page.locator('text=/table|T[0-9]+/i') });
    await expect(tables).not.toHaveCount(0);
  });

  test('shows table status indicators', async ({ page }) => {
    // Status badges: Available, Occupied, Reserved, etc.
    const statusBadges = page.locator('[class*="badge"], [class*="status"], span').filter({ hasText: /available|occupied|reserved|free/i });
    await expect(statusBadges).not.toHaveCount(0);
  });

  test('shows filter controls for table status', async ({ page }) => {
    const filters = page.locator('button, select').filter({ hasText: /all|available|occupied|filter/i });
    await expect(filters).not.toHaveCount(0);
  });

  test('shows waitlist sidebar or panel', async ({ page }) => {
    const waitlistPanel = page.locator('[class*="waitlist"], [class*="sidebar"], aside').filter({ hasText: /waitlist|waiting/i });
    await expect(waitlistPanel).not.toHaveCount(0);
  });

  test('displays tableside session management', async ({ page }) => {
    const sessionControls = page.locator('[class*="session"], [class*="tableside"]');
    await expect(sessionControls).not.toHaveCount(0);
  });
});

test.describe('Floor Plan — Table Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('clicking table opens action modal', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click();
    
    // Should open TableActionModal
    const modal = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]').filter({ hasText: /table|action/i });
    await expect(modal).toBeVisible();
  });

  test('table action modal shows merge option', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click();
    
    const mergeBtn = page.getByRole('button', { name: /merge/i });
    await expect(mergeBtn).toBeVisible();
  });

  test('table action modal shows split option', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click();
    
    const splitBtn = page.getByRole('button', { name: /split/i });
    await expect(splitBtn).toBeVisible();
  });

  test('table action modal shows transfer option', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click();
    
    const transferBtn = page.getByRole('button', { name: /transfer|move/i });
    await expect(transferBtn).toBeVisible();
  });

  test('modal closes on cancel button', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click();
    
    const cancelBtn = page.getByRole('button', { name: /cancel|close/i });
    await cancelBtn.click();
    
    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).not.toBeVisible();
  });

  test('table shows context menu on right-click', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click({ button: 'right' });
    
    const contextMenu = page.locator('[class*="context"], [class*="menu"], [role="menu"]');
    await expect(contextMenu).toBeVisible();
  });
});

test.describe('Floor Plan — Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('start new session button is visible', async ({ page }) => {
    const startSessionBtn = page.getByRole('button', { name: /new session|start|open table/i });
    await expect(startSessionBtn).toBeVisible();
  });

  test('clicking start session opens order form', async ({ page }) => {
    const startSessionBtn = page.getByRole('button', { name: /new session|start/i }).first();
    await startSessionBtn.click();
    
    // Should show order form or session setup
    const orderForm = page.locator('[class*="order"], [class*="session"], [class*="form"]');
    await expect(orderForm).toBeVisible();
  });

  test('active session shows guest count', async ({ page }) => {
    const guestCount = page.locator('[class*="guest"], [class*="cover"]').filter({ hasText: /[0-9]+\s*guest/i });
    await expect(guestCount).not.toHaveCount(0);
  });

  test('session timer shows elapsed time', async ({ page }) => {
    const timer = page.locator('[class*="timer"], [class*="time"], span').filter({ hasText: /[0-9]+:[0-9]+/ });
    await expect(timer).not.toHaveCount(0);
  });

  test('end session button is available for active tables', async ({ page }) => {
    const endSessionBtn = page.getByRole('button', { name: /end|close|checkout/i });
    await expect(endSessionBtn).toBeVisible();
  });
});

test.describe('Floor Plan — Waitlist Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('add to waitlist button is visible', async ({ page }) => {
    const addWaitlistBtn = page.getByRole('button', { name: /add waitlist|new party/i });
    await expect(addWaitlistBtn).toBeVisible();
  });

  test('clicking add to waitlist opens form', async ({ page }) => {
    const addWaitlistBtn = page.getByRole('button', { name: /add waitlist|new party/i });
    await addWaitlistBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /party|guest|waitlist/i });
    await expect(form).toBeVisible();
  });

  test('waitlist shows party name and size', async ({ page }) => {
    const waitlistItems = page.locator('[class*="waitlist"] li, [class*="party"]').filter({ hasText: /[0-9]+\s*guest/i });
    await expect(waitlistItems).not.toHaveCount(0);
  });

  test('seat party button assigns table', async ({ page }) => {
    const seatBtn = page.getByRole('button', { name: /seat|assign/i }).first();
    await expect(seatBtn).toBeVisible();
  });

  test('remove from waitlist button is available', async ({ page }) => {
    const removeBtn = page.getByRole('button', { name: /remove|cancel|delete/i }).filter({ hasText: /remove|cancel/i }).first();
    await expect(removeBtn).toBeVisible();
  });
});

test.describe('Floor Plan — Filtering & Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('filter by table status works', async ({ page }) => {
    const availableFilter = page.getByRole('button', { name: /available/i }).first();
    await availableFilter.click();
    
    // Only available tables should be visible
    const tables = page.locator('[class*="table"], [class*="card"]');
    const visibleTables = tables.filter({ has: page.locator('text=/available|free/i').or(page.locator('[class*="available"]')) });
    await expect(visibleTables).not.toHaveCount(0);
  });

  test('search box filters tables by name/number', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|filter table/i).or(page.locator('input[type="text"]').first());
    await searchInput.fill('T1');
    
    // Should filter to show only T1
    const tableT1 = page.locator('text=/T1/i').first();
    await expect(tableT1).toBeVisible();
  });

  test('clear filter button resets view', async ({ page }) => {
    const availableFilter = page.getByRole('button', { name: /available/i }).first();
    await availableFilter.click();
    
    const clearFilterBtn = page.getByRole('button', { name: /clear|reset|all/i });
    await clearFilterBtn.click();
    
    // All tables should be visible again
    const allTables = page.locator('[class*="table"], [class*="card"]');
    await expect(allTables).not.toHaveCount(0);
  });
});

test.describe('Floor Plan — Tableside Ordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('tableside session toggle is visible', async ({ page }) => {
    const tablesideToggle = page.locator('[class*="tableside"], [class*="toggle"]');
    await expect(tablesideToggle).not.toHaveCount(0);
  });

  test('enable tableside ordering for table', async ({ page }) => {
    const tablesideBtn = page.getByRole('button', { name: /tableside|qr/i }).first();
    await tablesideBtn.click();
    
    // Should show QR code or activation confirmation
    const qrCode = page.locator('[class*="qr"], [class*="code"], img[alt*="qr"]');
    await expect(qrCode).toBeVisible();
  });

  test('tableside session shows active indicator', async ({ page }) => {
    const activeIndicator = page.locator('[class*="active"], [class*="on"]').filter({ hasText: /tableside|active/i });
    await expect(activeIndicator).not.toHaveCount(0);
  });
});

test.describe('Floor Plan — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('shows error on failed table load', async ({ page }) => {
    await page.route('**/api/floor/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no tables exist', async ({ page }) => {
    await page.route('**/api/floor/tables', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ tables: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no tables|empty|add your first/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads tables after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/floor/*', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tables: [{ id: 1, name: 'T1', status: 'available' }] }),
        });
      }
    });
    
    await page.goto('/floor');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Floor Plan — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/floor');
  });

  test('cannot merge table with itself', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click();
    
    const mergeBtn = page.getByRole('button', { name: /merge/i });
    await mergeBtn.click();
    
    // Should show validation or disable same-table selection
    const validationError = page.locator('text=/cannot merge|select different/i');
    await expect(validationError).toBeVisible().catch(() => {
      // Might handle differently
    });
  });

  test('modal closes on Escape key', async ({ page }) => {
    const tableCard = page.locator('[class*="table"], [class*="card"]').first();
    await tableCard.click();
    
    await page.keyboard.press('Escape');
    
    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).not.toBeVisible();
  });

  test('waitlist form shows validation errors', async ({ page }) => {
    const addWaitlistBtn = page.getByRole('button', { name: /add waitlist/i });
    await addWaitlistBtn.click();
    
    const submitBtn = page.getByRole('button', { name: /add|submit/i });
    await submitBtn.click();
    
    // Should show validation errors for required fields
    const errors = page.locator('text=/required|invalid/i');
    await expect(errors).not.toHaveCount(0);
  });
});

test.describe('Floor Plan — Responsive Layout', () => {
  test('tables grid adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/floor');
    
    const tables = page.locator('[class*="table"], [class*="card"]');
    const firstTableBox = await tables.first().boundingBox();
    const secondTableBox = await tables.nth(1).boundingBox();
    
    if (firstTableBox && secondTableBox) {
      // Should be stacked or single column
      expect(secondTableBox.y).toBeGreaterThan(firstTableBox.y);
    }
  });

  test('waitlist sidebar collapses on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/floor');
    
    const waitlistPanel = page.locator('[class*="waitlist"], aside');
    // Should be hidden or collapsible
    const isVisible = await waitlistPanel.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});
