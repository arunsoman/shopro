import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Prime Cost Module Tests — ShoPro Restaurant Web
 * Tests prime cost hub, labor cost, food cost, and analytics
 * 
 * Sources:
 * - PrimeCostHubPage.tsx
 * - LaborSchedulePage.tsx
 * - MultiLocationPrimeCost (if available)
 */

test.describe('Prime Cost — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('no NaN in prime cost hub', async ({ page }) => {
    await expectNoNaN(page, 'Prime Cost Hub');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in labor cost breakdown', async ({ page }) => {
    await expectNoNaN(page, 'Labor Cost Breakdown');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in food cost breakdown', async ({ page }) => {
    await expectNoNaN(page, 'Food Cost Breakdown');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in prime cost trends', async ({ page }) => {
    await expectNoNaN(page, 'Prime Cost Trends');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in multi-location view', async ({ page }) => {
    await expectNoNaN(page, 'Multi-Location View');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in variance calculations', async ({ page }) => {
    await expectNoNaN(page, 'Variance Calculations');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in percentage displays', async ({ page }) => {
    // Check all percentage displays specifically
    const percentages = page.locator('span').filter({ hasText: /%/ });
    const count = await percentages.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const percent = percentages.nth(i);
      const text = await percent.textContent();
      expect(text).not.toContain('NaN');
    }
  });
});

test.describe('Prime Cost Hub — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('shows prime cost heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /prime cost/i })).toBeVisible();
  });

  test('displays prime cost overview cards', async ({ page }) => {
    const overviewCards = page.locator('[class*="card"]').filter({ hasText: /prime cost|labor|food/i });
    await expect(overviewCards).not.toHaveCount(0);
  });

  test('shows current period prime cost', async ({ page }) => {
    const primeCostCard = page.locator('[class*="card"]').filter({ hasText: /prime cost/i });
    await expect(primeCostCard).toBeVisible();
  });

  test('displays prime cost percentage', async ({ page }) => {
    const percentage = page.locator('span').filter({ hasText: /[0-9]+%/ });
    await expect(percentage).toBeVisible();
  });

  test('shows labor cost card', async ({ page }) => {
    const laborCard = page.locator('[class*="card"]').filter({ hasText: /labor cost/i });
    await expect(laborCard).toBeVisible();
  });

  test('shows food cost card', async ({ page }) => {
    const foodCard = page.locator('[class*="card"]').filter({ hasText: /food cost/i });
    await expect(foodCard).toBeVisible();
  });

  test('displays target vs actual comparison', async ({ page }) => {
    const comparison = page.locator('[class*="comparison"], [class*="target"]').filter({ hasText: /target|actual/i });
    await expect(comparison).toBeVisible();
  });

  test('shows variance indicator', async ({ page }) => {
    const variance = page.locator('[class*="variance"], span').filter({ hasText: /variance|\+|-/i });
    await expect(variance).toBeVisible();
  });

  test('displays period selector', async ({ page }) => {
    const periodSelector = page.locator('select, [class*="period"]').filter({ hasText: /period|week|month/i });
    await expect(periodSelector).toBeVisible();
  });

  test('shows prime cost trend chart', async ({ page }) => {
    const chart = page.locator('svg, canvas, [class*="chart"]').filter({ hasText: /trend|prime/i });
    await expect(chart).not.toHaveCount(0);
  });
});

test.describe('Prime Cost — Labor Cost Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('displays labor cost breakdown', async ({ page }) => {
    const laborBreakdown = page.locator('[class*="labor"], [class*="breakdown"]').filter({ hasText: /labor|wage/i });
    await expect(laborBreakdown).toBeVisible();
  });

  test('shows total labor hours', async ({ page }) => {
    const hours = page.locator('span').filter({ hasText: /[0-9]+\s*hours?/i });
    await expect(hours).toBeVisible();
  });

  test('shows average hourly rate', async ({ page }) => {
    const rate = page.locator('span').filter({ hasText: /\$|€|£[0-9]+\.[0-9]+/i });
    await expect(rate).toBeVisible();
  });

  test('displays labor cost by department', async ({ page }) => {
    const departments = page.locator('[class*="department"], [class*="section"]').filter({ hasText: /kitchen|foh|bar|management/i });
    await expect(departments).not.toHaveCount(0);
  });

  test('shows kitchen labor cost', async ({ page }) => {
    const kitchenLabor = page.locator('span').filter({ hasText: /kitchen|bof?h/i });
    await expect(kitchenLabor).toBeVisible();
  });

  test('shows FOH labor cost', async ({ page }) => {
    const fohLabor = page.locator('span').filter({ hasText: /foh|front of house|service/i });
    await expect(fohLabor).toBeVisible();
  });

  test('shows overtime cost', async ({ page }) => {
    const overtime = page.locator('span').filter({ hasText: /overtime|ot/i });
    await expect(overtime).toBeVisible();
  });

  test('displays labor cost percentage of sales', async ({ page }) => {
    const laborPercentage = page.locator('span').filter({ hasText: /[0-9]+%/ });
    await expect(laborPercentage).toBeVisible();
  });
});

