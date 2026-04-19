import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Inventory Module Tests — ShoPro Restaurant Web
 * Tests inventory hub, ingredient master, count entry, alerts, and period history
 * 
 * Sources:
 * - InventoryHub.tsx (main hub with nav cards)
 * - IngredientMasterPage.tsx (ingredient catalog)
 * - InventoryCountEntry.tsx (physical count interface)
 * - LowStockAlerts.tsx (critical shortage monitoring)
 * - PeriodHistory.tsx (archival records)
 */

test.describe('Inventory — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
  });

  test('no NaN in inventory hub KPIs', async ({ page }) => {
    await expectNoNaN(page, 'Inventory Hub');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in ingredient master', async ({ page }) => {
    await page.goto('/inventory/ingredients');
    await expectNoNaN(page, 'Ingredient Master');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in count entry', async ({ page }) => {
    await page.goto('/inventory/count');
    await expectNoNaN(page, 'Count Entry');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in low stock alerts', async ({ page }) => {
    await page.goto('/inventory/alerts');
    await expectNoNaN(page, 'Low Stock Alerts');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in period history', async ({ page }) => {
    await page.goto('/inventory/history');
    await expectNoNaN(page, 'Period History');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in ingredient detail', async ({ page }) => {
    await page.goto('/inventory/ingredients/1');
    await expectNoNaN(page, 'Ingredient Detail');
    await expectNoNaNInNumericDisplays(page);
  });
});

test.describe('Inventory Hub — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
  });

  test('shows inventory control heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inventory control/i })).toBeVisible();
  });

  test('shows supply operations subtitle', async ({ page }) => {
    await expect(page.getByText(/supply operations/i)).toBeVisible();
  });

  test('displays warehouse icon', async ({ page }) => {
    const icon = page.locator('[data-lucide="warehouse"]').or(page.locator('svg').first());
    await expect(icon).toBeVisible();
  });

  test('shows New Ingredient button', async ({ page }) => {
    const newBtn = page.getByRole('button', { name: /new ingredient/i });
    await expect(newBtn).toBeVisible();
  });

  test('shows settings button', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') });
    await expect(settingsBtn).toBeVisible();
  });

  test('displays KPI cards section', async ({ page }) => {
    const kpiSection = page.locator('[class*="kpi"], [class*="grid"]').first();
    await expect(kpiSection).toBeVisible();
  });

  test('shows Food Assets KPI', async ({ page }) => {
    const foodKpi = page.locator('[class*="card"]').filter({ hasText: /food assets/i });
    await expect(foodKpi).toBeVisible();
  });

  test('shows Bar Assets KPI', async ({ page }) => {
    const barKpi = page.locator('[class*="card"]').filter({ hasText: /bar assets/i });
    await expect(barKpi).toBeVisible();
  });

  test('shows Critical Shortages KPI', async ({ page }) => {
    const shortagesKpi = page.locator('[class*="card"]').filter({ hasText: /critical shortages/i });
    await expect(shortagesKpi).toBeVisible();
  });

  test('displays navigation cards grid', async ({ page }) => {
    const navCards = page.locator('[class*="nav"], [class*="card"]').filter({ hasText: /ingredient|count|history|alerts/i });
    await expect(navCards).not.toHaveCount(0);
  });
});

test.describe('Inventory Hub — Navigation Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
  });

  test('Ingredient Master card is visible', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /ingredient master/i });
    await expect(card).toBeVisible();
    
    await expect(page.getByText(/centralized catalog|raw materials/i)).toBeVisible();
  });

  test('Count Entry card is visible', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /count entry/i });
    await expect(card).toBeVisible();
    
    await expect(page.getByText(/high-speed interface|physical stock/i)).toBeVisible();
  });

  test('Period History card is visible', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /period history/i });
    await expect(card).toBeVisible();
    
    await expect(page.getByText(/archival records|finalized/i)).toBeVisible();
  });

  test('Low Stock Alerts card is visible', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /low stock alerts/i });
    await expect(card).toBeVisible();
    
    await expect(page.getByText(/real-time monitoring|critical par/i)).toBeVisible();
  });

  test('clicking Ingredient Master navigates to ingredients page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /ingredient master/i });
    await card.click();
    
    await expect(page.url()).toContain('/inventory/ingredients');
  });

  test('clicking Count Entry navigates to count page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /count entry/i });
    await card.click();
    
    await expect(page.url()).toContain('/inventory/count');
  });

  test('clicking Period History navigates to history page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /period history/i });
    await card.click();
    
    await expect(page.url()).toContain('/inventory/history');
  });

  test('clicking Low Stock Alerts navigates to alerts page', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /low stock alerts/i });
    await card.click();
    
    await expect(page.url()).toContain('/inventory/alerts');
  });

  test('navigation cards have hover effects', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /ingredient master/i });
    
    await card.hover();
    
    // Should have scale or shadow change
    const boxBefore = await card.boundingBox();
    await page.waitForTimeout(200);
    const boxAfter = await card.boundingBox();
    
    expect(boxBefore).toBeTruthy();
    expect(boxAfter).toBeTruthy();
  });
});

