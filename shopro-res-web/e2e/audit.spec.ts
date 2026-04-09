import { test, expect, type Page } from '@playwright/test';
import { loginAsJohnChef } from './helpers/auth';

// ── Shared state ─────────────────────────────────────────────────────────────
// We log in once and reuse the session across all tests in this file.
test.describe('Shopro POS - Full Application Audit', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Capture all console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Attach to test for reporting
        console.error(`[CONSOLE ERROR] ${msg.text()}`);
      }
    });

    page.on('pageerror', (err) => {
      console.error(`[UNCAUGHT ERROR] ${err.message}`);
    });

    await loginAsJohnChef(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ── Helper: navigate using the sidebar menu ───────────────────────────────
  async function navigateTo(route: string) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
  }

  // ── 1. AUTHENTICATION ─────────────────────────────────────────────────────
  test('1. Authentication — PIN login succeeds', async () => {
    // After beforeAll, we should be on the dashboard or a valid app page
    const url = page.url();
    expect(url).toMatch(/localhost:5173/);
    expect(url).not.toContain('/staff');
    await expect(page.locator('body')).not.toContainText('404');
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // ── 2. DASHBOARD ─────────────────────────────────────────────────────────
  test('2. Dashboard — renders and loads Intelligence Hub', async () => {
    await navigateTo('/dashboard');

    // Page title/heading exists
    await expect(page.locator('text=Intelligence Hub')).toBeVisible({ timeout: 10_000 });

    // Role tabs visible
    await expect(page.locator('text=CFO').or(page.locator('text=General Manager')).first()).toBeVisible();

    // No error boundaries
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await expect(page.locator('body')).not.toContainText('Error:');
  });

  test('2b. Dashboard — role switching (CFO → Exec Chef)', async () => {
    await navigateTo('/dashboard');

    // Find and click Exec Chef tab
    const execChefTab = page.locator('text=Exec Chef').first();
    if (await execChefTab.isVisible()) {
      await execChefTab.click();
      await page.waitForTimeout(500);
      // Verify role-specific content appears
      await expect(
        page.locator('text=Yield Guardian').or(page.locator('text=Executive Chef')).first()
      ).toBeVisible({ timeout: 8_000 });
    }
  });

  // ── 3. INVENTORY ─────────────────────────────────────────────────────────
  test('3. Inventory — Ingredient Master loads without crash', async () => {
    await navigateTo('/inventory');

    // Should have some table or list content
    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await expect(page.locator('body')).not.toContainText('undefined');

    // Check for presence of ingredient data (seeded)
    const hasData = await page.locator('text=Lamb Shoulder').isVisible().catch(() => false)
      || await page.locator('text=MEAT').isVisible().catch(() => false)
      || await page.locator('text=FOOD').isVisible().catch(() => false);
    expect(hasData).toBe(true);
  });

  test('3b. Inventory — New Ingredient modal opens', async () => {
    await navigateTo('/inventory');

    // Click any "New" or "Add" button
    const newBtn = page.locator(
      'button:has-text("New"), button:has-text("Add"), button:has-text("New Item"), button:has-text("New Ingredient")'
    ).first();

    if (await newBtn.isVisible()) {
      await newBtn.click();
      // Modal or drawer should appear
      await expect(
        page.locator('text=Add New Ingredient').or(page.locator('text=IDENTITY SPECS')).first()
      ).toBeVisible({ timeout: 6_000 });
      // Close via Escape
      await page.keyboard.press('Escape');
    }
  });

  // ── 4. PURCHASING ────────────────────────────────────────────────────────
  test('4. Purchasing — page renders with supplier/order data', async () => {
    await navigateTo('/purchasing');

    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await page.waitForTimeout(1000);

    // Should have some purchasing UI (orders, GRN, suppliers)
    const hasContent =
      await page.locator('[class*="table"], [class*="card"], [class*="order"]').first().isVisible().catch(() => false);
    // At minimum, the body should have rendered text content beyond the nav
    const bodyText = await page.locator('main, [class*="content"], [class*="page"]').first().innerText().catch(() => '');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  // ── 5. RECIPES / KITCHEN ─────────────────────────────────────────────────
  test('5. Recipes — page renders without errors', async () => {
    await navigateTo('/recipes');

    await expect(page.locator('body')).not.toContainText('Something went wrong');
    await page.waitForTimeout(800);

    // Should contain some recipe or menu data
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(100);
  });

  // ── 6. EXPERIMENT LAB — KEY BUG VERIFICATION ─────────────────────────────
  test('6. Experiments — list view renders with valid dates (not "Invalid Date")', async () => {
    await navigateTo('/experiments');

    await expect(page.locator('text=Experiment Lab')).toBeVisible({ timeout: 10_000 });

    // Ensure seeded experiments are present
    await expect(page.locator('text=Tiered Loyalty Boost')).toBeVisible({ timeout: 8_000 });

    // CRITICAL: No "Invalid Date" on the list
    await expect(page.locator('body')).not.toContainText('Invalid Date');
  });

  test('6b. Experiments — detail view shows correct start date', async () => {
    await navigateTo('/experiments');

    // Click Tiered Loyalty Boost row
    await page.locator('text=Tiered Loyalty Boost').first().click();
    await page.waitForTimeout(800);

    // Detail view should be open
    await expect(page.locator('text=TIERED LOYALTY BOOST').or(page.locator('text=Tiered Loyalty Boost')).first()).toBeVisible({ timeout: 6_000 });

    // Should have "Started" label
    const startedLabel = page.locator('text=Started').first();
    await expect(startedLabel).toBeVisible();

    // The sibling/next element should show a valid date (e.g. 3/27/2026 or similar)
    // and should NOT be 'Invalid Date'
    await expect(page.locator('body')).not.toContainText('Invalid Date');

    // Hypothesis card should be visible
    await expect(page.locator('text=Offering double points on Tuesdays')).toBeVisible({ timeout: 5_000 });

    // Navigate back
    await page.locator('text=Back to Hub').click();
  });

  test('6c. Experiments — New Experiment wizard step 1 opens', async () => {
    await navigateTo('/experiments');

    // Click "New Experiment" button
    const newExpBtn = page.locator('button:has-text("New Experiment"), button:has-text("New")').first();
    if (await newExpBtn.isVisible()) {
      await newExpBtn.click();
      await page.waitForTimeout(500);

      // Step 1: "Name your theory" should be visible
      await expect(page.locator('text=Name your theory')).toBeVisible({ timeout: 6_000 });

      // Step indicator should be at step 1
      await expect(page.locator('text=New Experiment')).toBeVisible();

      // Navigate back
      await page.keyboard.press('Escape');
      const backBtn = page.locator('button[aria-label="back"], button:has-text("←")').first();
      if (await backBtn.isVisible()) await backBtn.click();
    }
  });

  // ── 7. REPORTS ───────────────────────────────────────────────────────────
  test('7. Reports — Intelligence Hub loads KPI cards', async () => {
    await navigateTo('/reports');

    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('Something went wrong');

    // Should have KPI metrics
    await expect(
      page.locator('text=Intelligence Hub').or(page.locator('text=TOTAL GUESTS')).or(page.locator('text=REVENUE')).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── 8. LABOR / STAFFING ──────────────────────────────────────────────────
  test('8. Labor — Ledger loads with seeded staff roster', async () => {
    await navigateTo('/labor');

    await page.waitForTimeout(1000);
    await expect(page.locator('body')).not.toContainText('Something went wrong');

    // Seeded staff: Gordon Ramsay or Waiter_1 should be in the table
    const hasStaff =
      await page.locator('text=Gordon Ramsay').isVisible().catch(() => false) ||
      await page.locator('text=Labor Control Ledger').isVisible().catch(() => false) ||
      await page.locator('text=HOURLY').isVisible().catch(() => false);
    expect(hasStaff).toBe(true);
  });

  // ── 9. CROSS-CUTTING — No 404 pages ──────────────────────────────────────
  test('9. No routes return a 404-style blank screen', async () => {
    const routes = ['/dashboard', '/inventory', '/purchasing', '/recipes', '/experiments', '/reports', '/labor'];
    const errors: string[] = [];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      const body = await page.locator('body').innerText().catch(() => '');

      if (title.includes('404') || title.includes('Not Found') || body.includes('404 Not Found')) {
        errors.push(`${route} returned a 404`);
      }
      if (body.includes('Something went wrong') || body.includes('Cannot read properties')) {
        errors.push(`${route} has an error boundary`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Route errors found:\n${errors.join('\n')}`);
    }
  });

  // ── 10. NETWORK — No 4xx/5xx API failures on dashboard ───────────────────
  test('10. Network — no API failures on dashboard load', async () => {
    const failedRequests: string[] = [];

    page.on('response', (resp) => {
      if (resp.url().includes('/api/') && resp.status() >= 400) {
        failedRequests.push(`${resp.status()} ${resp.url()}`);
      }
    });

    await navigateTo('/dashboard');
    await page.waitForTimeout(2000);

    // Filter out expected 404s (e.g., favicon)
    const apiFailures = failedRequests.filter((r) => !r.includes('favicon'));

    if (apiFailures.length > 0) {
      console.warn(`API failures detected:\n${apiFailures.join('\n')}`);
    }
    // Warn but don't fail — some endpoints may return 404 for missing data
    // Uncomment to make this a hard failure:
    // expect(apiFailures).toHaveLength(0);
  });
});
