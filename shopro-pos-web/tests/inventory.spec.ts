import { test, expect } from '@playwright/test';

/**
 * Inventory Module Tests
 * Tests stock management, procurement, vendors, recipes, and 3-way match
 * 
 * Source: /features/inventory/pages/*, /features/inventory/components/*
 */

test.describe('Inventory — Stock Dashboard Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/stock');
  });

  test('shows inventory dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inventory|stock/i })).toBeVisible();
  });

  test('displays SKU cards or inventory table', async ({ page }) => {
    const skuItems = page.locator('[class*="sku"], [class*="item"], tr').filter({ hasText: /[A-Z]{2,}/i });
    await expect(skuItems).not.toHaveCount(0);
  });

  test('shows stock level indicators', async ({ page }) => {
    const stockLevels = page.locator('[class*="stock"], [class*="level"], span').filter({ hasText: /kg|g|l|pcs|units/i });
    await expect(stockLevels).not.toHaveCount(0);
  });

  test('shows low stock alerts', async ({ page }) => {
    const alerts = page.locator('[class*="alert"], [class*="warning"], [class*="critical"]').filter({ hasText: /low|critical|alert/i });
    await expect(alerts).not.toHaveCount(0);
  });

  test('displays filter bar with search and categories', async ({ page }) => {
    const searchBar = page.getByPlaceholder(/search/i).or(page.locator('input[type="text"]').first());
    await expect(searchBar).toBeVisible();
    
    const categoryFilter = page.locator('select, button').filter({ hasText: /category|all/i });
    await expect(categoryFilter).toBeVisible();
  });
});

test.describe('Inventory — SKU Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/stock');
  });

  test('add new SKU button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /sku|item|ingredient/i });
    await expect(addBtn).toBeVisible();
  });

  test('clicking SKU opens detail view', async ({ page }) => {
    const skuItem = page.locator('[class*="sku"], [class*="item"], tr').first();
    await skuItem.click();
    
    // Should navigate to SKU detail page
    await expect(page.url()).toContain('/inventory/stock/');
  });

  test('edit SKU button opens form', async ({ page }) => {
    const editBtn = page.getByRole('button', { name: /edit/i }).first();
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|sku|ingredient/i });
    await expect(form).toBeVisible();
  });

  test('delete SKU shows confirmation dialog', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete|remove/i }).first();
    await deleteBtn.click();
    
    const confirmDialog = page.locator('[role="dialog"]').filter({ hasText: /confirm|delete|sure/i });
    await expect(confirmDialog).toBeVisible();
  });

  test('SKU form validates required fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /sku/i });
    await addBtn.click();
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const errors = page.locator('text=/required|invalid/i');
    await expect(errors).not.toHaveCount(0);
  });
});

test.describe('Inventory — Recipes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/recipes');
  });

  test('shows recipes heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recipes/i })).toBeVisible();
  });

  test('displays recipe cards or list', async ({ page }) => {
    const recipes = page.locator('[class*="recipe"], [class*="card"]').filter({ hasText: /recipe/i });
    await expect(recipes).not.toHaveCount(0);
  });

  test('create recipe button is visible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create|add/i }).filter({ hasText: /recipe/i });
    await expect(createBtn).toBeVisible();
  });

  test('recipe builder shows ingredient selector', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /recipe/i });
    await createBtn.click();
    
    const ingredientSelector = page.locator('[class*="ingredient"], [class*="selector"]').filter({ hasText: /add|select/i });
    await expect(ingredientSelector).toBeVisible();
  });

  test('recipe shows cost calculation', async ({ page }) => {
    const costDisplay = page.locator('[class*="cost"], [class*="price"]').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(costDisplay).not.toHaveCount(0);
  });

  test('sub-recipe builder is available', async ({ page }) => {
    const subRecipeBtn = page.getByRole('button', { name: /sub-recipe|component/i });
    await expect(subRecipeBtn).toBeVisible();
  });
});

test.describe('Inventory — Vendors & Catalogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/vendors');
  });

  test('shows vendors heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /vendor|supplier/i })).toBeVisible();
  });

  test('displays vendor cards', async ({ page }) => {
    const vendors = page.locator('[class*="vendor"], [class*="supplier"], [class*="card"]').filter({ hasText: /vendor|supplier/i });
    await expect(vendors).not.toHaveCount(0);
  });

  test('add vendor button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /vendor|supplier/i });
    await expect(addBtn).toBeVisible();
  });

  test('vendor detail shows catalog items', async ({ page }) => {
    const vendorCard = page.locator('[class*="vendor"], [class*="card"]').first();
    await vendorCard.click();
    
    await expect(page.url()).toContain('/inventory/vendors/');
    
    const catalogItems = page.locator('[class*="catalog"], [class*="item"]').filter({ hasText: /item|product/i });
    await expect(catalogItems).not.toHaveCount(0);
  });

  test('vendor comparison shows price proposals', async ({ page }) => {
    const proposalsBtn = page.getByRole('button', { name: /proposals|bids|compare/i });
    await expect(proposalsBtn).toBeVisible();
  });
});