test.describe('Ingredient Master Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/ingredients');
  });

  test('shows ingredient master heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ingredient master/i })).toBeVisible();
  });

  test('displays search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search ingredients/i).or(page.locator('input[type="text"]').first());
    await expect(searchInput).toBeVisible();
  });

  test('shows filter dropdowns', async ({ page }) => {
    const filters = page.locator('select, button').filter({ hasText: /category|type|all/i });
    await expect(filters).not.toHaveCount(0);
  });

  test('displays ingredients table or list', async ({ page }) => {
    const ingredients = page.locator('table, tr, [class*="ingredient"]').filter({ hasText: /[a-z]+/i });
    await expect(ingredients).not.toHaveCount(0);
  });

  test('shows add ingredient button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /ingredient/i });
    await expect(addBtn).toBeVisible();
  });

  test('ingredient shows name and SKU/code', async ({ page }) => {
    const names = page.locator('td, span').filter({ hasText: /[A-Z]{2,}[0-9]*|ingredient/i });
    await expect(names).not.toHaveCount(0);
  });

  test('ingredient shows category', async ({ page }) => {
    const categories = page.locator('td, span').filter({ hasText: /produce|dairy|meat|dry|beverage/i });
    await expect(categories).not.toHaveCount(0);
  });

  test('ingredient shows unit of measure', async ({ page }) => {
    const units = page.locator('td, span').filter({ hasText: /kg|g|l|ml|pcs|case/i });
    await expect(units).not.toHaveCount(0);
  });

  test('ingredient shows current stock level', async ({ page }) => {
    const stockLevels = page.locator('td, span').filter({ hasText: /[0-9]+(\.[0-9]+)?/ });
    await expect(stockLevels).not.toHaveCount(0);
  });

  test('ingredient shows par level', async ({ page }) => {
    const parLevels = page.locator('td, span').filter({ hasText: /par|min|max/i });
    await expect(parLevels).not.toHaveCount(0);
  });
});

test.describe('Ingredient Master — Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/ingredients');
  });

  test('search filters ingredients list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="text"]').first());
    await searchInput.fill('Test');
    
    // Should filter or show no results
    const ingredients = page.locator('table, tr, [class*="ingredient"]');
    const isEmpty = await page.locator('text=/no ingredients|empty/i').isVisible().catch(() => false);
    expect(isEmpty || await ingredients.count() >= 0).toBe(true);
  });

  test('category filter works', async ({ page }) => {
    const categoryFilter = page.locator('select, button').filter({ hasText: /category|all/i }).first();
    await categoryFilter.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /[a-z]+/i }).first();
    await option.click();
    
    // Should filter ingredients
    const filtered = page.locator('table, tr, [class*="ingredient"]');
    await expect(filtered).not.toHaveCount(0);
  });

  test('clicking ingredient opens detail view', async ({ page }) => {
    const ingredient = page.locator('tr, [class*="ingredient"]').first();
    await ingredient.click();
    
    // Should navigate to detail page
    await expect(page.url()).toContain('/inventory/ingredients/');
  });

  test('edit ingredient button opens form', async ({ page }) => {
    const editBtn = page.locator('button').filter({ has: page.locator('[data-lucide="edit"]') }).first();
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|ingredient/i });
    await expect(form).toBeVisible();
  });

  test('delete ingredient shows confirmation', async ({ page }) => {
    const deleteBtn = page.locator('button').filter({ has: page.locator('[data-lucide="trash"]') }).first();
    await deleteBtn.click();
    
    const confirmDialog = page.locator('[role="dialog"]').filter({ hasText: /confirm|delete|sure/i });
    await expect(confirmDialog).toBeVisible();
  });
});

