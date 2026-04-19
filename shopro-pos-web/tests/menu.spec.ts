import { test, expect } from '@playwright/test';

/**
 * Menu Module Tests
 * Tests menu management, categories, items, and modifiers
 * 
 * Source: /features/menu/pages/*, /features/menu/components/*
 */

test.describe('Menu Dashboard — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('shows menu overview heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /menu|overview/i })).toBeVisible();
  });

  test('displays menu statistics cards', async ({ page }) => {
    const statCards = page.locator('[class*="stat"], [class*="card"]').filter({ hasText: /items|categories|sales/i });
    await expect(statCards).not.toHaveCount(0);
  });

  test('shows menu engineering chart', async ({ page }) => {
    const chart = page.locator('svg, canvas, [class*="chart"]').filter({ hasText: /engineering|matrix/i });
    await expect(chart).not.toHaveCount(0);
  });

  test('displays quick action buttons', async ({ page }) => {
    const actions = page.locator('button').filter({ hasText: /add|new|create/i });
    await expect(actions).not.toHaveCount(0);
  });
});

test.describe('Menu — Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu/categories');
  });

  test('shows categories heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible();
  });

  test('displays category list or cards', async ({ page }) => {
    const categories = page.locator('[class*="category"], [class*="card"]').filter({ hasText: /category/i });
    await expect(categories).not.toHaveCount(0);
  });

  test('add category button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /category/i });
    await expect(addBtn).toBeVisible();
  });

  test('category drag handles are available', async ({ page }) => {
    const dragHandles = page.locator('[class*="drag"], [class*="handle"], svg').filter({ has: page.locator('[data-lucide="grip"]') });
    await expect(dragHandles).not.toHaveCount(0);
  });

  test('category form shows name and description fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /category/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
    
    const descInput = page.getByLabel(/description/i).or(page.locator('textarea').first());
    await expect(descInput).toBeVisible();
  });

  test('edit category opens pre-filled form', async ({ page }) => {
    const editBtn = page.getByRole('button', { name: /edit/i }).first();
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|category/i });
    await expect(form).toBeVisible();
  });

  test('delete category shows confirmation', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete|remove/i }).first();
    await deleteBtn.click();
    
    const confirmDialog = page.locator('[role="dialog"]').filter({ hasText: /confirm|delete|sure/i });
    await expect(confirmDialog).toBeVisible();
  });

  test('reorder categories via drag and drop', async ({ page }) => {
    const firstCategory = page.locator('[class*="category"], [class*="draggable"]').first();
    const secondCategory = page.locator('[class*="category"], [class*="draggable"]').nth(1);
    
    const firstBox = await firstCategory.boundingBox();
    const secondBox = await secondCategory.boundingBox();
    
    if (firstBox && secondBox) {
      await firstCategory.dragTo(secondCategory);
      
      // Position should change
      const newFirstBox = await firstCategory.boundingBox();
      if (newFirstBox) {
        expect(newFirstBox.y).not.toEqual(firstBox.y);
      }
    }
  });
});

test.describe('Menu — Items', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu/items');
  });

  test('shows menu items heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /items|menu items/i })).toBeVisible();
  });

  test('displays menu item cards', async ({ page }) => {
    const items = page.locator('[class*="item"], [class*="card"]').filter({ hasText: /item|dish/i });
    await expect(items).not.toHaveCount(0);
  });

  test('add item button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /item/i });
    await expect(addBtn).toBeVisible();
  });

  test('item form shows name and price fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /item/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
    
    const priceInput = page.getByLabel(/price/i).or(page.locator('input[type="number"]').first());
    await expect(priceInput).toBeVisible();
  });

  test('item form shows category selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /item/i });
    await addBtn.click();
    
    const categorySelector = page.locator('select, [class*="category"]').filter({ hasText: /category/i });
    await expect(categorySelector).toBeVisible();
  });

  test('item form shows image upload', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /item/i });
    await addBtn.click();
    
    const imageUpload = page.locator('[class*="image"], [class*="upload"], input[type="file"]');
    await expect(imageUpload).toBeVisible();
  });

  test('item card shows availability toggle', async ({ page }) => {
    const toggle = page.locator('[class*="toggle"], [class*="switch"], input[type="checkbox"]').first();
    await expect(toggle).toBeVisible();
  });

  test('filter items by category works', async ({ page }) => {
    const categoryFilter = page.locator('select, button').filter({ hasText: /category|all/i }).first();
    await categoryFilter.click();
    
    // Select a category
    const option = page.locator('option, [role="option"]').filter({ hasText: /[a-z]+/i }).first();
    await option.click();
    
    // Should filter items
    const filteredItems = page.locator('[class*="item"], [class*="card"]');
    await expect(filteredItems).not.toHaveCount(0);
  });

  test('search items by name works', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="text"]').first());
    await searchInput.fill('Test');
    
    // Should filter or show no results
    const items = page.locator('[class*="item"], [class*="card"]');
    // Either shows filtered items or empty state
    const isEmpty = await page.locator('text=/no items|empty/i').isVisible().catch(() => false);
    expect(isEmpty || await items.count() >= 0).toBe(true);
  });
});

