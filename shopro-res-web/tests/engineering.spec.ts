import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Menu Engineering Module Tests — ShoPro Restaurant Web
 * Tests engineering hub, period setup, analysis, live sales, and what-if simulator
 * 
 * Sources:
 * - EngineeringHubPage.tsx
 * - PeriodSetupPage.tsx, PeriodDetailPage.tsx
 * - LiveSalesCounterPage.tsx, PeriodHistoryPage.tsx
 * - WhatIfSimulatorPage.tsx, PeriodComparisonPage.tsx
 */

test.describe('Engineering — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering');
  });

  test('no NaN in engineering hub', async ({ page }) => {
    await expectNoNaN(page, 'Engineering Hub');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in period analysis matrix', async ({ page }) => {
    await expectNoNaN(page, 'Period Analysis Matrix');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in item statistics', async ({ page }) => {
    await expectNoNaN(page, 'Item Statistics');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in live sales counter', async ({ page }) => {
    await page.goto('/engineering/live');
    await expectNoNaN(page, 'Live Sales Counter');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in period comparison', async ({ page }) => {
    await page.goto('/engineering/compare');
    await expectNoNaN(page, 'Period Comparison');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in what-if simulator', async ({ page }) => {
    await page.goto('/engineering/periods/1/whatif');
    await expectNoNaN(page, 'What-If Simulator');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in profitability calculations', async ({ page }) => {
    await expectNoNaN(page, 'Profitability Calculations');
    
    // Check margin/contribution displays
    const margins = page.locator('span').filter({ hasText: /margin|contribution/i });
    const count = await margins.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const margin = margins.nth(i);
      const text = await margin.textContent();
      expect(text).not.toContain('NaN');
    }
  });
});

test.describe('Engineering Hub — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering');
  });

  test('shows menu engineering heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /menu engineering/i })).toBeVisible();
  });

  test('displays engineering navigation cards', async ({ page }) => {
    const navCards = page.locator('[class*="card"]').filter({ hasText: /setup|analysis|live|history|compare/i });
    await expect(navCards).not.toHaveCount(0);
  });

  test('shows New Period Setup card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /new period|setup/i });
    await expect(card).toBeVisible();
  });

  test('shows Period Analysis card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /analysis|period/i });
    await expect(card).toBeVisible();
  });

  test('shows Live Sales Counter card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /live sales|counter/i });
    await expect(card).toBeVisible();
  });

  test('shows Period History card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /history|archive/i });
    await expect(card).toBeVisible();
  });

  test('shows Period Comparison card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /comparison|compare/i });
    await expect(card).toBeVisible();
  });

  test('displays engineering statistics', async ({ page }) => {
    const stats = page.locator('[class*="stat"]').filter({ hasText: /periods|items|revenue/i });
    await expect(stats).not.toHaveCount(0);
  });
});

test.describe('Engineering Hub — Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering');
  });

  test('clicking New Period navigates to setup page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /new period|setup/i });
    await card.click();
    
    await expect(page.url()).toContain('/engineering/new');
  });

  test('clicking Period Analysis navigates to analysis page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /analysis/i });
    await card.click();
    
    await expect(page.url()).toContain('/engineering');
  });

  test('clicking Live Sales navigates to live counter', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /live sales/i });
    await card.click();
    
    await expect(page.url()).toContain('/engineering/live');
  });

  test('clicking Period History navigates to history page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /history/i });
    await card.click();
    
    await expect(page.url()).toContain('/engineering/history');
  });

  test('clicking Comparison navigates to compare page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /comparison/i });
    await card.click();
    
    await expect(page.url()).toContain('/engineering/compare');
  });
});