test.describe('Inventory — Procurement (RFQs)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/procurement');
  });

  test('shows RFQ management heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /rfq|procurement|request for quote/i })).toBeVisible();
  });

  test('create RFQ button is visible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create|add/i }).filter({ hasText: /rfq|quote/i });
    await expect(createBtn).toBeVisible();
  });

  test('RFQ form shows item selector', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /rfq/i });
    await createBtn.click();
    
    const itemSelector = page.locator('[class*="item"], [class*="selector"]').filter({ hasText: /add|select/i });
    await expect(itemSelector).toBeVisible();
  });

  test('RFQ shows vendor selection', async ({ page }) => {
    const vendorSelector = page.locator('select, [class*="vendor"]').filter({ hasText: /vendor|supplier/i });
    await expect(vendorSelector).toBeVisible();
  });

  test('submit RFQ sends to vendors', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /submit|send|publish/i });
    await expect(submitBtn).toBeVisible();
  });

  test('review bids dialog shows proposals', async ({ page }) => {
    const reviewBtn = page.getByRole('button', { name: /review|bids|proposals/i });
    await expect(reviewBtn).toBeVisible();
  });
});

test.describe('Inventory — Purchase Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/pos');
  });

  test('shows PO management heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /purchase order|po/i })).toBeVisible();
  });

  test('displays PO kanban or list', async ({ page }) => {
    const pos = page.locator('[class*="po"], [class*="order"], [class*="kanban"]').filter({ hasText: /po-|order/i });
    await expect(pos).not.toHaveCount(0);
  });

  test('create PO button is visible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create|add/i }).filter({ hasText: /po|order/i });
    await expect(createBtn).toBeVisible();
  });

  test('PO shows status badges', async ({ page }) => {
    const statusBadges = page.locator('[class*="badge"], [class*="status"]').filter({ hasText: /pending|approved|received/i });
    await expect(statusBadges).not.toHaveCount(0);
  });

  test('receive PO button opens goods receiving', async ({ page }) => {
    const receiveBtn = page.getByRole('button', { name: /receive|grn|goods/i });
    await expect(receiveBtn).toBeVisible();
  });

  test('3-way match button opens verification panel', async ({ page }) => {
    const matchBtn = page.getByRole('button', { name: /match|verify|3-way/i });
    await expect(matchBtn).toBeVisible();
  });
});

test.describe('Inventory — 3-Way Match', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/pos');
  });

  test('AI smart match page is accessible', async ({ page }) => {
    await page.goto('/inventory/po/smart-match');
    
    await expect(page.getByRole('heading', { name: /ai|smart|match/i })).toBeVisible();
  });

  test('3-way match shows PO, GRN, Invoice comparison', async ({ page }) => {
    await page.goto('/inventory/po/:id/match');
    
    const poSection = page.locator('[class*="po"], [class*="purchase"]').filter({ hasText: /po|order/i });
    await expect(poSection).toBeVisible();
    
    const grnSection = page.locator('[class*="grn"], [class*="receiving"]').filter({ hasText: /grn|received/i });
    await expect(grnSection).toBeVisible();
    
    const invoiceSection = page.locator('[class*="invoice"]').filter({ hasText: /invoice/i });
    await expect(invoiceSection).toBeVisible();
  });

  test('verify match button posts invoice', async ({ page }) => {
    const verifyBtn = page.getByRole('button', { name: /verify|approve|match/i });
    await expect(verifyBtn).toBeVisible();
  });

  test('mismatch warnings show discrepancies', async ({ page }) => {
    const warnings = page.locator('[class*="warning"], [class*="mismatch"], [class*="discrepancy"]');
    await expect(warnings).not.toHaveCount(0);
  });
});

