import { test, expect } from '@playwright/test';

/**
 * Supplier Portal Module Tests
 * Tests supplier dashboard, RFQs, POs, inventory, and proposals
 * 
 * Source: /features/inventory/pages/Supplier*, /features/auth/SupplierAuthContext.tsx
 */

test.describe('Supplier Portal — Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
  });

  test('shows supplier login heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /supplier|vendor|login/i })).toBeVisible();
  });

  test('displays login form', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]').first());
    await expect(emailInput).toBeVisible();
    
    const passwordInput = page.getByLabel(/password/i).or(page.locator('input[type="password"]').first());
    await expect(passwordInput).toBeVisible();
  });

  test('login button is visible', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /login|sign in/i });
    await expect(loginBtn).toBeVisible();
  });

  test('forgot password link is available', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot|reset/i });
    await expect(forgotLink).toBeVisible();
  });
});

test.describe('Supplier Portal — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
    
    // Mock supplier login
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/supplier/dashboard');
  });

  test('shows supplier dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard|supplier/i })).toBeVisible();
  });

  test('displays pending RFQs count', async ({ page }) => {
    const rfqCount = page.locator('[class*="rfq"], span').filter({ hasText: /[0-9]+\s*rfq/i });
    await expect(rfqCount).toBeVisible();
  });

  test('displays pending POs count', async ({ page }) => {
    const poCount = page.locator('[class*="po"], span').filter({ hasText: /[0-9]+\s*order/i });
    await expect(poCount).toBeVisible();
  });

  test('shows quick action buttons', async ({ page }) => {
    const actions = page.locator('button').filter({ hasText: /view|respond|fulfill/i });
    await expect(actions).not.toHaveCount(0);
  });
});

test.describe('Supplier Portal — RFQs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
    
    // Mock supplier login
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/supplier/rfqs');
  });

  test('shows RFQ list heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /rfq|request for quote/i })).toBeVisible();
  });

  test('displays RFQ cards or list', async ({ page }) => {
    const rfqs = page.locator('[class*="rfq"], [class*="card"]').filter({ hasText: /rfq|quote/i });
    await expect(rfqs).not.toHaveCount(0);
  });

  test('RFQ shows items requested', async ({ page }) => {
    const items = page.locator('[class*="item"], span').filter({ hasText: /item|quantity/i });
    await expect(items).not.toHaveCount(0);
  });

  test('RFQ shows deadline/date', async ({ page }) => {
    const deadlines = page.locator('span').filter({ hasText: /deadline|due|date/i });
    await expect(deadlines).not.toHaveCount(0);
  });

  test('respond to RFQ button is visible', async ({ page }) => {
    const respondBtn = page.getByRole('button', { name: /respond|submit|quote/i });
    await expect(respondBtn).toBeVisible();
  });

  test('clicking respond opens proposal form', async ({ page }) => {
    const respondBtn = page.getByRole('button', { name: /respond/i }).first();
    await respondBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /proposal|quote|price/i });
    await expect(form).toBeVisible();
  });

  test('proposal form shows price input', async ({ page }) => {
    const respondBtn = page.getByRole('button', { name: /respond/i }).first();
    await respondBtn.click();
    
    const priceInput = page.getByLabel(/price/i).or(page.locator('input[type="number"]').first());
    await expect(priceInput).toBeVisible();
  });

  test('proposal form shows delivery date picker', async ({ page }) => {
    const respondBtn = page.getByRole('button', { name: /respond/i }).first();
    await respondBtn.click();
    
    const datePicker = page.locator('input[type="date"]').filter({ hasText: /delivery|date/i });
    await expect(datePicker).toBeVisible();
  });

  test('proposal form shows notes/comments field', async ({ page }) => {
    const respondBtn = page.getByRole('button', { name: /respond/i }).first();
    await respondBtn.click();
    
    const notesField = page.locator('textarea').filter({ hasText: /note|comment/i });
    await expect(notesField).toBeVisible();
  });
});

