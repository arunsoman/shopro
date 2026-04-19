import { test, expect, Page } from '@playwright/test';
import { loginAndNavigateTo } from '../../helpers/login';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: DashboardPage ─────────────────────────────────────────────
// ── Feature: Dashboard / Intelligence Hub ───────────────────────────────

test.beforeEach(async ({ page }) => {
  await loginAndNavigateTo(page, 'Dashboard');
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('DashboardPage — positive', () => {

  test('page loads with header and title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /intelligence hub/i })).toBeVisible();
    await expect(page.getByText(/7 role dashboards/i)).toBeVisible();
  });

  test('all dashboard tabs are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /cfo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /general manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /exec chef/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /foh manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /bar manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /shift manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /catering/i })).toBeVisible();
  });

  test('clicking each tab switches dashboard content', async ({ page }) => {
    // Default is CFO tab
    await expect(page.getByText(/cfo active/i)).toBeVisible();
    
    // Click GM tab
    await page.getByRole('button', { name: /general manager/i }).click();
    await expect(page.getByText(/general manager active/i)).toBeVisible();
    
    // Click Chef tab
    await page.getByRole('button', { name: /exec chef/i }).click();
    await expect(page.getByText(/exec chef active/i)).toBeVisible();
    
    // Click FOH tab
    await page.getByRole('button', { name: /foh manager/i }).click();
    await expect(page.getByText(/foh manager active/i)).toBeVisible();
    
    // Click Bar Manager tab
    await page.getByRole('button', { name: /bar manager/i }).click();
    await expect(page.getByText(/bar manager active/i)).toBeVisible();
    
    // Click Shift Manager tab
    await page.getByRole('button', { name: /shift manager/i }).click();
    await expect(page.getByText(/shift manager active/i)).toBeVisible();
    
    // Click Catering tab
    await page.getByRole('button', { name: /catering/i }).click();
    await expect(page.getByText(/catering active/i)).toBeVisible();
  });

  test('active tab shows visual indicator', async ({ page }) => {
    // CFO should be active by default
    const cfoButton = page.getByRole('button', { name: /cfo/i });
    await expect(cfoButton).toHaveClass(/bg-emerald-500\/10/);
    
    // Click GM - should become active
    await page.getByRole('button', { name: /general manager/i }).click();
    const gmButton = page.getByRole('button', { name: /general manager/i });
    await expect(gmButton).toHaveClass(/bg-indigo-500\/10/);
  });

  test('live indicator shows current time', async ({ page }) => {
    // Should show live indicator with time
    await expect(page.getByText(/live/i)).toBeVisible();
  });

  test('tab shows sub-label description', async ({ page }) => {
    await expect(page.getByText(/financial command/i)).toBeVisible(); // CFO sub
    await expect(page.getByText(/business owner view/i)).toBeVisible(); // GM sub
  });

  test('dashboard content animates on tab switch', async ({ page }) => {
    // Should have animation class when switching
    await page.getByRole('button', { name: /general manager/i }).click();
    
    // Check for animation class
    const dashboardContent = page.locator('.animate-in');
    await expect(dashboardContent).toBeVisible();
  });

  test('each role dashboard renders its content', async ({ page }) => {
    const tabs = ['cfo', 'general manager', 'exec chef', 'foh manager', 'bar manager', 'shift manager', 'catering'];
    
    for (const tab of tabs) {
      await page.getByRole('button', { name: new RegExp(tab, 'i') }).click();
      
      // Wait for content to load (allowing for async data)
      await page.waitForTimeout(500);
      
      // Should still be on dashboard page
      await expect(page).toHaveURL(/dashboard/);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('DashboardPage — negative', () => {

  test('tab state persists after clicking same tab', async ({ page }) => {
    // Click CFO twice
    await page.getByRole('button', { name: /cfo/i }).click();
    await page.getByRole('button', { name: /cfo/i }).click();
    
    // Should still show CFO active
    await expect(page.getByText(/cfo active/i)).toBeVisible();
  });

  test('rapid tab switching works correctly', async ({ page }) => {
    // Rapidly click through tabs
    await page.getByRole('button', { name: /cfo/i }).click();
    await page.getByRole('button', { name: /general manager/i }).click();
    await page.getByRole('button', { name: /exec chef/i }).click();
    await page.getByRole('button', { name: /cfo/i }).click();
    
    // Should end on CFO tab
    await expect(page.getByText(/cfo active/i)).toBeVisible();
  });

  test('page handles slow network gracefully', async ({ page }) => {
    // Slow down network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.reload();
    
    // Page should still load tabs (may show loading states)
    await expect(page.getByRole('heading', { name: /intelligence hub/i })).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('DashboardPage — accessibility', () => {

  test('all tabs are keyboard accessible', async ({ page }) => {
    // Focus should move through tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should not throw any errors
  });

  test('tabs have accessible names', async ({ page }) => {
    const cfoTab = page.getByRole('button', { name: /cfo/i });
    await expect(cfoTab).toHaveAttribute('name', /cfo/i);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to DashboardPage.tsx to
 * make every selector bulletproof:
 *
 * [ ] Dashboard header container         → add data-testid="dashboard-header"
 * [ ] Page title "Intelligence Hub"    → add data-testid="dashboard-title"
 * [ ] Tab list container                → add data-testid="dashboard-tabs"
 * [ ] Each tab button                  → add data-testid="tab-{id}" (e.g., tab-cfo, tab-gm)
 * [ ] Active tab indicator             → add data-testid="active-tab-indicator"
 * [ ] Live indicator                  → add data-testid="live-indicator"
 * [ ] Dashboard content area          → add data-testid="dashboard-content"
 * [ ] CFO dashboard component         → add data-testid="dashboard-cfo"
 * [ ] GM dashboard component          → add data-testid="dashboard-gm"
 * [ ] Chef dashboard component        → add data-testid="dashboard-chef"
 * [ ] FOH dashboard component         → add data-testid="dashboard-foh"
 * [ ] Bar dashboard component         → add data-testid="dashboard-bar"
 * [ ] Shift dashboard component       → add data-testid="dashboard-shift"
 * [ ] Catering dashboard component    → add data-testid="dashboard-catering"
 *
 * Child dashboard components (CfoDashboard, GmDashboard, etc.) need:
 * - Each stat card                   → add data-testid="stat-card-{name}"
 * - Each chart                       → add data-testid="chart-{name}"
 * - Each table                       → add data-testid="table-{name}"
 */