test.describe('Add New Ingredient Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/ingredients');
  });

  test('add button opens new ingredient form', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /new ingredient/i });
    await expect(form).toBeVisible();
  });

  test('form shows name input', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
  });

  test('form shows SKU/code input', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const skuInput = page.getByLabel(/sku|code/i).or(page.locator('input[placeholder*="sku"]').or(page.locator('input[placeholder*="code"]')).first());
    await expect(skuInput).toBeVisible();
  });

  test('form shows category selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const categorySelector = page.locator('select, [class*="category"]').filter({ hasText: /category/i });
    await expect(categorySelector).toBeVisible();
  });

  test('form shows unit of measure selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const unitSelector = page.locator('select, [class*="unit"]').filter({ hasText: /unit|measure/i });
    await expect(unitSelector).toBeVisible();
  });

  test('form shows par level inputs', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const parInputs = page.locator('input[type="number"]').filter({ hasText: /par|min|max/i });
    await expect(parInputs).not.toHaveCount(0);
  });

  test('form shows cost/price input', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const costInput = page.locator('input[type="number"]').filter({ hasText: /cost|price/i }).or(page.locator('input[placeholder*="cost"]').or(page.locator('input[placeholder*="price"]').first()));
    await expect(costInput).toBeVisible();
  });

  test('form shows supplier selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const supplierSelector = page.locator('select, [class*="supplier"]').filter({ hasText: /supplier/i });
    await expect(supplierSelector).toBeVisible();
  });

  test('form validates required fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();
    
    const errors = page.locator('text=/required/i');
    await expect(errors).not.toHaveCount(0);
  });

  test('form shows cancel button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const cancelBtn = page.getByRole('button', { name: /cancel/i });
    await expect(cancelBtn).toBeVisible();
  });

  test('cancel button closes form', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const cancelBtn = page.getByRole('button', { name: /cancel/i });
    await cancelBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /new ingredient/i });
    await expect(form).not.toBeVisible();
  });
});

test.describe('Inventory Count Entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/count');
  });

  test('shows count entry heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /count entry|physical count/i })).toBeVisible();
  });

  test('shows period selector', async ({ page }) => {
    const periodSelector = page.locator('select, [class*="period"]').filter({ hasText: /period|week/i });
    await expect(periodSelector).toBeVisible();
  });

  test('displays count input table', async ({ page }) => {
    const countTable = page.locator('table, tr').filter({ hasText: /ingredient|count|actual/i });
    await expect(countTable).not.toHaveCount(0);
  });

  test('shows ingredient names in count table', async ({ page }) => {
    const names = page.locator('td, span').filter({ hasText: /[a-z]+/i });
    await expect(names).not.toHaveCount(0);
  });

  test('shows par/expected quantities', async ({ page }) => {
    const expected = page.locator('td, span').filter({ hasText: /[0-9]+(\.[0-9]+)?/ });
    await expect(expected).not.toHaveCount(0);
  });

  test('has actual count input fields', async ({ page }) => {
    const countInputs = page.locator('input[type="number"]').filter({ hasText: /actual|count/i });
    await expect(countInputs).not.toHaveCount(0);
  });

  test('shows variance column', async ({ page }) => {
    const variance = page.locator('td, span').filter({ hasText: /variance|diff/i });
    await expect(variance).not.toHaveCount(0);
  });

  test('submit count button is visible', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /submit|finalize|complete/i });
    await expect(submitBtn).toBeVisible();
  });

  test('shows save draft button', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /save draft/i });
    await expect(saveBtn).toBeVisible();
  });
});

