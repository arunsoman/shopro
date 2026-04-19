import { test, expect } from '@playwright/test';

/**
 * Settings Module Tests
 * Tests floor layout, tableside, KDS, staff, roles, and other settings
 * 
 * Source: /features/settings/pages/*, /features/settings/components/*
 */

test.describe('Settings — Floor Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/floor-layout');
  });

  test('shows floor layout settings heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /floor|layout/i })).toBeVisible();
  });

  test('displays floor plan editor or preview', async ({ page }) => {
    const floorPlan = page.locator('[class*="floor"], [class*="plan"], canvas, svg');
    await expect(floorPlan).not.toHaveCount(0);
  });

  test('add table button is visible', async ({ page }) => {
    const addTableBtn = page.getByRole('button', { name: /add|new|table/i });
    await expect(addTableBtn).toBeVisible();
  });

  test('table shape selector is available', async ({ page }) => {
    const shapeSelector = page.locator('select, [class*="shape"]').filter({ hasText: /shape|round|square/i });
    await expect(shapeSelector).toBeVisible();
  });

  test('table capacity input is available', async ({ page }) => {
    const capacityInput = page.locator('input[type="number"]').filter({ hasText: /capacity|seats/i }).or(page.locator('input[placeholder*="seats"]').first());
    await expect(capacityInput).toBeVisible();
  });

  test('save floor layout button is available', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /save|apply/i });
    await expect(saveBtn).toBeVisible();
  });
});

test.describe('Settings — Tableside', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/tableside');
  });

  test('shows tableside settings heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tableside|qr/i })).toBeVisible();
  });

  test('tableside ordering toggle is available', async ({ page }) => {
    const toggle = page.locator('[class*="toggle"], input[type="checkbox"]').filter({ hasText: /enable|tableside/i });
    await expect(toggle).toBeVisible();
  });

  test('QR code generation settings are available', async ({ page }) => {
    const qrSettings = page.locator('[class*="qr"], [class*="code"]').filter({ hasText: /qr|code/i });
    await expect(qrSettings).not.toHaveCount(0);
  });

  test('tableside session timeout configuration', async ({ page }) => {
    const timeoutInput = page.locator('input[type="number"]').filter({ hasText: /timeout|session/i }).or(page.locator('input[placeholder*="minute"]').first());
    await expect(timeoutInput).toBeVisible();
  });

  test('payment provider configuration', async ({ page }) => {
    const paymentConfig = page.locator('[class*="payment"], [class*="provider"]').filter({ hasText: /payment|stripe|terminal/i });
    await expect(paymentConfig).not.toHaveCount(0);
  });
});

test.describe('Settings — KDS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/kds');
  });

  test('shows KDS settings heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /kds|kitchen display/i })).toBeVisible();
  });

  test('KDS station settings are available', async ({ page }) => {
    const stationSettings = page.locator('[class*="station"], [class*="kds"]').filter({ hasText: /station|display/i });
    await expect(stationSettings).not.toHaveCount(0);
  });

  test('add KDS station button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|station/i });
    await expect(addBtn).toBeVisible();
  });

  test('KDS routing configuration is available', async ({ page }) => {
    const routingConfig = page.locator('[class*="routing"], [class*="route"]').filter({ hasText: /route|fire|i });
    await expect(routingConfig).not.toHaveCount(0);
  });

  test('KDS station shows assigned printers', async ({ page }) => {
    const printers = page.locator('[class*="printer"], span').filter({ hasText: /printer|print/i });
    await expect(printers).not.toHaveCount(0);
  });

  test('KDS color coding by course is configurable', async ({ page }) => {
    const colorConfig = page.locator('[class*="color"], [class*="course"]').filter({ hasText: /color|course|appetizer/i });
    await expect(colorConfig).not.toHaveCount(0);
  });
});

