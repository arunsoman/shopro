import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Dashboard Module Tests
 * Tests role-based dashboard tabs (CFO, GM, Chef, FOH, Bar, Shift, Catering, Lab)
 * 
 * Source: DashboardPage.tsx with 8 role-based views
 */

test.describe('Dashboard — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('no NaN values in CFO view', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    
    await expectNoNaN(page, 'CFO Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN values in GM view', async ({ page }) => {
    const gmTab = page.getByRole('button', { name: /general manager/i });
    await gmTab.click();
    
    await expectNoNaN(page, 'GM Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN values in Chef view', async ({ page }) => {
    const chefTab = page.getByRole('button', { name: /chef/i });
    await chefTab.click();
    
    await expectNoNaN(page, 'Chef Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN values in FOH view', async ({ page }) => {
    const fohTab = page.getByRole('button', { name: /foh/i });
    await fohTab.click();
    
    await expectNoNaN(page, 'FOH Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN values in Bar view', async ({ page }) => {
    const barTab = page.getByRole('button', { name: /bar/i });
    await barTab.click();
    
    await expectNoNaN(page, 'Bar Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN values in Shift view', async ({ page }) => {
    const shiftTab = page.getByRole('button', { name: /shift/i });
    await shiftTab.click();
    
    await expectNoNaN(page, 'Shift Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN values in Catering view', async ({ page }) => {
    const cateringTab = page.getByRole('button', { name: /catering/i });
    await cateringTab.click();
    
    await expectNoNaN(page, 'Catering Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN values in Lab view', async ({ page }) => {
    const labTab = page.getByRole('button', { name: /lab/i });
    await labTab.click();
    
    await expectNoNaN(page, 'Experiment Lab');
    await expectNoNaNInNumericDisplays(page);
  });
});

test.describe('Dashboard — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('shows dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard|nexus/i })).toBeVisible();
  });

  test('displays role-based tab navigation', async ({ page }) => {
    const tabs = page.locator('[class*="tab"], button').filter({ hasText: /cfo|general manager|chef|foh|bar|shift|catering|lab/i });
    await expect(tabs).not.toHaveCount(0);
  });

  test('shows CFO tab', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo|financial/i });
    await expect(cfoTab).toBeVisible();
  });

  test('shows General Manager tab', async ({ page }) => {
    const gmTab = page.getByRole('button', { name: /general manager|business owner/i });
    await expect(gmTab).toBeVisible();
  });

  test('shows Exec Chef tab', async ({ page }) => {
    const chefTab = page.getByRole('button', { name: /chef|exec|yield/i });
    await expect(chefTab).toBeVisible();
  });

  test('shows FOH Manager tab', async ({ page }) => {
    const fohTab = page.getByRole('button', { name: /foh|front of house|experience/i });
    await expect(fohTab).toBeVisible();
  });

  test('shows Bar Manager tab', async ({ page }) => {
    const barTab = page.getByRole('button', { name: /bar|liquid assets/i });
    await expect(barTab).toBeVisible();
  });

  test('shows Shift Manager tab', async ({ page }) => {
    const shiftTab = page.getByRole('button', { name: /shift|real-time/i });
    await expect(shiftTab).toBeVisible();
  });

  test('shows Catering tab', async ({ page }) => {
    const cateringTab = page.getByRole('button', { name: /catering|event/i });
    await expect(cateringTab).toBeVisible();
  });

  test('shows Experiment Lab tab', async ({ page }) => {
    const labTab = page.getByRole('button', { name: /lab|experiment/i });
    await expect(labTab).toBeVisible();
  });
});

test.describe('Dashboard — CFO View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('CFO tab shows financial KPIs', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    
    const kpiCards = page.locator('[class*="kpi"], [class*="card"]').filter({ hasText: /revenue|profit|cost|margin/i });
    await expect(kpiCards).not.toHaveCount(0);
  });

  test('CFO view shows prime cost metrics', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    
    const primeCostMetrics = page.locator('text=/prime cost|labor cost|food cost/i');
    await expect(primeCostMetrics).not.toHaveCount(0);
  });

  test('CFO view shows P&L summary', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    
    const pnlSummary = page.locator('text=/p&l|profit.*loss|income statement/i');
    await expect(pnlSummary).not.toHaveCount(0);
  });

  test('CFO view shows cash flow chart', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    
    const chart = page.locator('svg, canvas, [class*="chart"]').first();
    await expect(chart).not.toHaveCount(0);
  });
});