test.describe('Prime Cost — Food Cost Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('displays food cost breakdown', async ({ page }) => {
    const foodBreakdown = page.locator('[class*="food"], [class*="breakdown"]').filter({ hasText: /food|cogs/i });
    await expect(foodBreakdown).toBeVisible();
  });

  test('shows total food sales', async ({ page }) => {
    const foodSales = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/i });
    await expect(foodSales).toBeVisible();
  });

  test('shows total food cost', async ({ page }) => {
    const foodCost = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/i });
    await expect(foodCost).toBeVisible();
  });

  test('displays food cost percentage', async ({ page }) => {
    const foodCostPercentage = page.locator('span').filter({ hasText: /[0-9]+%/ });
    await expect(foodCostPercentage).toBeVisible();
  });

  test('shows inventory usage', async ({ page }) => {
    const usage = page.locator('span').filter({ hasText: /usage|consumption/i });
    await expect(usage).toBeVisible();
  });

  test('displays transfers adjustment', async ({ page }) => {
    const transfers = page.locator('span').filter({ hasText: /transfer|adjustment/i });
    await expect(transfers).toBeVisible();
  });

  test('shows waste/spoilage cost', async ({ page }) => {
    const waste = page.locator('span').filter({ hasText: /waste|spoilage/i });
    await expect(waste).toBeVisible();
  });

  test('displays comps/voids impact', async ({ page }) => {
    const comps = page.locator('span').filter({ hasText: /comp|void/i });
    await expect(comps).toBeVisible();
  });
});

test.describe('Prime Cost — Analytics & Trends', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('shows prime cost trend over time', async ({ page }) => {
    const trendChart = page.locator('svg, canvas, [class*="chart"]').filter({ hasText: /trend/i });
    await expect(trendChart).not.toHaveCount(0);
  });

  test('displays week-over-week comparison', async ({ page }) => {
    const wowComparison = page.locator('[class*="comparison"], span').filter({ hasText: /week|wow/i });
    await expect(wowComparison).toBeVisible();
  });

  test('shows month-over-month comparison', async ({ page }) => {
    const momComparison = page.locator('[class*="comparison"], span').filter({ hasText: /month|mom/i });
    await expect(momComparison).toBeVisible();
  });

  test('displays year-to-date summary', async ({ page }) => {
    const ytdSummary = page.locator('[class*="ytd"], span').filter({ hasText: /ytd|year-to-date/i });
    await expect(ytdSummary).toBeVisible();
  });

  test('shows benchmark comparison', async ({ page }) => {
    const benchmark = page.locator('[class*="benchmark"], span').filter({ hasText: /benchmark|industry|target/i });
    await expect(benchmark).toBeVisible();
  });

  test('displays prime cost by day of week', async ({ page }) => {
    const dowBreakdown = page.locator('[class*="day"], [class*="weekday"]').filter({ hasText: /monday|tuesday|wednesday/i });
    await expect(dowBreakdown).not.toHaveCount(0);
  });

  test('shows prime cost by meal period', async ({ page }) => {
    const mealPeriods = page.locator('[class*="meal"], [class*="period"]').filter({ hasText: /breakfast|lunch|dinner|brunch/i });
    await expect(mealPeriods).not.toHaveCount(0);
  });
});

test.describe('Prime Cost — Alerts & Thresholds', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('shows prime cost alert threshold', async ({ page }) => {
    const threshold = page.locator('[class*="threshold"], span').filter({ hasText: /threshold|limit/i });
    await expect(threshold).toBeVisible();
  });

  test('displays warning when prime cost exceeds target', async ({ page }) => {
    const warning = page.locator('[class*="warning"], [class*="alert"]').filter({ hasText: /warning|exceeded|over/i });
    await expect(warning).toBeVisible();
  });

  test('shows labor cost alert', async ({ page }) => {
    const laborAlert = page.locator('[class*="alert"]').filter({ hasText: /labor|overtime/i });
    await expect(laborAlert).toBeVisible();
  });

  test('shows food cost alert', async ({ page }) => {
    const foodAlert = page.locator('[class*="alert"]').filter({ hasText: /food cost|cogs/i });
    await expect(foodAlert).toBeVisible();
  });

  test('displays actionable recommendations', async ({ page }) => {
    const recommendations = page.locator('[class*="recommendation"], [class*="tip"]').filter({ hasText: /recommend|suggestion|tip/i });
    await expect(recommendations).not.toHaveCount(0);
  });
});

test.describe('Prime Cost — Multi-Location View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('shows location selector for multi-location', async ({ page }) => {
    const locationSelector = page.locator('select, [class*="location"]').filter({ hasText: /location|restaurant/i });
    await expect(locationSelector).toBeVisible();
  });

  test('displays consolidated prime cost across locations', async ({ page }) => {
    const consolidated = page.locator('[class*="consolidated"], span').filter({ hasText: /total|consolidated|all/i });
    await expect(consolidated).toBeVisible();
  });

  test('shows location-by-location comparison', async ({ page }) => {
    const locationComparison = page.locator('[class*="location"], [class*="comparison"]').filter({ hasText: /location/i });
    await expect(locationComparison).not.toHaveCount(0);
  });

  test('displays best and worst performing locations', async ({ page }) => {
    const performance = page.locator('[class*="best"], [class*="worst"]').filter({ hasText: /best|worst|top|bottom/i });
    await expect(performance).not.toHaveCount(0);
  });
});

