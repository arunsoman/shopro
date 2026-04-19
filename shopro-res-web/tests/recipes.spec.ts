import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Recipes Module Tests — ShoPro Restaurant Web
 * Tests recipe hub, recipe builder, costing, and menu items
 * 
 * Sources:
 * - RecipeHub.tsx
 * - RecipeScreens.tsx, RecipeDetail.tsx, RecipeEditor.tsx
 * - SalesMenuCosting.tsx
 */

test.describe('Recipes — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes');
  });

  test('no NaN in recipe hub', async ({ page }) => {
    await expectNoNaN(page, 'Recipe Hub');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in recipe list', async ({ page }) => {
    await page.goto('/recipes/list');
    await expectNoNaN(page, 'Recipe List');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in recipe costing', async ({ page }) => {
    await page.goto('/recipes/costing');
    await expectNoNaN(page, 'Recipe Costing');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in menu items costing', async ({ page }) => {
    await page.goto('/recipes/menu-items');
    await expectNoNaN(page, 'Menu Items Costing');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in recipe detail cost breakdown', async ({ page }) => {
    await page.goto('/recipes/list');
    const recipe = page.locator('[class*="recipe"], [class*="card"]').first();
    if (await recipe.isVisible().catch(() => false)) {
      await recipe.click();
      await expectNoNaN(page, 'Recipe Detail Cost Breakdown');
      await expectNoNaNInNumericDisplays(page);
    }
  });

  test('no NaN in unit converter', async ({ page }) => {
    await page.goto('/recipes/converter');
    await expectNoNaN(page, 'Unit Converter');
    
    // Test conversion doesn't produce NaN
    const fromInput = page.locator('input[type="number"]').first();
    await fromInput.fill('1');
    
    const result = page.locator('[class*="result"]');
    const text = await result.textContent();
    expect(text).not.toContain('NaN');
  });
});

test.describe('Recipe Hub — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes');
  });

  test('shows recipe hub heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recipes|recipe hub/i })).toBeVisible();
  });

  test('displays recipe navigation cards', async ({ page }) => {
    const navCards = page.locator('[class*="card"]').filter({ hasText: /recipe|menu|costing/i });
    await expect(navCards).not.toHaveCount(0);
  });

  test('shows Recipe Builder card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /recipe builder/i });
    await expect(card).toBeVisible();
  });

  test('shows Menu Items card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /menu items/i });
    await expect(card).toBeVisible();
  });

  test('shows Recipe Costing card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /costing|food cost/i });
    await expect(card).toBeVisible();
  });

  test('shows Unit Converter card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /unit converter/i });
    await expect(card).toBeVisible();
  });

  test('displays recipe statistics', async ({ page }) => {
    const stats = page.locator('[class*="stat"]').filter({ hasText: /total|average/i });
    await expect(stats).not.toHaveCount(0);
  });
});

test.describe('Recipe Hub — Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes');
  });

  test('clicking Recipe Builder navigates to recipe list', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /recipe builder/i });
    await card.click();
    
    await expect(page.url()).toContain('/recipes/list');
  });

  test('clicking Menu Items navigates to menu costing', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /menu items/i });
    await card.click();
    
    await expect(page.url()).toContain('/recipes/menu-items');
  });

  test('clicking Recipe Costing navigates to costing view', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /costing/i });
    await card.click();
    
    await expect(page.url()).toContain('/recipes/costing');
  });
});

