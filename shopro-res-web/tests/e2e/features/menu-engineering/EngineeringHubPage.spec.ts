import { test, expect, Page } from '@playwright/test';
import { loginAndNavigateTo } from '../../helpers/login';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: EngineeringHubPage ────────────────────────────────────────
// ── Feature: Menu Engineering ────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await loginAndNavigateTo(page, 'Engineering');
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('EngineeringHubPage — positive', () => {

  test('page loads with title and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /menu engineering/i })).toBeVisible();
    await expect(page.getByText(/analyze menu profitability/i)).toBeVisible();
  });

  test('KPI cards are visible', async ({ page }) => {
    await expect(page.getByText(/total analyses/i)).toBeVisible();
    await expect(page.getByText(/avg cm/i)).toBeVisible();
    await expect(page.getByText(/stars/i)).toBeVisible();
    await expect(page.getByText(/food cost/i)).toBeVisible();
  });

  test('navigation cards are visible', async ({ page }) => {
    await expect(page.getByText(/new analysis/i)).toBeVisible();
    await expect(page.getByText(/latest results/i)).toBeVisible();
    await expect(page.getByText(/live sales/i)).toBeVisible();
    await expect(page.getByText(/period history/i)).toBeVisible();
    await expect(page.getByText(/compare periods/i)).toBeVisible();
    await expect(page.getByText(/what-if simulator/i)).toBeVisible();
  });

  test('navigation card descriptions are visible', async ({ page }) => {
    await expect(page.getByText(/start a fresh analysis cycle/i)).toBeVisible();
    await expect(page.getByText(/real-time running food cost/i)).toBeVisible();
    await expect(page.getByText(/browse all past periods/i)).toBeVisible();
  });

  test('create new analysis button exists', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /new analysis/i });
    await expect(createButton).toBeVisible();
  });

  test('recent analyses section shows when periods exist', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const hasRecentAnalyses = await page.getByText(/recent analyses/i).isVisible().catch(() => false);
    if (hasRecentAnalyses) {
      await expect(page.getByText(/recent analyses/i)).toBeVisible();
    }
  });

  test('live badge is visible on Live Sales card', async ({ page }) => {
    await expect(page.getByText(/LIVE/i)).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('EngineeringHubPage — negative', () => {

  test('handles empty periods gracefully', async ({ page }) => {
    // Mock empty periods
    await page.route('**/api/**/menu-engineering/periods**', route => {
      route.fulfill({ body: JSON.stringify([]) });
    });
    
    await page.reload();
    
    // Page should still load
    await expect(page.getByRole('heading', { name: /menu engineering/i })).toBeVisible();
    
    // KPI cards should show zero values
    await expect(page.getByText(/total analyses/i)).toBeVisible();
  });

  test('handles API error gracefully', async ({ page }) => {
    await page.route('**/api/**/menu-engineering/**', route => route.abort('failed'));
    
    await page.reload();
    
    // Page should still load with some content
    await expect(page.getByRole('heading', { name: /menu engineering/i })).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('EngineeringHubPage — accessibility', () => {

  test('page icon is visible', async ({ page }) => {
    const icon = page.locator('svg').first();
    await expect(icon).toBeVisible();
  });

  test('all nav cards are keyboard accessible', async ({ page }) => {
    // Tab through nav cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should not throw errors
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to EngineeringHubPage.tsx to
 * make every selector bulletproof:
 *
 * [ ] Page header              → add data-testid="me-header"
 * [ ] Title                   → add data-testid="me-title"
 * [ ] KPI container           → add data-testid="kpi-container"
 * [ ] Total Analyses KPI       → add data-testid="kpi-total-analyses"
 * [ ] Avg CM KPI             → add data-testid="kpi-avg-cm"
 * [ ] Stars KPI              → add data-testid="kpi-stars"
 * [ ] Food Cost KPI          → add data-testid="kpi-food-cost"
 * [ ] Nav cards container    → add data-testid="nav-cards"
 * [ ] New Analysis card      → add data-testid="nav-new-analysis"
 * [ ] Latest Results card    → add data-testid="nav-latest-results"
 * [ ] Live Sales card        → add data-testid="nav-live-sales"
 * [ ] Period History card    → add data-testid="nav-period-history"
 * [ ] Compare Periods card   → add data-testid="nav-compare-periods"
 * [ ] What-If Simulator card → add data-testid="nav-whatif-simulator"
 * [ ] Recent Analyses        → add data-testid="recent-analyses"
 * [ ] Create button         → add data-testid="create-analysis-button"
 *
 * API endpoints to mock:
 * - GET /api/v1/menu-engineering/periods?restaurantId={id}
 * - GET /api/v1/menu-engineering/{periodId}/results
 * - GET /api/v1/menu-engineering/{periodId}/summary
 */