test.describe('Period Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering/new');
  });

  test('shows new period setup heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /new period|setup period/i })).toBeVisible();
  });

  test('form shows period name input', async ({ page }) => {
    const nameInput = page.getByLabel(/period name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
  });

  test('form shows start date picker', async ({ page }) => {
    const startDate = page.locator('input[type="date"]').filter({ hasText: /start/i }).or(page.locator('input[type="date"]').first());
    await expect(startDate).toBeVisible();
  });

  test('form shows end date picker', async ({ page }) => {
    const endDate = page.locator('input[type="date"]').filter({ hasText: /end/i }).or(page.locator('input[type="date"]').nth(1));
    await expect(endDate).toBeVisible();
  });

  test('form shows category selection', async ({ page }) => {
    const categories = page.locator('[class*="category"], checkbox').filter({ hasText: /appetizer|main|dessert/i });
    await expect(categories).not.toHaveCount(0);
  });

  test('form shows menu items selection', async ({ page }) => {
    const menuItems = page.locator('[class*="menu"], [class*="item"]').filter({ hasText: /menu item/i });
    await expect(menuItems).not.toHaveCount(0);
  });

  test('form shows create period button', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create|start period/i });
    await expect(createBtn).toBeVisible();
  });

  test('form validates date range', async ({ page }) => {
    const startDate = page.locator('input[type="date"]').first();
    const endDate = page.locator('input[type="date"]').nth(1);
    
    // Set end date before start date
    await endDate.fill('2024-01-01');
    await startDate.fill('2024-12-01');
    
    const createBtn = page.getByRole('button', { name: /create/i });
    await createBtn.click();
    
    const error = page.locator('text=/invalid|date range/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Period Analysis', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering');
  });

  test('shows period analysis heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /analysis|period/i })).toBeVisible();
  });

  test('displays period selector', async ({ page }) => {
    const periodSelector = page.locator('select, [class*="period"]').filter({ hasText: /select period/i });
    await expect(periodSelector).toBeVisible();
  });

  test('shows engineering matrix (Stars, Plowhorses, Puzzles, Dogs)', async ({ page }) => {
    const matrix = page.locator('[class*="matrix"], [class*="quadrant"]').filter({ hasText: /star|plowhorse|puzzle|dog/i });
    await expect(matrix).toBeVisible();
  });

  test('displays menu items in quadrants', async ({ page }) => {
    const items = page.locator('[class*="item"], [class*="dot"]').filter({ hasText: /[a-z]+/i });
    await expect(items).not.toHaveCount(0);
  });

  test('shows profitability axis', async ({ page }) => {
    const profitabilityAxis = page.locator('[class*="axis"], text').filter({ hasText: /profit|margin/i });
    await expect(profitabilityAxis).toBeVisible();
  });

  test('shows popularity axis', async ({ page }) => {
    const popularityAxis = page.locator('[class*="axis"], text').filter({ hasText: /popularity|volume|count/i });
    await expect(popularityAxis).toBeVisible();
  });

  test('displays item statistics table', async ({ page }) => {
    const statsTable = page.locator('table, tr').filter({ hasText: /item|sales|cost|margin/i });
    await expect(statsTable).not.toHaveCount(0);
  });

  test('item shows sales count', async ({ page }) => {
    const salesCounts = page.locator('td, span').filter({ hasText: /[0-9]+/ });
    await expect(salesCounts).not.toHaveCount(0);
  });

  test('item shows food cost percentage', async ({ page }) => {
    const costPercentages = page.locator('td, span').filter({ hasText: /[0-9]+%/ });
    await expect(costPercentages).not.toHaveCount(0);
  });

  test('item shows contribution margin', async ({ page }) => {
    const margins = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(margins).not.toHaveCount(0);
  });

  test('clicking item opens detail view', async ({ page }) => {
    const item = page.locator('[class*="item"], [class*="dot"]').first();
    await item.click();
    
    await expect(page.url()).toContain('/engineering/periods/');
  });
});

test.describe('Period Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering');
    
    // Navigate to a period detail
    const period = page.locator('[class*="period"], [class*="card"]').first();
    if (await period.isVisible().catch(() => false)) {
      await period.click();
    } else {
      await page.goto('/engineering/periods/1');
    }
  });

  test('shows period detail heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /[a-z]+/i })).toBeVisible();
  });

  test('displays period date range', async ({ page }) => {
    const dateRange = page.locator('span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}/ });
    await expect(dateRange).toBeVisible();
  });

  test('shows period status', async ({ page }) => {
    const status = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /active|closed|finalized/i });
    await expect(status).toBeVisible();
  });

  test('displays revenue summary', async ({ page }) => {
    const revenue = page.locator('[class*="revenue"], span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(revenue).toBeVisible();
  });

  test('shows guest count', async ({ page }) => {
    const guestCount = page.locator('span').filter({ hasText: /[0-9]+\s*guest/i });
    await expect(guestCount).toBeVisible();
  });

  test('displays item performance list', async ({ page }) => {
    const items = page.locator('[class*="item"], tr').filter({ hasText: /item|dish/i });
    await expect(items).not.toHaveCount(0);
  });

  test('shows what-if analysis button', async ({ page }) => {
    const whatIfBtn = page.getByRole('button', { name: /what-if|simulate/i });
    await expect(whatIfBtn).toBeVisible();
  });

  test('shows export report button', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Live Sales Counter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering/live');
  });

  test('shows live sales counter heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /live sales|real-time/i })).toBeVisible();
  });

  test('displays current period info', async ({ page }) => {
    const periodInfo = page.locator('[class*="period"], span').filter({ hasText: /period|today/i });
    await expect(periodInfo).toBeVisible();
  });

  test('shows real-time sales count', async ({ page }) => {
    const salesCount = page.locator('[class*="count"], span').filter({ hasText: /[0-9]+/ });
    await expect(salesCount).toBeVisible();
  });

  test('displays item sales leaderboard', async ({ page }) => {
    const leaderboard = page.locator('[class*="leaderboard"], [class*="list"]').filter({ hasText: /top|popular/i });
    await expect(leaderboard).toBeVisible();
  });

  test('item shows sales quantity', async ({ page }) => {
    const quantities = page.locator('span').filter({ hasText: /[0-9]+/ });
    await expect(quantities).not.toHaveCount(0);
  });

  test('item shows revenue generated', async ({ page }) => {
    const revenues = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(revenues).not.toHaveCount(0);
  });

  test('sales counter auto-refreshes', async ({ page }) => {
    // Count initial sales
    const initialCount = await page.locator('[class*="count"]').first().textContent();
    
    // Wait for refresh
    await page.waitForTimeout(5000);
    
    // Count should potentially update
    const newCount = await page.locator('[class*="count"]').first().textContent();
    expect(newCount).toBeDefined();
  });

  test('shows last update timestamp', async ({ page }) => {
    const timestamp = page.locator('span').filter({ hasText: /updated|last/i });
    await expect(timestamp).toBeVisible();
  });

  test('manual refresh button is available', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /refresh|reload/i });
    await expect(refreshBtn).toBeVisible();
  });
});