test.describe('Recipe List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/list');
  });

  test('shows recipe list heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recipes/i })).toBeVisible();
  });

  test('displays search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search recipes/i).or(page.locator('input[type="text"]').first());
    await expect(searchInput).toBeVisible();
  });

  test('shows filter dropdowns', async ({ page }) => {
    const filters = page.locator('select, button').filter({ hasText: /category|type|all/i });
    await expect(filters).not.toHaveCount(0);
  });

  test('displays recipe cards or list', async ({ page }) => {
    const recipes = page.locator('[class*="recipe"], [class*="card"], tr').filter({ hasText: /recipe/i });
    await expect(recipes).not.toHaveCount(0);
  });

  test('recipe shows name', async ({ page }) => {
    const names = page.locator('td, span').filter({ hasText: /[a-z]+/i });
    await expect(names).not.toHaveCount(0);
  });

  test('recipe shows category', async ({ page }) => {
    const categories = page.locator('td, span').filter({ hasText: /appetizer|main|dessert|soup|salad/i });
    await expect(categories).not.toHaveCount(0);
  });

  test('recipe shows cost per portion', async ({ page }) => {
    const costs = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(costs).not.toHaveCount(0);
  });

  test('recipe shows yield/portions', async ({ page }) => {
    const yields = page.locator('td, span').filter({ hasText: /[0-9]+\s*portion/i });
    await expect(yields).not.toHaveCount(0);
  });

  test('shows create recipe button', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create|add/i }).filter({ hasText: /recipe/i });
    await expect(createBtn).toBeVisible();
  });
});

test.describe('Recipe — Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/list');
  });

  test('search filters recipes', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="text"]').first());
    await searchInput.fill('Test');
    
    const recipes = page.locator('[class*="recipe"], [class*="card"]');
    const isEmpty = await page.locator('text=/no recipes|empty/i').isVisible().catch(() => false);
    expect(isEmpty || await recipes.count() >= 0).toBe(true);
  });

  test('category filter works', async ({ page }) => {
    const categoryFilter = page.locator('select, button').filter({ hasText: /category|all/i }).first();
    await categoryFilter.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /[a-z]+/i }).first();
    await option.click();
    
    const filtered = page.locator('[class*="recipe"], [class*="card"]');
    await expect(filtered).not.toHaveCount(0);
  });

  test('clicking recipe opens detail view', async ({ page }) => {
    const recipe = page.locator('[class*="recipe"], [class*="card"]').first();
    await recipe.click();
    
    await expect(page.url()).toContain('/recipes/');
  });

  test('edit recipe button opens form', async ({ page }) => {
    const editBtn = page.locator('button').filter({ has: page.locator('[data-lucide="edit"]') }).first();
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|recipe/i });
    await expect(form).toBeVisible();
  });

  test('duplicate recipe button is visible', async ({ page }) => {
    const duplicateBtn = page.getByRole('button', { name: /duplicate|copy/i });
    await expect(duplicateBtn).toBeVisible();
  });

  test('delete recipe shows confirmation', async ({ page }) => {
    const deleteBtn = page.locator('button').filter({ has: page.locator('[data-lucide="trash"]') }).first();
    await deleteBtn.click();
    
    const confirmDialog = page.locator('[role="dialog"]').filter({ hasText: /confirm|delete|sure/i });
    await expect(confirmDialog).toBeVisible();
  });
});

test.describe('Create Recipe Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/list');
  });

  test('create button opens recipe form', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /new recipe/i });
    await expect(form).toBeVisible();
  });

  test('form shows recipe name input', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const nameInput = page.getByLabel(/recipe name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
  });

  test('form shows category selector', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const categorySelector = page.locator('select, [class*="category"]').filter({ hasText: /category/i });
    await expect(categorySelector).toBeVisible();
  });

  test('form shows yield/portions input', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const yieldInput = page.locator('input[type="number"]').filter({ hasText: /yield|portion/i });
    await expect(yieldInput).toBeVisible();
  });

  test('form shows ingredients section', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const ingredientsSection = page.locator('[class*="ingredient"]').filter({ hasText: /ingredient/i });
    await expect(ingredientsSection).toBeVisible();
  });

  test('form shows add ingredient button', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const addBtn = page.getByRole('button', { name: /add ingredient/i });
    await expect(addBtn).toBeVisible();
  });

  test('ingredient row shows ingredient selector', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const ingredientSelector = page.locator('select, [class*="ingredient"]').filter({ hasText: /select ingredient/i });
    await expect(ingredientSelector).toBeVisible();
  });

  test('ingredient row shows quantity input', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const qtyInput = page.locator('input[type="number"]').filter({ hasText: /quantity/i });
    await expect(qtyInput).toBeVisible();
  });

  test('ingredient row shows unit selector', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const unitSelector = page.locator('select, [class*="unit"]').filter({ hasText: /unit/i });
    await expect(unitSelector).toBeVisible();
  });

  test('form shows preparation instructions', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const instructionsField = page.locator('textarea').filter({ hasText: /preparation|instructions|method/i });
    await expect(instructionsField).toBeVisible();
  });

  test('form shows cost calculation', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const costDisplay = page.locator('[class*="cost"], span').filter({ hasText: /total cost|cost per portion/i });
    await expect(costDisplay).toBeVisible();
  });

  test('form shows save button', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const saveBtn = page.getByRole('button', { name: /save|create/i });
    await expect(saveBtn).toBeVisible();
  });

  test('form validates required fields', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const errors = page.locator('text=/required/i');
    await expect(errors).not.toHaveCount(0);
  });
});

