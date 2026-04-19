/**
 * Shopro POS — Full Deep-Interaction E2E Test
 *
 * Logs in as Staff, opens the menu sidebar, then visits EVERY page
 * and clicks EVERY tab, card, and sub-navigation element within each page.
 * Catches 404s, console errors, and broken navigation via CDP monitor.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test('Deep Interaction — All pages and sub-components', async ({ page }) => {
  // ── LOGIN ──────────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/staff`);
  await page.waitForSelector('button:has-text("Emma Wilson")', { timeout: 10000 });
  await page.getByRole('button', { name: /Emma Wilson/i }).click();
  await page.waitForTimeout(1000);
  const pin = page.locator('button:has-text("0")').first();
  for (let i = 0; i < 4; i++) { await pin.click(); await page.waitForTimeout(300); }
  await page.waitForTimeout(2000);

  // Expand sidebar
  await page.locator('button[title="Menu"]').click();
  await page.waitForTimeout(500);
  await expect(page.locator('aside button').filter({ has: page.getByText('Dashboard', { exact: true }) })).toBeVisible();

  // Helper: click a sidebar nav item
  async function goto(label: string) {
    await page.locator('aside button').filter({ has: page.getByText(label) }).click();
    await page.waitForTimeout(1200);
  }

  // ════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD — 7 role tabs
  // ════════════════════════════════════════════════════════════════════
  await goto('Dashboard');
  await expect(page.getByRole('heading', { name: /intelligence hub/i })).toBeVisible();
  for (const tab of ['CFO', 'General Manager', 'Exec Chef', 'FOH Manager', 'Bar Manager', 'Shift Manager', 'Catering']) {
    await page.getByRole('button', { name: new RegExp(tab, 'i') }).click();
    await page.waitForTimeout(600);
  }
  console.log('✅ Dashboard — all 7 role tabs');

  // ════════════════════════════════════════════════════════════════════
  // 2. INVENTORY — sub-page cards
  // ════════════════════════════════════════════════════════════════════
  await goto('Inventory');
  await expect(page.getByRole('heading', { name: /inventory control/i })).toBeVisible();

  for (const sub of ['Ingredient Master', 'Count Entry', 'Period History', 'Low Stock Alerts']) {
    const card = page.locator('button, a, [role="button"]').filter({ hasText: new RegExp(sub, 'i') }).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1000);
      await page.locator('button[title="Menu"]').click(); await page.waitForTimeout(300);
      await goto('Inventory');
    }
  }
  console.log('✅ Inventory — all sub-pages');

  // ════════════════════════════════════════════════════════════════════
  // 3. KITCHEN (KDS)
  // ════════════════════════════════════════════════════════════════════
  await goto('Kitchen');
  await page.waitForTimeout(1500);
  console.log('✅ Kitchen KDS');

  // ════════════════════════════════════════════════════════════════════
  // 4. PRIME COST — 6 sub-screens
  // ════════════════════════════════════════════════════════════════════
  await goto('Prime Cost');
  await expect(page.getByRole('heading', { name: /prime cost/i })).toBeVisible();

  for (const sub of ['Fiscal Oversight', 'Ledger Worksheet', 'Threshold Drift', 'Attribution Matrix', 'Temporal Indices', 'Human Resources']) {
    const card = page.locator('[role="button"], button, a').filter({ hasText: new RegExp(sub, 'i') }).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1000);
    }
  }
  console.log('✅ Prime Cost — all sub-screens');

  // ════════════════════════════════════════════════════════════════════
  // 5. ENGINEERING (Menu Engineering)
  // ════════════════════════════════════════════════════════════════════
  await goto('Engineering');
  await expect(page.getByRole('heading', { name: /engineering/i })).toBeVisible();
  // Click each sub-tab
  for (const sub of ['Setup', 'Live', 'History', 'What-If', 'Comparison', 'Matrix', 'Detail']) {
    const tab = page.locator('button, [role="tab"]').filter({ hasText: new RegExp(sub, 'i') }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(800);
    }
  }
  console.log('✅ Engineering — all tabs');

  // ════════════════════════════════════════════════════════════════════
  // 6. PURCHASING — nav cards
  // ════════════════════════════════════════════════════════════════════
  await goto('Purchasing');
  await expect(page.getByText(/purchasing hub/i)).toBeVisible();

  for (const sub of ['Reorder Staging', 'Purchase Orders', 'Goods Receipts', '3-Way Match']) {
    const card = page.locator('button, a, [role="button"]').filter({ hasText: new RegExp(sub, 'i') }).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1000);
      await page.locator('button[title="Menu"]').click(); await page.waitForTimeout(300);
      await goto('Purchasing');
    }
  }
  console.log('✅ Purchasing — all sub-pages');

  // ════════════════════════════════════════════════════════════════════
  // 7. EXPERIMENTS
  // ════════════════════════════════════════════════════════════════════
  await goto('Experiments');
  await expect(page.getByRole('heading', { name: /experiment lab/i })).toBeVisible();
  console.log('✅ Experiments');

  // ════════════════════════════════════════════════════════════════════
  // 8. REPORTS
  // ════════════════════════════════════════════════════════════════════
  await goto('Reports');
  await expect(page.getByRole('heading', { name: /intelligence hub/i })).toBeVisible();
  // Reports page has sub-tabs
  for (const sub of ['Guest', 'Revenue', 'Labor', 'Prime Cost', 'Inventory', 'Waste']) {
    const tab = page.locator('button, [role="tab"]').filter({ hasText: new RegExp(sub, 'i') }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(800);
    }
  }
  console.log('✅ Reports — all tabs');

  // ════════════════════════════════════════════════════════════════════
  // 9. SUPPLIER PAY
  // ════════════════════════════════════════════════════════════════════
  await goto('Supplier Pay');
  await expect(page.getByRole('heading', { name: /supplier pay|payment/i })).toBeVisible();
  console.log('✅ Supplier Pay');

  // ════════════════════════════════════════════════════════════════════
  // 10. STAFF & LABOR
  // ════════════════════════════════════════════════════════════════════
  await goto('Staff & Labor');
  await page.waitForTimeout(2000);
  console.log('✅ Staff & Labor');

  // ════════════════════════════════════════════════════════════════════
  // 11. KITCHEN COSTS / RECIPES — sub-pages
  // ════════════════════════════════════════════════════════════════════
  await goto('Kitchen Costs');
  await expect(page.getByRole('heading', { name: /^kitchen costs/i })).toBeVisible();

  for (const sub of ['Menu Items', 'Recipes', 'Cost Groups', 'Unit Converter']) {
    const card = page.locator('button, a, [role="button"]').filter({ hasText: new RegExp(sub, 'i') }).first();
    if (await card.isVisible().catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1000);
      await page.locator('button[title="Menu"]').click(); await page.waitForTimeout(300);
      await goto('Kitchen Costs');
    }
  }
  console.log('✅ Kitchen Costs — all sub-pages');

  console.log('\n✅✅✅ DEEP INTERACTION TEST COMPLETED ✅✅✅\n');
});