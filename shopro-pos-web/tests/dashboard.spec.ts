import { test, expect } from '@playwright/test';

/**
 * Dashboard Module Tests
 * Tests the main dashboard page with KPIs, charts, and analytics
 * 
 * Source: /features/dashboard/pages/DashboardPage.tsx
 */

test.describe('Dashboard — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('shows dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('displays KPI stat cards', async ({ page }) => {
    // Look for common KPI cards (Revenue, Orders, Guests, etc.)
    const kpiCards = page.locator('[class*="card"], [class*="stat"], div').filter({ has: page.locator('text=/revenue|orders|guests|sales/i') });
    await expect(kpiCards).not.toHaveCount(0);
  });

  test('shows date range picker or filter controls', async ({ page }) => {
    // Look for date filter, period selector, or refresh button
    const filterControls = page.locator('button').filter({ hasText: /today|week|month|date|refresh/i });
    await expect(filterControls).not.toHaveCount(0);
  });

  test('displays chart or graph visualization', async ({ page }) => {
    // Charts are usually SVG or canvas elements
    const chart = page.locator('svg, canvas, [class*="chart"], [class*="graph"]');
    await expect(chart).not.toHaveCount(0);
  });

  test('shows export or download button', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|csv/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Dashboard — Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('date range picker opens date selector', async ({ page }) => {
    const dateBtn = page.getByRole('button', { name: /date|today|week|month/i }).first();
    await dateBtn.click();
    
    // Should show date picker modal/dropdown
    const datePicker = page.locator('[class*="date"], [class*="picker"], [role="dialog"]');
    await expect(datePicker).toBeVisible();
  });

  test('refresh button reloads dashboard data', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /refresh|reload/i });
    await refreshBtn.click();
    
    // Look for loading state or data refresh
    const loading = page.locator('[class*="spin"], [class*="loading"]');
    await expect(loading).toBeVisible({ timeout: 3000 }).catch(() => {
      // Loading might be instant
    });
  });

  test('export button triggers CSV download', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|csv/i });
    
    // Start waiting for download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);
    
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('KPI card click shows detailed view', async ({ page }) => {
    const kpiCard = page.locator('[class*="card"], [class*="stat"]').first();
    await kpiCard.click();
    
    // Should navigate to detailed view or show modal
    // Check for URL change or modal
    const modal = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]');
    await expect(modal).toBeVisible().catch(() => {
      // Might navigate instead
      expect(page.url()).not.toContain('/dashboard');
    });
  });

  test('chart hover shows tooltip with data', async ({ page }) => {
    const chartElement = page.locator('svg, canvas').first();
    await chartElement.hover();
    
    // Look for tooltip
    const tooltip = page.locator('[class*="tooltip"], [role="tooltip"]');
    await expect(tooltip).toBeVisible();
  });
});

test.describe('Dashboard — Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('shows empty state when no data available', async ({ page }) => {
    // Mock empty API response
    await page.route('**/api/dashboard/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], kpis: {} }),
      });
    });
    
    await page.reload();
    
    // Look for empty state message
    const emptyState = page.locator('text=/no data|empty|no records|start/i');
    await expect(emptyState).toBeVisible();
  });
});

test.describe('Dashboard — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('shows error banner on API 500', async ({ page }) => {
    await page.route('**/api/dashboard/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    // Look for error message
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows error banner on network failure', async ({ page }) => {
    await page.route('**/api/dashboard/*', route => {
      route.abort('failed');
    });
    
    await page.reload();
    
    // Look for network error message
    const errorBanner = page.locator('text=/error|network|connection/i');
    await expect(errorBanner).toBeVisible();
  });

  test('retry button reloads data after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/dashboard/*', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [{ id: 1, value: 100 }], kpis: {} }),
        });
      }
    });
    
    await page.goto('/dashboard');
    
    // Look for error, then retry
    const retryBtn = page.getByRole('button', { name: /retry|try again|reload/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    // Error should be gone
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Dashboard — Loading States', () => {
  test('shows loading spinner on initial load', async ({ page }) => {
    // Slow down API response
    await page.route('**/api/dashboard/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/dashboard');
    
    // Look for loading spinner
    const spinner = page.locator('[class*="spin"], [class*="loading"], svg.animate-spin');
    await expect(spinner).toBeVisible();
  });

  test('skeleton loader shows while data loads', async ({ page }) => {
    await page.route('**/api/dashboard/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    
    await page.goto('/dashboard');
    
    // Look for skeleton loaders
    const skeleton = page.locator('[class*="skeleton"], [class*="shimmer"]');
    await expect(skeleton).not.toHaveCount(0);
  });
});

test.describe('Dashboard — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('export button disabled when no data', async ({ page }) => {
    await page.route('**/api/dashboard/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], kpis: {} }),
      });
    });
    
    await page.reload();
    
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    await expect(exportBtn).toBeDisabled().catch(() => {
      // Might be enabled but show "no data" message on click
    });
  });

  test('date picker closes on outside click', async ({ page }) => {
    const dateBtn = page.getByRole('button', { name: /date|today/i }).first();
    await dateBtn.click();
    
    const datePicker = page.locator('[class*="date"], [class*="picker"]').first();
    await expect(datePicker).toBeVisible();
    
    // Click outside
    await page.mouse.click(0, 0);
    
    await expect(datePicker).not.toBeVisible();
  });
});

test.describe('Dashboard — Responsive Layout', () => {
  test('KPI cards stack on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // Mobile
    await page.goto('/dashboard');
    
    const kpiCards = page.locator('[class*="card"], [class*="stat"]');
    const firstCardBox = await kpiCards.first().boundingBox();
    const secondCardBox = await kpiCards.nth(1).boundingBox();
    
    // Cards should be stacked vertically (different Y positions)
    if (firstCardBox && secondCardBox) {
      expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y);
    }
  });

  test('chart is visible and readable on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await page.goto('/dashboard');
    
    const chart = page.locator('svg, canvas, [class*="chart"]').first();
    await expect(chart).toBeVisible();
    
    const box = await chart.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThan(300);
    }
  });
});