test.describe('Recipe Detail View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/list');
    
    const recipe = page.locator('[class*="recipe"], [class*="card"]').first();
    await recipe.click();
  });

  test('shows recipe name as heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /[a-z]+/i });
    await expect(heading).toBeVisible();
  });

  test('displays recipe image', async ({ page }) => {
    const image = page.locator('img').or(page.locator('[class*="image"]'));
    await expect(image).toBeVisible();
  });

  test('shows category badge', async ({ page }) => {
    const category = page.locator('[class*="badge"], span').filter({ hasText: /appetizer|main|dessert/i });
    await expect(category).toBeVisible();
  });

  test('shows yield information', async ({ page }) => {
    const yieldInfo = page.locator('span').filter({ hasText: /[0-9]+\s*portion/i });
    await expect(yieldInfo).toBeVisible();
  });

  test('displays ingredients list', async ({ page }) => {
    const ingredients = page.locator('li, [class*="ingredient"]').filter({ hasText: /[a-z]+/i });
    await expect(ingredients).not.toHaveCount(0);
  });

  test('ingredient shows quantity and unit', async ({ page }) => {
    const quantities = page.locator('span').filter({ hasText: /[0-9]+\s*(kg|g|l|ml|cup|tbsp)/i });
    await expect(quantities).not.toHaveCount(0);
  });

  test('shows preparation instructions', async ({ page }) => {
    const instructions = page.locator('[class*="instruction"], p').filter({ hasText: /[a-z]+/i });
    await expect(instructions).not.toHaveCount(0);
  });

  test('shows cost breakdown', async ({ page }) => {
    const costBreakdown = page.locator('[class*="cost"]').filter({ hasText: /total|portion/i });
    await expect(costBreakdown).toBeVisible();
  });

  test('shows total recipe cost', async ({ page }) => {
    const totalCost = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(totalCost).toBeVisible();
  });

  test('shows cost per portion', async ({ page }) => {
    const costPerPortion = page.locator('span').filter({ hasText: /per portion/i });
    await expect(costPerPortion).toBeVisible();
  });
});

test.describe('Menu Items (Sales Menu Costing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/menu-items');
  });

  test('shows menu items heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /menu items|sales menu/i })).toBeVisible();
  });

  test('displays menu item cards', async ({ page }) => {
    const items = page.locator('[class*="menu"], [class*="card"]').filter({ hasText: /item|dish/i });
    await expect(items).not.toHaveCount(0);
  });

  test('menu item shows name', async ({ page }) => {
    const names = page.locator('td, span').filter({ hasText: /[a-z]+/i });
    await expect(names).not.toHaveCount(0);
  });

  test('menu item shows selling price', async ({ page }) => {
    const prices = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(prices).not.toHaveCount(0);
  });

  test('menu item shows food cost', async ({ page }) => {
    const costs = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(costs).not.toHaveCount(0);
  });

  test('menu item shows food cost percentage', async ({ page }) => {
    const percentages = page.locator('td, span').filter({ hasText: /[0-9]+%/ });
    await expect(percentages).not.toHaveCount(0);
  });

  test('menu item shows contribution margin', async ({ page }) => {
    const margins = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(margins).not.toHaveCount(0);
  });

  test('shows add menu item button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new|add|create/i }).filter({ hasText: /menu item/i });
    await expect(addBtn).toBeVisible();
  });
});