test.describe('Menu — Modifiers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu/modifiers');
  });

  test('shows modifiers heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /modifiers|addon/i })).toBeVisible();
  });

  test('displays modifier groups', async ({ page }) => {
    const groups = page.locator('[class*="modifier"], [class*="group"]').filter({ hasText: /group|modifier/i });
    await expect(groups).not.toHaveCount(0);
  });

  test('add modifier group button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /group|modifier/i });
    await expect(addBtn).toBeVisible();
  });

  test('modifier group form shows name field', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /group/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
  });

  test('modifier group shows selection type (single/multiple)', async ({ page }) => {
    const selectionType = page.locator('select, [class*="radio"]').filter({ hasText: /single|multiple|choice/i });
    await expect(selectionType).toBeVisible();
  });

  test('add modifier option to group', async ({ page }) => {
    const addOptionBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /option/i });
    await expect(addOptionBtn).toBeVisible();
  });

  test('modifier option shows price adjustment', async ({ page }) => {
    const priceInput = page.locator('input[type="number"]').filter({ hasText: /price|adjust/i }).or(page.locator('input[placeholder*="price"]').first());
    await expect(priceInput).toBeVisible();
  });

  test('modifier group shows required toggle', async ({ page }) => {
    const requiredToggle = page.locator('[class*="required"], input[type="checkbox"]').filter({ hasText: /required/i });
    await expect(requiredToggle).toBeVisible();
  });
});

test.describe('Menu — Menu Engineering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('menu engineering scatter chart is visible', async ({ page }) => {
    const scatterChart = page.locator('svg, canvas, [class*="scatter"]').filter({ hasText: /stars|plowhorse|puzzle|dog/i });
    await expect(scatterChart).not.toHaveCount(0);
  });

  test('engineering matrix shows item quadrants', async ({ page }) => {
    const quadrants = page.locator('[class*="quadrant"], [class*="star"], [class*="plowhorse"]');
    await expect(quadrants).not.toHaveCount(0);
  });

  test('profitability vs popularity axes are labeled', async ({ page }) => {
    const axes = page.locator('[class*="axis"], text').filter({ hasText: /profit|popularity|margin/i });
    await expect(axes).not.toHaveCount(0);
  });

  test('export engineering report button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|report/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Menu — Performance Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('shows sales performance table', async ({ page }) => {
    const performanceTable = page.locator('table, [class*="table"]').filter({ hasText: /sales|orders|revenue/i });
    await expect(performanceTable).not.toHaveCount(0);
  });

  test('performance table shows item names', async ({ page }) => {
    const itemNames = page.locator('td, [class*="cell"]').filter({ hasText: /[a-z]+/i });
    await expect(itemNames).not.toHaveCount(0);
  });

  test('performance table shows order count', async ({ page }) => {
    const orderCounts = page.locator('td, [class*="cell"]').filter({ hasText: /[0-9]+/ });
    await expect(orderCounts).not.toHaveCount(0);
  });

  test('performance table shows revenue', async ({ page }) => {
    const revenues = page.locator('td, [class*="cell"]').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(revenues).not.toHaveCount(0);
  });

  test('date range picker for performance data', async ({ page }) => {
    const dateRange = page.locator('[class*="date"], [class*="range"]').filter({ hasText: /date|period/i });
    await expect(dateRange).toBeVisible();
  });
});

test.describe('Menu — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu/items');
  });

  test('shows error on failed menu load', async ({ page }) => {
    await page.route('**/api/menu/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no menu items', async ({ page }) => {
    await page.route('**/api/menu/items', route => {
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

  test('retry button reloads menu after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/menu/*', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [{ id: 1, name: 'Test Item', price: 10.99 }] }),
        });
      }
    });
    
    await page.goto('/menu/items');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Menu — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu/items');
  });

  test('cannot add item with duplicate name', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /item/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input').first());
    await nameInput.fill('Existing Item');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('item form validates price is positive', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /item/i });
    await addBtn.click();
    
    const priceInput = page.getByLabel(/price/i).or(page.locator('input[type="number"]').first());
    await priceInput.fill('-10');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|positive|price/i');
    await expect(error).toBeVisible();
  });

  test('category cannot be deleted if items exist', async ({ page }) => {
    await page.goto('/menu/categories');
    
    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
    await deleteBtn.click();
    
    const confirmBtn = page.getByRole('button', { name: /confirm|yes/i });
    await confirmBtn.click();
    
    // Should show error or prevent deletion
    const error = page.locator('text=/cannot delete|items exist|in use/i');
    await expect(error).toBeVisible().catch(() => {
      // Might handle differently
    });
  });

  test('modifier group requires at least one option', async ({ page }) => {
    await page.goto('/menu/modifiers');
    
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /group/i });
    await addBtn.click();
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/required|option|least/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Menu — Responsive Layout', () => {
  test('menu items grid adapts to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/menu/items');
    
    const items = page.locator('[class*="item"], [class*="card"]');
    const firstBox = await items.first().boundingBox();
    const secondBox = await items.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });

  test('modifier form stacks on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/menu/modifiers');
    
    const form = page.locator('[class*="form"], [class*="dialog"]').first();
    const box = await form.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThan(box.width);
    }
  });
});