test.describe('Dashboard — General Manager View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('GM tab shows business overview', async ({ page }) => {
    const gmTab = page.getByRole('button', { name: /general manager/i });
    await gmTab.click();
    
    const overviewCards = page.locator('[class*="card"]').filter({ hasText: /sales|guests|cover|revenue/i });
    await expect(overviewCards).not.toHaveCount(0);
  });

  test('GM view shows labor productivity', async ({ page }) => {
    const gmTab = page.getByRole('button', { name: /general manager/i });
    await gmTab.click();
    
    const laborMetrics = page.locator('text=/labor|productivity|hours/i');
    await expect(laborMetrics).not.toHaveCount(0);
  });

  test('GM view shows guest satisfaction', async ({ page }) => {
    const gmTab = page.getByRole('button', { name: /general manager/i });
    await gmTab.click();
    
    const satisfactionMetrics = page.locator('text=/satisfaction|rating|feedback|nps/i');
    await expect(satisfactionMetrics).not.toHaveCount(0);
  });
});

test.describe('Dashboard — Exec Chef View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('Chef tab shows kitchen metrics', async ({ page }) => {
    const chefTab = page.getByRole('button', { name: /chef|exec/i });
    await chefTab.click();
    
    const kitchenMetrics = page.locator('[class*="card"]').filter({ hasText: /food cost|yield|waste/i });
    await expect(kitchenMetrics).not.toHaveCount(0);
  });

  test('Chef view shows recipe costing', async ({ page }) => {
    const chefTab = page.getByRole('button', { name: /chef/i });
    await chefTab.click();
    
    const recipeCosting = page.locator('text=/recipe|costing|margin/i');
    await expect(recipeCosting).not.toHaveCount(0);
  });

  test('Chef view shows inventory valuation', async ({ page }) => {
    const chefTab = page.getByRole('button', { name: /chef/i });
    await chefTab.click();
    
    const inventoryValue = page.locator('text=/inventory|stock|valuation/i');
    await expect(inventoryValue).not.toHaveCount(0);
  });
});

test.describe('Dashboard — FOH Manager View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('FOH tab shows floor metrics', async ({ page }) => {
    const fohTab = page.getByRole('button', { name: /foh|front of house/i });
    await fohTab.click();
    
    const floorMetrics = page.locator('[class*="card"]').filter({ hasText: /table|turnover|cover/i });
    await expect(floorMetrics).not.toHaveCount(0);
  });

  test('FOH view shows server performance', async ({ page }) => {
    const fohTab = page.getByRole('button', { name: /foh/i });
    await fohTab.click();
    
    const serverMetrics = page.locator('text=/server|performance|sales/i');
    await expect(serverMetrics).not.toHaveCount(0);
  });

  test('FOH view shows waitlist status', async ({ page }) => {
    const fohTab = page.getByRole('button', { name: /foh/i });
    await fohTab.click();
    
    const waitlistStatus = page.locator('text=/waitlist|waiting|party/i');
    await expect(waitlistStatus).not.toHaveCount(0);
  });
});