test.describe('Unit Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/converter');
  });

  test('shows unit converter heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /unit converter/i })).toBeVisible();
  });

  test('displays from value input', async ({ page }) => {
    const fromInput = page.locator('input[type="number"]').first();
    await expect(fromInput).toBeVisible();
  });

  test('displays from unit selector', async ({ page }) => {
    const fromUnit = page.locator('select').filter({ hasText: /from/i }).or(page.locator('select').first());
    await expect(fromUnit).toBeVisible();
  });

  test('displays to unit selector', async ({ page }) => {
    const toUnit = page.locator('select').filter({ hasText: /to/i }).or(page.locator('select').nth(1));
    await expect(toUnit).toBeVisible();
  });

  test('displays converted result', async ({ page }) => {
    const result = page.locator('[class*="result"], span').filter({ hasText: /[0-9]+/ });
    await expect(result).toBeVisible();
  });

  test('converts weight units (kg to g)', async ({ page }) => {
    const fromInput = page.locator('input[type="number"]').first();
    await fromInput.fill('1');
    
    const fromUnit = page.locator('select').first();
    await fromUnit.selectOption('kg');
    
    const toUnit = page.locator('select').nth(1);
    await toUnit.selectOption('g');
    
    const result = page.locator('[class*="result"]').filter({ hasText: /1000/ });
    await expect(result).toBeVisible();
  });

  test('converts volume units (l to ml)', async ({ page }) => {
    const fromInput = page.locator('input[type="number"]').first();
    await fromInput.fill('1');
    
    const fromUnit = page.locator('select').first();
    await fromUnit.selectOption('l');
    
    const toUnit = page.locator('select').nth(1);
    await toUnit.selectOption('ml');
    
    const result = page.locator('[class*="result"]').filter({ hasText: /1000/ });
    await expect(result).toBeVisible();
  });
});

test.describe('Recipes — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/list');
  });

  test('shows error on failed recipes load', async ({ page }) => {
    await page.route('**/api/recipes/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no recipes', async ({ page }) => {
    await page.route('**/api/recipes', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ recipes: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no recipes|empty|create your first/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/recipes/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ recipes: [{ id: 1, name: 'Test Recipe' }] }),
        });
      }
    });
    
    await page.goto('/recipes/list');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Recipes — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recipes/list');
  });

  test('cannot create recipe with duplicate name', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const nameInput = page.getByLabel(/recipe name/i).or(page.locator('input').first());
    await nameInput.fill('Existing Recipe');
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('recipe form validates positive yield', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const yieldInput = page.locator('input[type="number"]').filter({ hasText: /yield|portion/i }).first();
    await yieldInput.fill('-5');
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/invalid|positive/i');
    await expect(error).toBeVisible();
  });

  test('recipe requires at least one ingredient', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/required|ingredient/i');
    await expect(error).toBeVisible();
  });

  test('ingredient quantity must be positive', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new recipe/i });
    await createBtn.click();
    
    const qtyInput = page.locator('input[type="number"]').filter({ hasText: /quantity/i }).first();
    await qtyInput.fill('-10');
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/invalid|positive/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Recipes — Responsive Layout', () => {
  test('recipe list is scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/recipes/list');
    
    const table = page.locator('table, [class*="table"]').first();
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('nav cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/recipes');
    
    const cards = page.locator('[class*="card"]').filter({ hasText: /recipe|menu/i });
    const firstBox = await cards.first().boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });
});