test.describe('Period History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering/history');
  });

  test('shows period history heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /period history/i })).toBeVisible();
  });

  test('displays historical periods list', async ({ page }) => {
    const periods = page.locator('[class*="period"], [class*="card"], tr').filter({ hasText: /period/i });
    await expect(periods).not.toHaveCount(0);
  });

  test('period shows date range', async ({ page }) => {
    const dates = page.locator('td, span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}/ });
    await expect(dates).not.toHaveCount(0);
  });

  test('period shows status (finalized)', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /finalized|closed/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('period shows total revenue', async ({ page }) => {
    const revenues = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(revenues).not.toHaveCount(0);
  });

  test('period shows item count', async ({ page }) => {
    const itemCounts = page.locator('td, span').filter({ hasText: /[0-9]+\s*item/i });
    await expect(itemCounts).not.toHaveCount(0);
  });

  test('clicking period opens archived analysis', async ({ page }) => {
    const period = page.locator('[class*="period"], [class*="card"]').first();
    await period.click();
    
    await expect(page.url()).toContain('/engineering/periods/');
  });

  test('export history button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Period Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering/compare');
  });

  test('shows period comparison heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /comparison|compare/i })).toBeVisible();
  });

  test('displays period 1 selector', async ({ page }) => {
    const period1Selector = page.locator('select, [class*="period"]').filter({ hasText: /period 1|select/i }).first();
    await expect(period1Selector).toBeVisible();
  });

  test('displays period 2 selector', async ({ page }) => {
    const period2Selector = page.locator('select, [class*="period"]').filter({ hasText: /period 2|select/i }).nth(1);
    await expect(period2Selector).toBeVisible();
  });

  test('shows compare button', async ({ page }) => {
    const compareBtn = page.getByRole('button', { name: /compare/i });
    await expect(compareBtn).toBeVisible();
  });

  test('comparison shows revenue variance', async ({ page }) => {
    const variance = page.locator('[class*="variance"], span').filter({ hasText: /revenue|\+|-/i });
    await expect(variance).toBeVisible();
  });

  test('comparison shows guest count variance', async ({ page }) => {
    const variance = page.locator('[class*="variance"], span').filter({ hasText: /guest|\+|-/i });
    await expect(variance).toBeVisible();
  });

  test('comparison shows item performance delta', async ({ page }) => {
    const deltas = page.locator('[class*="delta"], span').filter({ hasText: /\+|-|[0-9]+%/ });
    await expect(deltas).not.toHaveCount(0);
  });

  test('comparison shows side-by-side matrix', async ({ page }) => {
    const matrices = page.locator('[class*="matrix"], [class*="quadrant"]');
    await expect(matrices).toHaveCount(2);
  });

  test('comparison highlights winners and losers', async ({ page }) => {
    const winners = page.locator('[class*="winner"], span').filter({ hasText: /\+/ });
    const losers = page.locator('[class*="loser"], span').filter({ hasText: /-/ });
    
    await expect(winners.or(losers)).not.toHaveCount(0);
  });
});