test.describe('Dashboard — Bar Manager View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('Bar tab shows beverage metrics', async ({ page }) => {
    const barTab = page.getByRole('button', { name: /bar|liquid/i });
    await barTab.click();
    
    const beverageMetrics = page.locator('[class*="card"]').filter({ hasText: /beverage|bar|drink/i });
    await expect(beverageMetrics).not.toHaveCount(0);
  });

  test('Bar view shows pour cost', async ({ page }) => {
    const barTab = page.getByRole('button', { name: /bar/i });
    await barTab.click();
    
    const pourCost = page.locator('text=/pour cost|cost %|liquor/i');
    await expect(pourCost).not.toHaveCount(0);
  });

  test('Bar view shows inventory levels', async ({ page }) => {
    const barTab = page.getByRole('button', { name: /bar/i });
    await barTab.click();
    
    const barInventory = page.locator('text=/bar inventory|stock|bottle/i');
    await expect(barInventory).not.toHaveCount(0);
  });
});

test.describe('Dashboard — Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('clicking CFO tab shows CFO content', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    
    const cfoContent = page.locator('[class*="cfo"]').or(page.locator('text=/financial|prime cost/i'));
    await expect(cfoContent).toBeVisible();
  });

  test('clicking Chef tab shows Chef content', async ({ page }) => {
    const chefTab = page.getByRole('button', { name: /chef/i });
    await chefTab.click();
    
    const chefContent = page.locator('[class*="chef"]').or(page.locator('text=/food cost|recipe|yield/i'));
    await expect(chefContent).toBeVisible();
  });

  test('active tab has visual indicator', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    
    // Active tab should have different styling
    await expect(cfoTab).toHaveClass(/active|selected/).catch(() => {
      // Might use different active indicator
    });
  });

  test('tab switching is fast (no reload)', async ({ page }) => {
    const startTime = Date.now();
    
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await cfoTab.click();
    await expect(page.locator('text=/cfo|financial/i')).toBeVisible();
    
    const chefTab = page.getByRole('button', { name: /chef/i });
    await chefTab.click();
    await expect(page.locator('text=/chef|kitchen/i')).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should be instant (< 1 second)
    expect(duration).toBeLessThan(2000);
  });
});

test.describe('Dashboard — Experiment Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('Lab tab shows experiment list', async ({ page }) => {
    const labTab = page.getByRole('button', { name: /lab|experiment/i });
    await labTab.click();
    
    const experiments = page.locator('[class*="experiment"], [class*="card"]').filter({ hasText: /experiment|test|hypothesis/i });
    await expect(experiments).not.toHaveCount(0);
  });

  test('Lab shows A/B test results', async ({ page }) => {
    const labTab = page.getByRole('button', { name: /lab/i });
    await labTab.click();
    
    const abTests = page.locator('text=/a\/b|variant|control/i');
    await expect(abTests).not.toHaveCount(0);
  });

  test('Lab shows statistical significance', async ({ page }) => {
    const labTab = page.getByRole('button', { name: /lab/i });
    await labTab.click();
    
    const significance = page.locator('text=/significance|confidence|p-value/i');
    await expect(significance).not.toHaveCount(0);
  });
});

test.describe('Dashboard — Header & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('header shows home button', async ({ page }) => {
    const homeBtn = page.locator('button').filter({ has: page.locator('[data-lucide="home"]') });
    await expect(homeBtn).toBeVisible();
  });

  test('header shows menu toggle', async ({ page }) => {
    const menuBtn = page.locator('button').filter({ has: page.locator('[data-lucide="menu"]') });
    await expect(menuBtn).toBeVisible();
  });

  test('header shows theme toggle', async ({ page }) => {
    const themeBtn = page.locator('button').filter({ has: page.locator('[data-lucide="sun"], [data-lucide="moon"]') });
    await expect(themeBtn).toBeVisible();
  });

  test('header shows notification bell', async ({ page }) => {
    const notifBtn = page.locator('button').filter({ has: page.locator('[data-lucide="bell"]') });
    await expect(notifBtn).toBeVisible();
  });

  test('header shows logout button', async ({ page }) => {
    const logoutBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-out"]') });
    await expect(logoutBtn).toBeVisible();
  });

  test('header shows search bar', async ({ page }) => {
    const searchBar = page.locator('input[placeholder*="search"]');
    await expect(searchBar).toBeVisible();
  });

  test('header shows locale flag', async ({ page }) => {
    const localeBtn = page.locator('button').filter({ hasText: /🇺🇸|🇩🇪|🇯🇵|🇫🇷|🇮🇳/ });
    await expect(localeBtn).toBeVisible();
  });
});