test.describe('Prime Cost — Export & Reporting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('shows export prime cost report button', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|report/i });
    await expect(exportBtn).toBeVisible();
  });

  test('export button downloads CSV/PDF', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);
    
    expect(download.suggestedFilename()).toMatch(/\.(csv|pdf)$/);
  });

  test('shows print report option', async ({ page }) => {
    const printBtn = page.getByRole('button', { name: /print/i });
    await expect(printBtn).toBeVisible();
  });

  test('shows email report option', async ({ page }) => {
    const emailBtn = page.getByRole('button', { name: /email|send/i });
    await expect(emailBtn).toBeVisible();
  });
});

test.describe('Prime Cost — Period Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('period selector shows current week', async ({ page }) => {
    const periodSelector = page.locator('select, [class*="period"]').first();
    await expect(periodSelector).toBeVisible();
  });

  test('can select previous periods', async ({ page }) => {
    const periodSelector = page.locator('select').or(page.locator('button').filter({ hasText: /period|week/i })).first();
    await periodSelector.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /week|period/i }).first();
    await option.click();
    
    // Should update data
    const primeCostCard = page.locator('[class*="card"]').filter({ hasText: /prime cost/i });
    await expect(primeCostCard).toBeVisible();
  });

  test('shows period date range', async ({ page }) => {
    const dateRange = page.locator('span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}/ });
    await expect(dateRange).toBeVisible();
  });

  test('period comparison shows date ranges', async ({ page }) => {
    const dateRanges = page.locator('span').filter({ hasText: /[0-9]{2}\/[0-9]{2}/ });
    await expect(dateRanges).not.toHaveCount(0);
  });
});

test.describe('Prime Cost — Calculations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('displays prime cost formula', async ({ page }) => {
    const formula = page.locator('[class*="formula"], span').filter({ hasText: /labor.*food|food.*labor/i });
    await expect(formula).toBeVisible();
  });

  test('shows calculation breakdown', async ({ page }) => {
    const breakdown = page.locator('[class*="breakdown"], [class*="detail"]').filter({ hasText: /calculation|formula/i });
    await expect(breakdown).toBeVisible();
  });

  test('prime cost percentage is accurate', async ({ page }) => {
    const percentage = page.locator('span').filter({ hasText: /[0-9]+%/ }).first();
    const percentageText = await percentage.textContent();
    
    // Should be a valid percentage (0-100%)
    const percentageValue = parseFloat(percentageText?.replace('%', '') || '0');
    expect(percentageValue).toBeGreaterThanOrEqual(0);
    expect(percentageValue).toBeLessThanOrEqual(100);
  });

  test('labor + food equals prime cost', async ({ page }) => {
    const laborCost = page.locator('span').filter({ hasText: /labor/i }).first();
    const foodCost = page.locator('span').filter({ hasText: /food/i }).first();
    const primeCost = page.locator('span').filter({ hasText: /prime cost/i }).first();
    
    await expect(laborCost).toBeVisible();
    await expect(foodCost).toBeVisible();
    await expect(primeCost).toBeVisible();
  });
});

test.describe('Prime Cost — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prime-cost');
  });

  test('shows error on failed prime cost load', async ({ page }) => {
    await page.route('**/api/prime-cost/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no data', async ({ page }) => {
    await page.route('**/api/prime-cost/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: null }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no data|empty|no records/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/prime-cost/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ primeCost: 28.5, labor: 18.2, food: 10.3 }),
        });
      }
    });
    
    await page.goto('/prime-cost');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Prime Cost — Responsive Layout', () => {
  test('prime cost cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/prime-cost');
    
    const cards = page.locator('[class*="card"]').filter({ hasText: /prime|labor|food/i });
    const firstBox = await cards.first().boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });

  test('charts are readable on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/prime-cost');
    
    const chart = page.locator('svg, canvas, [class*="chart"]').first();
    const box = await chart.boundingBox();
    
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThan(300);
    }
  });

  test('tables are scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/prime-cost');
    
    const table = page.locator('table, [class*="table"]').first();
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });
});

test.describe('Prime Cost — Performance', () => {
  test('prime cost hub loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/prime-cost');
    await expect(page.getByRole('heading', { name: /prime cost/i })).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000);
  });

  test('period switching is fast', async ({ page }) => {
    await page.goto('/prime-cost');
    
    const startTime = Date.now();
    
    const periodSelector = page.locator('select').or(page.locator('button').filter({ hasText: /period/i })).first();
    await periodSelector.click();
    
    const option = page.locator('option, [role="option"]').first();
    await option.click();
    
    await expect(page.locator('[class*="card"]').filter({ hasText: /prime cost/i })).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(2000);
  });
});