test.describe('Supplier Portal — Purchase Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
    
    // Mock supplier login
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/supplier/pos');
  });

  test('shows PO list heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /purchase order|po/i })).toBeVisible();
  });

  test('displays PO cards or list', async ({ page }) => {
    const pos = page.locator('[class*="po"], [class*="order"]').filter({ hasText: /po-|order/i });
    await expect(pos).not.toHaveCount(0);
  });

  test('PO shows status badges', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /pending|confirmed|fulfilled/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('PO shows delivery date', async ({ page }) => {
    const dates = page.locator('span').filter({ hasText: /delivery|due|date/i });
    await expect(dates).not.toHaveCount(0);
  });

  test('fulfill PO button is visible', async ({ page }) => {
    const fulfillBtn = page.getByRole('button', { name: /fulfill|confirm|accept/i });
    await expect(fulfillBtn).toBeVisible();
  });

  test('clicking fulfill opens confirmation form', async ({ page }) => {
    const fulfillBtn = page.getByRole('button', { name: /fulfill/i }).first();
    await fulfillBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /confirm|fulfill/i });
    await expect(form).toBeVisible();
  });

  test('PO detail view is accessible', async ({ page }) => {
    const poCard = page.locator('[class*="po"], [class*="card"]').first();
    await poCard.click();
    
    await expect(page.url()).toContain('/supplier/po/');
  });
});

test.describe('Supplier Portal — Inventory View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
    
    // Mock supplier login
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/supplier/inventory');
  });

  test('shows supplier inventory heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inventory|catalog/i })).toBeVisible();
  });

  test('displays catalog items list', async ({ page }) => {
    const items = page.locator('[class*="item"], [class*="catalog"]').filter({ hasText: /item|product/i });
    await expect(items).not.toHaveCount(0);
  });

  test('inventory shows pricing information', async ({ page }) => {
    const prices = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(prices).not.toHaveCount(0);
  });

  test('inventory shows availability status', async ({ page }) => {
    const availability = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /available|in stock/i });
    await expect(availability).not.toHaveCount(0);
  });

  test('update price button is available', async ({ page }) => {
    const updateBtn = page.getByRole('button', { name: /update|edit|price/i });
    await expect(updateBtn).toBeVisible();
  });
});

test.describe('Supplier Portal — Proposals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
    
    // Mock supplier login
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/supplier/proposals');
  });

  test('shows proposals heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /proposal|bid/i })).toBeVisible();
  });

  test('displays submitted proposals list', async ({ page }) => {
    const proposals = page.locator('[class*="proposal"], [class*="card"]').filter({ hasText: /proposal|quote/i });
    await expect(proposals).not.toHaveCount(0);
  });

  test('proposal shows status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /pending|accepted|rejected/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('proposal shows submitted price', async ({ page }) => {
    const prices = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(prices).not.toHaveCount(0);
  });

  test('withdraw proposal button is available', async ({ page }) => {
    const withdrawBtn = page.getByRole('button', { name: /withdraw|cancel/i });
    await expect(withdrawBtn).toBeVisible();
  });
});

test.describe('Supplier Portal — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
  });

  test('shows error on failed login', async ({ page }) => {
    await page.route('**/api/supplier/login', route => {
      route.fulfill({ status: 401 });
    });
    
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    
    const errorBanner = page.locator('text=/error|invalid|failed/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no RFQs', async ({ page }) => {
    // Mock login first
    await page.route('**/api/supplier/login', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ token: 'mock-token' }),
      });
    });
    
    await page.route('**/api/supplier/rfqs', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ rfqs: [] }),
      });
    });
    
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    
    const emptyState = page.locator('text=/no rfq|empty/i');
    await expect(emptyState).toBeVisible();
  });
});

test.describe('Supplier Portal — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/supplier/login');
  });

  test('login fails with invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    
    const error = page.locator('text=/invalid|incorrect|failed/i');
    await expect(error).toBeVisible();
  });

  test('proposal form validates price is positive', async ({ page }) => {
    // Mock login
    await page.route('**/api/supplier/*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] }),
      });
    });
    
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/supplier/rfqs');
    
    const respondBtn = page.getByRole('button', { name: /respond/i }).first();
    await respondBtn.click();
    
    const priceInput = page.getByLabel(/price/i).or(page.locator('input[type="number"]').first());
    await priceInput.fill('-100');
    
    const submitBtn = page.getByRole('button', { name: /submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|positive/i');
    await expect(error).toBeVisible();
  });

  test('cannot fulfill PO past delivery date', async ({ page }) => {
    await page.goto('/supplier/login');
    
    await page.getByLabel(/email/i).fill('supplier@test.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/supplier/pos');
    
    const fulfillBtn = page.getByRole('button', { name: /fulfill/i }).first();
    await fulfillBtn.click();
    
    // Try to set past delivery date
    const datePicker = page.locator('input[type="date"]').first();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await datePicker.fill(pastDate.toISOString().split('T')[0]);
    
    const submitBtn = page.getByRole('button', { name: /confirm|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|past|future/i');
    await expect(error).toBeVisible();
  });
});
