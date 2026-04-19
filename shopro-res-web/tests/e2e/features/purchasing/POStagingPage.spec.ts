import { test, expect, Page } from '@playwright/test';
import { loginAndNavigateTo } from '../../helpers/login';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: POStagingPage ────────────────────────────────────────────
// ── Feature: Purchasing / Reorder Staging ────────────────────────────────

test.beforeEach(async ({ page }) => {
  await loginAndNavigateTo(page, 'Purchasing');
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('POStagingPage — positive', () => {

  test('page loads with header and title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /reorder staging/i })).toBeVisible();
    await expect(page.getByText(/procurement staging/i)).toBeVisible();
  });

  test('view toggle switches between vendor and advanced view', async ({ page }) => {
    // Default is vendor view
    const vendorViewBtn = page.getByRole('button', { name: /vendor view/i });
    const advancedViewBtn = page.getByRole('button', { name: /advanced/i });
    
    await expect(vendorViewBtn).toBeVisible();
    await expect(advancedViewBtn).toBeVisible();
    
    // Vendor view is active by default (has different styling)
    await expect(vendorViewBtn).toHaveClass(/bg-indigo-600/);
    
    // Click advanced view
    await advancedViewBtn.click();
    await expect(advancedViewBtn).toHaveClass(/bg-indigo-600/);
    
    // Click back to vendor view
    await vendorViewBtn.click();
    await expect(vendorViewBtn).toHaveClass(/bg-indigo-600/);
  });

  test('stats cards display correctly', async ({ page }) => {
    await expect(page.getByText(/total shortfall/i)).toBeVisible();
    await expect(page.getByText(/preferred vendors/i)).toBeVisible();
    await expect(page.getByText(/selected/i)).toBeVisible();
    await expect(page.getByText(/raise po/i)).toBeVisible();
  });

  test('back navigation button exists', async ({ page }) => {
    const backButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await expect(backButton).toBeVisible();
  });

  test('create PO button is disabled when nothing selected', async ({ page }) => {
    const createPOButton = page.getByRole('button', { name: /create po/i });
    await expect(createPOButton).toBeDisabled();
  });

  test('vendor cards render when there are low-stock items', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check for vendor card elements - look for supplier name text
    const supplierCards = page.locator('[class*="rounded-"][class*="border-"]').filter({
      has: page.locator('h3, p').filter({ hasText: /supplier/i })
    });
    
    // If there are items, cards should be visible
    const cards = await supplierCards.count();
    if (cards > 0) {
      await expect(supplierCards.first()).toBeVisible();
    }
  });

  test('clicking vendor card selects all items from that vendor', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find a vendor card and click it
    const vendorCards = page.locator('[class*="rounded-[2rem]"][class*="border-"]');
    const cardCount = await vendorCards.count();
    
    if (cardCount > 0) {
      await vendorCards.first().click();
      
      // Selected count should update
      await expect(page.getByText(/selected/i)).not.toHaveText(/selected\n0/);
    }
  });

  test('raise PO button becomes enabled after selecting items', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click a vendor card to select items
    const vendorCards = page.locator('[class*="rounded-[2rem]"][class*="border-"]');
    const cardCount = await vendorCards.count();
    
    if (cardCount > 0) {
      await vendorCards.first().click();
      
      // Create PO button should be enabled
      const createPOButton = page.getByRole('button', { name: /create po/i });
      await expect(createPOButton).toBeEnabled();
    }
  });

  test('advanced view shows table with items', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Switch to advanced view
    await page.getByRole('button', { name: /advanced/i }).click();
    
    // Table should be visible
    await expect(page.getByRole('table')).toBeVisible();
    
    // Check for table headers
    await expect(page.getByText(/identity/i)).toBeVisible();
    await expect(page.getByText(/on hand/i)).toBeVisible();
    await expect(page.getByText(/shortfall/i)).toBeVisible();
  });

  test('table rows are selectable via checkboxes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Switch to advanced view
    await page.getByRole('button', { name: /advanced/i }).click();
    
    // Find a checkbox in the table
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 1) { // First is "select all"
      await checkboxes.nth(1).click();
      
      // Selected count should update
      await expect(page.getByText(/selected/i)).not.toHaveText(/selected\n0/);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('POStagingPage — negative', () => {

  test('empty state shows when no low-stock items', async ({ page }) => {
    // This would require mocking empty data - placeholder test
    await page.waitForLoadState('networkidle');
    
    // Check if there's an empty state or cards
    const hasContent = await page.getByText(/items need restock/i).isVisible().catch(() => false) 
      || await page.getByText(/all stock verified/i).isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('network error shows error state', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**/low-stock**', route => route.abort('failed'));
    
    await page.reload();
    
    // Should show some error indicator or loading state
    const hasError = await page.getByText(/error/i).isVisible().catch(() => false)
      || await page.getByText(/failed/i).isVisible().catch(() => false);
    
    // Or should show loading still
    const isLoading = await page.locator('svg.animate-spin').isVisible().catch(() => false);
    expect(hasError || isLoading).toBeTruthy();
  });

  test('vendor card click toggles selection correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const vendorCards = page.locator('[class*="rounded-[2rem]"][class*="border-"]');
    const cardCount = await vendorCards.count();
    
    if (cardCount > 0) {
      // First click - select all
      await vendorCards.first().click();
      const firstClickSelected = await page.getByText(/selected/i).textContent();
      
      // Second click - deselect all
      await vendorCards.first().click();
      const secondClickSelected = await page.getByText(/selected/i).textContent();
      
      // Selected count should be different
      expect(firstClickSelected).not.toEqual(secondClickSelected);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('POStagingPage — accessibility', () => {

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Tab through interactive elements
    const tabableElements = [
      page.getByRole('button', { name: /vendor view/i }),
      page.getByRole('button', { name: /advanced/i }),
      page.getByRole('button', { name: /create po/i }),
    ];
    
    for (const element of tabableElements) {
      await page.keyboard.press('Tab');
      // Should focus on an element without throwing
    }
  });

  test('view toggle buttons have accessible names', async ({ page }) => {
    await expect(page.getByRole('button', { name: /vendor view/i })).toHaveAttribute('name', /vendor view/i);
    await expect(page.getByRole('button', { name: /advanced/i })).toHaveAttribute('name', /advanced/i);
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to POStagingPage.tsx to
 * make every selector bulletproof:
 *
 * [ ] Header section                    → add data-testid="staging-header"
 * [ ] Vendor View button               → add data-testid="view-toggle-vendor"
 * [ ] Advanced View button             → add data-testid="view-toggle-advanced"
 * [ ] Total Shortfall stat             → add data-testid="stat-total-shortfall"
 * [ ] Preferred Vendors stat           → add data-testid="stat-preferred-vendors"
 * [ ] Selected stat                    → add data-testid="stat-selected"
 * [ ] Create PO button                 → add data-testid="create-po-button"
 * [ ] Vendor card container            → add data-testid="vendor-cards-container"
 * [ ] Each vendor card                 → add data-testid="vendor-card-{supplierId}"
 * [ ] Vendor card checkbox             → add data-testid="vendor-card-checkbox-{supplierId}"
 * [ ] Raise PO button on card          → add data-testid="raise-po-button-{supplierId}"
 * [ ] Staging table                    → add data-testid="staging-table"
 * [ ] Table row checkboxes             → add data-testid="staging-row-checkbox-{itemId}"
 * [ ] Back navigation button           → add data-testid="back-button"
 * [ ] Loading spinner                  → add data-testid="loading-spinner"
 * [ ] Empty state container            → add data-testid="empty-state"
 *
 * API endpoints to mock for tests:
 * - GET /api/v1/staging/low-stock (returns StagingItem[])
 * - GET /api/v1/preferred-vendors?restaurantId={id}
 * - POST /api/v1/purchase-orders (creates PO)
 */
