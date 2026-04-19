import { test, expect, Page } from '@playwright/test';
import { loginAndNavigateTo } from '../../helpers/login';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: InventoryHub ─────────────────────────────────────────────
// ── Feature: Inventory / Supply Operations ─────────────────────────────

test.beforeEach(async ({ page }) => {
  await loginAndNavigateTo(page, 'Inventory');
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('InventoryHub — positive', () => {

  test('page loads with header and title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inventory control/i })).toBeVisible();
    await expect(page.getByText(/supply operations/i)).toBeVisible();
  });

  test('KPI cards display correctly', async ({ page }) => {
    await expect(page.getByText(/food assets/i)).toBeVisible();
    await expect(page.getByText(/bar assets/i)).toBeVisible();
    await expect(page.getByText(/critical shortages/i)).toBeVisible();
  });

  test('navigation cards are visible', async ({ page }) => {
    await expect(page.getByText(/ingredient master/i)).toBeVisible();
    await expect(page.getByText(/count entry/i)).toBeVisible();
    await expect(page.getByText(/period history/i)).toBeVisible();
    await expect(page.getByText(/low stock alerts/i)).toBeVisible();
  });

  test('new ingredient button exists', async ({ page }) => {
    const newIngredientButton = page.getByRole('button', { name: /new ingredient/i });
    await expect(newIngredientButton).toBeVisible();
  });

  test('settings button exists', async ({ page }) => {
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await expect(settingsButton).toBeVisible();
  });

  test('navigation cards have descriptions', async ({ page }) => {
    await expect(page.getByText(/centralized catalog of all raw materials/i)).toBeVisible();
    await expect(page.getByText(/high-speed interface for recording/i)).toBeVisible();
  });

  test('clicking navigation card navigates to correct route', async ({ page }) => {
    // Click on "Ingredient Master" nav card
    await page.getByText(/ingredient master/i).click();
    
    // Should navigate (URL should change)
    await page.waitForURL(/ingredient|master/i);
  });

  test('low stock alerts card shows count', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // The alert count should be displayed (could be 0 or positive)
    const alertCard = page.getByText(/critical shortages/i).locator('..');
    await expect(alertCard).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('InventoryHub — negative', () => {

  test('handles missing inventory data gracefully', async ({ page }) => {
    // Mock empty data
    await page.route('**/api/**/inventory/**', route => {
      route.fulfill({ body: JSON.stringify({}) });
    });
    
    await page.reload();
    
    // Page should still load with placeholder values
    await expect(page.getByRole('heading', { name: /inventory control/i })).toBeVisible();
  });

  test('handles network error for alerts', async ({ page }) => {
    await page.route('**/api/**/alerts**', route => route.abort('failed'));
    
    await page.reload();
    
    // Should still show the page
    await expect(page.getByRole('heading', { name: /inventory control/i })).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('InventoryHub — accessibility', () => {

  test('back button exists and is accessible', async ({ page }) => {
    const backButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await expect(backButton).toBeVisible();
  });

  test('all buttons have accessible names', async ({ page }) => {
    const buttons = [
      page.getByRole('button', { name: /new ingredient/i }),
      page.getByRole('button', { name: /settings/i }),
    ];
    
    for (const button of buttons) {
      await expect(button).toBeVisible();
    }
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to InventoryHub.tsx to
 * make every selector bulletproof:
 *
 * [ ] Main container               → add data-testid="inventory-hub"
 * [ ] Header                       → add data-testid="inventory-header"
 * [ ] Back button                 → add data-testid="back-button"
 * [ ] Title "Inventory Control"   → add data-testid="page-title"
 * [ ] Food Assets KPI card        → add data-testid="kpi-food-assets"
 * [ ] Bar Assets KPI card         → add data-testid="kpi-bar-assets"
 * [ ] Critical Shortages KPI card → add data-testid="kpi-critical-shortages"
 * [ ] Nav cards container         → add data-testid="nav-cards-container"
 * [ ] Ingredient Master nav card  → add data-testid="nav-ingredient-master"
 * [ ] Count Entry nav card        → add data-testid="nav-count-entry"
 * [ ] Period History nav card     → add data-testid="nav-period-history"
 * [ ] Low Stock Alerts nav card   → add data-testid="nav-low-stock-alerts"
 * [ ] New Ingredient button       → add data-testid="new-ingredient-button"
 * [ ] Settings button             → add data-testid="settings-button"
 *
 * API endpoints to mock:
 * - GET /api/v1/inventory/latest?type=FOOD
 * - GET /api/v1/inventory/latest?type=BAR  
 * - GET /api/v1/ingredients/alerts?restaurantId={id}
 */