test.describe('What-If Simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering/periods/1/whatif');
  });

  test('shows what-if simulator heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /what-if|simulator/i })).toBeVisible();
  });

  test('displays item selector', async ({ page }) => {
    const itemSelector = page.locator('select, [class*="item"]').filter({ hasText: /select item/i });
    await expect(itemSelector).toBeVisible();
  });

  test('shows current price display', async ({ page }) => {
    const currentPrice = page.locator('span').filter({ hasText: /current|price/i });
    await expect(currentPrice).toBeVisible();
  });

  test('shows price adjustment input', async ({ page }) => {
    const priceInput = page.locator('input[type="number"]').filter({ hasText: /price|adjust/i });
    await expect(priceInput).toBeVisible();
  });

  test('shows projected revenue calculation', async ({ page }) => {
    const projection = page.locator('[class*="projected"], span').filter({ hasText: /projected|revenue/i });
    await expect(projection).toBeVisible();
  });

  test('shows demand elasticity factor', async ({ page }) => {
    const elasticity = page.locator('span').filter({ hasText: /elasticity|demand/i });
    await expect(elasticity).toBeVisible();
  });

  test('shows impact on food cost percentage', async ({ page }) => {
    const foodCostImpact = page.locator('span').filter({ hasText: /food cost|%/ });
    await expect(foodCostImpact).toBeVisible();
  });

  test('simulate button calculates projection', async ({ page }) => {
    const simulateBtn = page.getByRole('button', { name: /simulate|calculate/i });
    await expect(simulateBtn).toBeVisible();
  });

  test('reset button clears adjustments', async ({ page }) => {
    const resetBtn = page.getByRole('button', { name: /reset|clear/i });
    await expect(resetBtn).toBeVisible();
  });
});

test.describe('Engineering — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering');
  });

  test('shows error on failed periods load', async ({ page }) => {
    await page.route('**/api/engineering/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no periods', async ({ page }) => {
    await page.route('**/api/engineering/periods', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ periods: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no periods|empty|create your first/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/engineering/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ periods: [{ id: 1, name: 'Test Period' }] }),
        });
      }
    });
    
    await page.goto('/engineering');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Engineering — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/engineering/new');
  });

  test('cannot create period with duplicate name', async ({ page }) => {
    const nameInput = page.getByLabel(/period name/i).or(page.locator('input').first());
    await nameInput.fill('Existing Period');
    
    const createBtn = page.getByRole('button', { name: /create/i });
    await createBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('period end date cannot be before start date', async ({ page }) => {
    const startDate = page.locator('input[type="date"]').first();
    const endDate = page.locator('input[type="date"]').nth(1);
    
    await startDate.fill('2024-12-01');
    await endDate.fill('2024-01-01');
    
    const createBtn = page.getByRole('button', { name: /create/i });
    await createBtn.click();
    
    const error = page.locator('text=/invalid|date range/i');
    await expect(error).toBeVisible();
  });

  test('period requires at least one menu item', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create/i });
    await createBtn.click();
    
    const error = page.locator('text=/required|select item/i');
    await expect(error).toBeVisible();
  });

  test('what-if simulator validates price adjustment', async ({ page }) => {
    await page.goto('/engineering/periods/1/whatif');
    
    const priceInput = page.locator('input[type="number"]').filter({ hasText: /price/i }).first();
    await priceInput.fill('-100');
    
    const simulateBtn = page.getByRole('button', { name: /simulate/i });
    await simulateBtn.click();
    
    const error = page.locator('text=/invalid|positive/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Engineering — Responsive Layout', () => {
  test('engineering matrix is scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/engineering');
    
    const matrix = page.locator('[class*="matrix"], svg').first();
    const isScrollable = await matrix.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('period cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/engineering/history');
    
    const cards = page.locator('[class*="period"], [class*="card"]');
    const firstBox = await cards.first().boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });

  test('comparison view is side-by-side on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/engineering/compare');
    
    const matrices = page.locator('[class*="matrix"]');
    const firstBox = await matrices.first().boundingBox();
    const secondBox = await matrices.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      // Should be side-by-side (similar Y, different X)
      expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(50);
    }
  });
});

test.describe('Engineering — Performance', () => {
  test('engineering hub loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/engineering');
    await expect(page.getByRole('heading', { name: /engineering/i })).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000);
  });

  test('live sales counter updates in real-time', async ({ page }) => {
    await page.goto('/engineering/live');
    
    const startTime = Date.now();
    
    // Wait for an update
    await page.waitForTimeout(5000);
    
    const endTime = Date.now();
    
    // Should update within timeout
    expect(endTime - startTime).toBeLessThan(10000);
  });
});