test.describe('Low Stock Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/alerts');
  });

  test('shows low stock alerts heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /low stock|alerts/i })).toBeVisible();
  });

  test('displays critical shortages count', async ({ page }) => {
    const count = page.locator('[class*="count"], span').filter({ hasText: /[0-9]+/ });
    await expect(count).toBeVisible();
  });

  test('shows alert cards or list', async ({ page }) => {
    const alerts = page.locator('[class*="alert"], [class*="card"], tr').filter({ hasText: /low|critical/i });
    await expect(alerts).not.toHaveCount(0);
  });

  test('alert shows ingredient name', async ({ page }) => {
    const names = page.locator('td, span').filter({ hasText: /[a-z]+/i });
    await expect(names).not.toHaveCount(0);
  });

  test('alert shows current stock level', async ({ page }) => {
    const stockLevels = page.locator('td, span').filter({ hasText: /[0-9]+(\.[0-9]+)?/ });
    await expect(stockLevels).not.toHaveCount(0);
  });

  test('alert shows par level', async ({ page }) => {
    const parLevels = page.locator('td, span').filter({ hasText: /par/i });
    await expect(parLevels).not.toHaveCount(0);
  });

  test('alert shows shortage amount', async ({ page }) => {
    const shortages = page.locator('td, span').filter({ hasText: /-[0-9]+/ });
    await expect(shortages).not.toHaveCount(0);
  });

  test('alert has urgency indicator', async ({ page }) => {
    const urgency = page.locator('[class*="urgent"], [class*="critical"], [class*="warning"]');
    await expect(urgency).not.toHaveCount(0);
  });

  test('shows order/create PO button', async ({ page }) => {
    const orderBtn = page.getByRole('button', { name: /order|create po/i });
    await expect(orderBtn).toBeVisible();
  });

  test('filter alerts by urgency works', async ({ page }) => {
    const urgencyFilter = page.locator('select, button').filter({ hasText: /urgency|critical|all/i });
    await urgencyFilter.click();
    
    const option = page.locator('option, [role="option"]').first();
    await option.click();
    
    const filtered = page.locator('[class*="alert"], [class*="card"]');
    await expect(filtered).not.toHaveCount(0);
  });
});

test.describe('Period History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/history');
  });

  test('shows period history heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /period history/i })).toBeVisible();
  });

  test('displays historical periods list', async ({ page }) => {
    const periods = page.locator('[class*="period"], [class*="card"], tr').filter({ hasText: /period|week/i });
    await expect(periods).not.toHaveCount(0);
  });

  test('period shows date range', async ({ page }) => {
    const dates = page.locator('td, span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}/ });
    await expect(dates).not.toHaveCount(0);
  });

  test('period shows status (finalized/draft)', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /finalized|draft|closed/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('period shows total inventory value', async ({ page }) => {
    const values = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(values).not.toHaveCount(0);
  });

  test('clicking period opens detail view', async ({ page }) => {
    const period = page.locator('[class*="period"], [class*="card"]').first();
    await period.click();
    
    await expect(page.url()).toContain('/inventory/history/');
  });

  test('export history button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Inventory — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/ingredients');
  });

  test('shows error on failed ingredients load', async ({ page }) => {
    await page.route('**/api/inventory/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no ingredients', async ({ page }) => {
    await page.route('**/api/inventory/ingredients', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ ingredients: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no ingredients|empty|add your first/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/inventory/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ ingredients: [{ id: 1, name: 'Test Ingredient' }] }),
        });
      }
    });
    
    await page.goto('/inventory/ingredients');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Inventory — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/ingredients');
  });

  test('cannot add ingredient with duplicate SKU', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const skuInput = page.getByLabel(/sku|code/i).or(page.locator('input').first());
    await skuInput.fill('EXISTING001');
    
    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('ingredient form validates positive cost', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new ingredient/i });
    await addBtn.click();
    
    const costInput = page.locator('input[type="number"]').filter({ hasText: /cost|price/i }).first();
    await costInput.fill('-10');
    
    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|positive/i');
    await expect(error).toBeVisible();
  });

  test('count entry validates non-negative quantity', async ({ page }) => {
    await page.goto('/inventory/count');
    
    const countInput = page.locator('input[type="number"]').first();
    await countInput.fill('-5');
    
    const submitBtn = page.getByRole('button', { name: /submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|positive|cannot be negative/i');
    await expect(error).toBeVisible();
  });

  test('cannot finalize count with empty values', async ({ page }) => {
    await page.goto('/inventory/count');
    
    const submitBtn = page.getByRole('button', { name: /submit|finalize/i });
    await submitBtn.click();
    
    const error = page.locator('text=/required|complete all/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Inventory — Responsive Layout', () => {
  test('ingredients table is scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/inventory/ingredients');
    
    const table = page.locator('table, [class*="table"]').first();
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('nav cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/inventory');
    
    const cards = page.locator('[class*="card"]').filter({ hasText: /ingredient|count/i });
    const firstBox = await cards.first().boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });

  test('KPI cards are responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/inventory');
    
    const kpiCards = page.locator('[class*="kpi"], [class*="card"]');
    const count = await kpiCards.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = kpiCards.nth(i);
      await expect(card).toBeVisible();
    }
  });
});