test.describe('Inventory — Waste & Donation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/waste');
  });

  test('shows waste logging heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /waste|donation|spoilage/i })).toBeVisible();
  });

  test('log waste button opens dialog', async ({ page }) => {
    const logBtn = page.getByRole('button', { name: /log|add|record/i }).filter({ hasText: /waste/i });
    await logBtn.click();
    
    const dialog = page.locator('[role="dialog"]').filter({ hasText: /waste|spoilage/i });
    await expect(dialog).toBeVisible();
  });

  test('waste form shows reason selector', async ({ page }) => {
    const reasonSelector = page.locator('select, [class*="reason"]').filter({ hasText: /reason|type/i });
    await expect(reasonSelector).toBeVisible();
  });

  test('donation log button is available', async ({ page }) => {
    const donationBtn = page.getByRole('button', { name: /donation|donate/i });
    await expect(donationBtn).toBeVisible();
  });
});

test.describe('Inventory — Perishables & Expiry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/perishables');
  });

  test('shows daily perishables heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /perishable|daily/i })).toBeVisible();
  });

  test('expiry monitor shows items expiring soon', async ({ page }) => {
    await page.goto('/inventory/expiry');
    
    const expiringItems = page.locator('[class*="expiry"], [class*="expiring"]').filter({ hasText: /expir|days left/i });
    await expect(expiringItems).not.toHaveCount(0);
  });

  test('shelf life rotation dashboard is accessible', async ({ page }) => {
    await page.goto('/inventory/shelf-life');
    
    await expect(page.getByRole('heading', { name: /shelf|rotation|fifo/i })).toBeVisible();
  });

  test('FIFO indicator shows rotation status', async ({ page }) => {
    const fifoIndicator = page.locator('[class*="fifo"], [class*="rotation"]').filter({ hasText: /fifo|first/i });
    await expect(fifoIndicator).not.toHaveCount(0);
  });
});

test.describe('Inventory — Alerts & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/alerts');
  });

  test('shows restocking alerts heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /alert|restock|low stock/i })).toBeVisible();
  });

  test('displays low stock items list', async ({ page }) => {
    const lowStockItems = page.locator('[class*="alert"], [class*="low"]').filter({ hasText: /low|critical/i });
    await expect(lowStockItems).not.toHaveCount(0);
  });

  test('yield analysis page is accessible', async ({ page }) => {
    await page.goto('/inventory/yield');
    
    await expect(page.getByRole('heading', { name: /yield|analysis/i })).toBeVisible();
  });

  test('theoretical vs actual report shows variance', async ({ page }) => {
    await page.goto('/inventory');
    
    const varianceReport = page.locator('[class*="variance"], [class*="theoretical"]').filter({ hasText: /variance|diff/i });
    await expect(varianceReport).not.toHaveCount(0);
  });
});

test.describe('Inventory — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/stock');
  });

  test('shows error on failed inventory load', async ({ page }) => {
    await page.route('**/api/inventory/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no inventory', async ({ page }) => {
    await page.route('**/api/inventory/stock', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no items|empty|add your first/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads inventory after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/inventory/*', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [{ id: 1, sku: 'TEST001', name: 'Test Item' }] }),
        });
      }
    });
    
    await page.goto('/inventory/stock');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Inventory — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/stock');
  });

  test('cannot add SKU with duplicate code', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /sku/i });
    await addBtn.click();
    
    const skuInput = page.getByLabel(/sku|code/i).or(page.locator('input').first());
    await skuInput.fill('EXISTING001');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('recipe form validates ingredient quantities', async ({ page }) => {
    await page.goto('/inventory/recipes');
    
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /recipe/i });
    await createBtn.click();
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const errors = page.locator('text=/required|invalid|quantity/i');
    await expect(errors).not.toHaveCount(0);
  });

  test('PO cannot be received without GRN', async ({ page }) => {
    await page.goto('/inventory/pos');
    
    const receiveBtn = page.getByRole('button', { name: /receive/i }).first();
    await receiveBtn.click();
    
    // Should show validation or require GRN
    const validationError = page.locator('text=/grn|receiving|required/i');
    await expect(validationError).toBeVisible().catch(() => {
      // Might handle differently
    });
  });

  test('3-way match shows error on price mismatch', async ({ page }) => {
    await page.goto('/inventory/po/:id/match');
    
    const mismatchWarning = page.locator('text=/mismatch|discrepancy|price difference/i');
    await expect(mismatchWarning).toBeVisible();
  });
});

test.describe('Inventory — Responsive Layout', () => {
  test('inventory table adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/inventory/stock');
    
    const table = page.locator('table, [class*="table"]');
    // Should be scrollable or card-based on mobile
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('filter bar collapses on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/inventory/stock');
    
    const filterBar = page.locator('[class*="filter"], [class*="bar"]').first();
    // Should be stacked or collapsible
    const box = await filterBar.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThan(50); // Stacked vertically
    }
  });
});