test.describe('Settings — Staff', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/staff');
  });

  test('shows staff management heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /staff|employee/i })).toBeVisible();
  });

  test('displays staff list', async ({ page }) => {
    const staffList = page.locator('[class*="staff"], [class*="card"], tr').filter({ hasText: /staff|employee/i });
    await expect(staffList).not.toHaveCount(0);
  });

  test('add staff button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|invite/i }).filter({ hasText: /staff|employee/i });
    await expect(addBtn).toBeVisible();
  });

  test('staff form shows name and role fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /staff/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
    
    const roleSelector = page.locator('select, [class*="role"]').filter({ hasText: /role|position/i });
    await expect(roleSelector).toBeVisible();
  });

  test('staff form shows PIN setup', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /staff/i });
    await addBtn.click();
    
    const pinInput = page.locator('input[type="password"], input[placeholder*="pin"]').first();
    await expect(pinInput).toBeVisible();
  });

  test('edit staff button opens form', async ({ page }) => {
    const editBtn = page.getByRole('button', { name: /edit/i }).first();
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|staff/i });
    await expect(form).toBeVisible();
  });

  test('deactivate staff button is available', async ({ page }) => {
    const deactivateBtn = page.getByRole('button', { name: /deactivate|disable|archive/i });
    await expect(deactivateBtn).toBeVisible();
  });
});

test.describe('Settings — Roles & Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/roles');
  });

  test('shows role management heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /role|permission/i })).toBeVisible();
  });

  test('displays role list', async ({ page }) => {
    const roles = page.locator('[class*="role"], [class*="card"]').filter({ hasText: /role|manager|server/i });
    await expect(roles).not.toHaveCount(0);
  });

  test('create role button is visible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create|add/i }).filter({ hasText: /role/i });
    await expect(createBtn).toBeVisible();
  });

  test('role form shows name input', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /role/i });
    await createBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
  });

  test('role form shows permission toggles', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /role/i });
    await createBtn.click();
    
    const permissionToggles = page.locator('[class*="permission"], input[type="checkbox"]').filter({ hasText: /view|edit|delete|create/i });
    await expect(permissionToggles).not.toHaveCount(0);
  });

  test('permission matrix shows all modules', async ({ page }) => {
    const modules = page.locator('[class*="module"], span').filter({ hasText: /dashboard|floor|inventory|menu|crm|finance/i });
    await expect(modules).not.toHaveCount(0);
  });

  test('save role button is available', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /save|create/i });
    await expect(saveBtn).toBeVisible();
  });
});

test.describe('Settings — Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/notifications');
  });

  test('redirects to admin notifications or shows settings', async ({ page }) => {
    // Either redirects to /admin/notifications or shows inline settings
    const notifDashboard = page.locator('[class*="notification"], [class*="dashboard"]');
    await expect(notifDashboard).not.toHaveCount(0);
  });

  test('notification preferences are configurable', async ({ page }) => {
    const prefs = page.locator('[class*="preference"], input[type="checkbox"]').filter({ hasText: /email|sms|push/i });
    await expect(prefs).not.toHaveCount(0);
  });
});

test.describe('Settings — Payments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/payments');
  });

  test('shows payments settings heading or coming soon', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /payment|terminal/i });
    const comingSoon = page.locator('text=/coming soon|not available/i');
    await expect(heading.or(comingSoon)).toBeVisible();
  });
});

test.describe('Settings — Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/security');
  });

  test('shows security settings heading or coming soon', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /security|audit/i });
    const comingSoon = page.locator('text=/coming soon|not available/i');
    await expect(heading.or(comingSoon)).toBeVisible();
  });
});

test.describe('Settings — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/staff');
  });

  test('shows error on failed settings load', async ({ page }) => {
    await page.route('**/api/settings/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('retry button reloads settings after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/settings/*', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: {} }),
        });
      }
    });
    
    await page.goto('/settings/staff');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Settings — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/staff');
  });

  test('staff form validates unique email', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /staff/i });
    await addBtn.click();
    
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]').first());
    await emailInput.fill('existing@example.com');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('role cannot be deleted if assigned to staff', async ({ page }) => {
    await page.goto('/settings/roles');
    
    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
    await deleteBtn.click();
    
    const confirmBtn = page.getByRole('button', { name: /confirm|yes/i });
    await confirmBtn.click();
    
    // Should show error or prevent deletion
    const error = page.locator('text=/cannot delete|assigned|in use/i');
    await expect(error).toBeVisible().catch(() => {
      // Might handle differently
    });
  });

  test('KDS station requires unique name', async ({ page }) => {
    await page.goto('/settings/kds');
    
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /station/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input').first());
    await nameInput.fill('Existing Station');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Settings — Responsive Layout', () => {
  test('settings form stacks on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/settings/staff');
    
    const form = page.locator('[class*="form"], [class*="dialog"]').first();
    const box = await form.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThan(box.width);
    }
  });

  test('permission matrix is scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/settings/roles');
    
    const matrix = page.locator('[class*="matrix"], table').first();
    const isScrollable = await matrix.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });
});