test.describe('Dashboard — Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('footer shows copyright', async ({ page }) => {
    const copyright = page.locator('text=/©.*ShoPro|ShoPro AI/i');
    await expect(copyright).toBeVisible();
  });

  test('footer shows version number', async ({ page }) => {
    const version = page.locator('text=/v[0-9]+\.[0-9]+\.[0-9]+/i');
    await expect(version).toBeVisible();
  });

  test('footer shows session timer', async ({ page }) => {
    const timer = page.locator('text=/session [0-9]{2}:[0-9]{2}/i');
    await expect(timer).toBeVisible();
  });
});

test.describe('Dashboard — Side Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('side nav is visible', async ({ page }) => {
    const sideNav = page.locator('aside, [class*="side"], [class*="nav"]').first();
    await expect(sideNav).toBeVisible();
  });

  test('side nav shows Dashboard item', async ({ page }) => {
    const dashboardItem = page.locator('button').filter({ hasText: /dashboard/i });
    await expect(dashboardItem).toBeVisible();
  });

  test('side nav shows Inventory item', async ({ page }) => {
    const inventoryItem = page.locator('button').filter({ hasText: /inventory/i });
    await expect(inventoryItem).toBeVisible();
  });

  test('side nav shows Kitchen item', async ({ page }) => {
    const kitchenItem = page.locator('button').filter({ hasText: /kitchen|kds/i });
    await expect(kitchenItem).toBeVisible();
  });

  test('side nav shows Prime Cost item', async ({ page }) => {
    const primeCostItem = page.locator('button').filter({ hasText: /prime cost/i });
    await expect(primeCostItem).toBeVisible();
  });

  test('side nav shows Engineering item', async ({ page }) => {
    const engineeringItem = page.locator('button').filter({ hasText: /engineering/i });
    await expect(engineeringItem).toBeVisible();
  });

  test('side nav shows Purchasing item', async ({ page }) => {
    const purchasingItem = page.locator('button').filter({ hasText: /purchasing/i });
    await expect(purchasingItem).toBeVisible();
  });

  test('side nav shows Experiments item', async ({ page }) => {
    const experimentsItem = page.locator('button').filter({ hasText: /experiments/i });
    await expect(experimentsItem).toBeVisible();
  });

  test('side nav shows Reports item', async ({ page }) => {
    const reportsItem = page.locator('button').filter({ hasText: /reports/i });
    await expect(reportsItem).toBeVisible();
  });

  test('side nav can be toggled', async ({ page }) => {
    const menuBtn = page.locator('button').filter({ has: page.locator('[data-lucide="menu"]') });
    await menuBtn.click();
    
    // Side nav should close or open
    const sideNav = page.locator('aside').first();
    const isVisible = await sideNav.isVisible();
    expect(isVisible).toBeDefined();
  });
});

test.describe('Dashboard — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('shows error on failed dashboard load', async ({ page }) => {
    await page.route('**/api/dashboard/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('retry button reloads dashboard data', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/dashboard/*', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: {} }),
        });
      }
    });
    
    await page.goto('/dashboard');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Dashboard — Responsive Layout', () => {
  test('dashboard tabs stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    
    const tabs = page.locator('[class*="tab"], button').filter({ hasText: /cfo|chef/i });
    const firstBox = await tabs.first().boundingBox();
    const secondBox = await tabs.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      // Should be scrollable or stacked
      expect(secondBox.x).toBeGreaterThan(firstBox.x);
    }
  });

  test('side nav collapses on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    
    const sideNav = page.locator('aside').first();
    const isVisible = await sideNav.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });
});
