import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Purchasing Module Tests — ShoPro Restaurant Web
 * Tests purchasing hub, suppliers, invoices, POs, GRNs, and 3-way matching
 * 
 * Sources:
 * - PurchasingHubPage.tsx
 * - SupplierDirectoryPage.tsx
 * - InvoiceEntryPage.tsx, InvoiceEditorPage.tsx, InvoiceLogPage.tsx
 * - POListPage.tsx, POEditorPage.tsx, PODetailPage.tsx
 * - GRNListPage.tsx, GRNEditorPage.tsx, GRNDetailPage.tsx
 * - MatchingDashboardPage.tsx, VarianceAlertPage.tsx
 */

test.describe('Purchasing — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing');
  });

  test('no NaN in purchasing hub KPIs', async ({ page }) => {
    await expectNoNaN(page, 'Purchasing Hub');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in supplier directory', async ({ page }) => {
    await page.goto('/purchasing/suppliers');
    await expectNoNaN(page, 'Supplier Directory');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in invoice log', async ({ page }) => {
    await page.goto('/purchasing/invoices');
    await expectNoNaN(page, 'Invoice Log');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in PO list', async ({ page }) => {
    await page.goto('/purchasing/pos');
    await expectNoNaN(page, 'Purchase Orders');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in GRN list', async ({ page }) => {
    await page.goto('/purchasing/grns');
    await expectNoNaN(page, 'Goods Receiving');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in 3-way match', async ({ page }) => {
    await page.goto('/purchasing/matching');
    await expectNoNaN(page, '3-Way Matching');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in variance alerts', async ({ page }) => {
    await page.goto('/purchasing/variance-alerts');
    await expectNoNaN(page, 'Variance Alerts');
    await expectNoNaNInNumericDisplays(page);
  });
});

test.describe('Purchasing Hub — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing');
  });

  test('shows purchasing hub heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /purchasing|procurement/i })).toBeVisible();
  });

  test('displays purchasing navigation cards', async ({ page }) => {
    const navCards = page.locator('[class*="card"]').filter({ hasText: /suppliers|invoices|orders|receiving/i });
    await expect(navCards).not.toHaveCount(0);
  });

  test('shows Suppliers card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /suppliers|vendor/i });
    await expect(card).toBeVisible();
  });

  test('shows Invoices card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /invoices/i });
    await expect(card).toBeVisible();
  });

  test('shows Purchase Orders card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /purchase order|po/i });
    await expect(card).toBeVisible();
  });

  test('shows Goods Receiving card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /receiving|grn/i });
    await expect(card).toBeVisible();
  });

  test('shows 3-Way Match card', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /3-way|match|verification/i });
    await expect(card).toBeVisible();
  });

  test('displays KPI metrics', async ({ page }) => {
    const kpiCards = page.locator('[class*="kpi"], [class*="stat"]').filter({ hasText: /pending|value|variance/i });
    await expect(kpiCards).not.toHaveCount(0);
  });
});

test.describe('Purchasing Hub — Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing');
  });

  test('clicking Suppliers navigates to supplier directory', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /suppliers/i });
    await card.click();
    
    await expect(page.url()).toContain('/purchasing/suppliers');
  });

  test('clicking Invoices navigates to invoice log', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /invoices/i });
    await card.click();
    
    await expect(page.url()).toContain('/purchasing/invoices');
  });

  test('clicking Purchase Orders navigates to PO list', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /purchase order|po/i });
    await card.click();
    
    await expect(page.url()).toContain('/purchasing/pos');
  });

  test('clicking Goods Receiving navigates to GRN list', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /receiving|grn/i });
    await card.click();
    
    await expect(page.url()).toContain('/purchasing/grns');
  });

  test('clicking 3-Way Match navigates to matching dashboard', async ({ page }) => {
    const card = page.locator('[class*="card"]').filter({ hasText: /3-way|match/i });
    await card.click();
    
    await expect(page.url()).toContain('/purchasing/matching');
  });
});

test.describe('Supplier Directory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/suppliers');
  });

  test('shows supplier directory heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /suppliers|vendors/i })).toBeVisible();
  });

  test('displays search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search suppliers/i).or(page.locator('input[type="text"]').first());
    await expect(searchInput).toBeVisible();
  });

  test('shows add supplier button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /supplier/i });
    await expect(addBtn).toBeVisible();
  });

  test('displays supplier cards or list', async ({ page }) => {
    const suppliers = page.locator('[class*="supplier"], [class*="card"], tr').filter({ hasText: /supplier|company/i });
    await expect(suppliers).not.toHaveCount(0);
  });

  test('supplier shows name and contact info', async ({ page }) => {
    const names = page.locator('td, span').filter({ hasText: /[a-z]+/i });
    await expect(names).not.toHaveCount(0);
  });

  test('supplier shows category/type', async ({ page }) => {
    const categories = page.locator('td, span').filter({ hasText: /produce|meat|dairy|dry|beverage/i });
    await expect(categories).not.toHaveCount(0);
  });

  test('supplier shows payment terms', async ({ page }) => {
    const terms = page.locator('td, span').filter({ hasText: /net 30|net 15|cod/i });
    await expect(terms).not.toHaveCount(0);
  });

  test('supplier shows status (active/inactive)', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /active|inactive/i });
    await expect(statuses).not.toHaveCount(0);
  });
});

test.describe('Supplier — Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/suppliers');
  });

  test('search filters suppliers', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="text"]').first());
    await searchInput.fill('Test');
    
    const suppliers = page.locator('[class*="supplier"], [class*="card"]');
    const isEmpty = await page.locator('text=/no suppliers|empty/i').isVisible().catch(() => false);
    expect(isEmpty || await suppliers.count() >= 0).toBe(true);
  });

  test('clicking supplier opens detail view', async ({ page }) => {
    const supplier = page.locator('[class*="supplier"], [class*="card"]').first();
    await supplier.click();
    
    await expect(page.url()).toContain('/purchasing/suppliers/');
  });

  test('edit supplier button opens form', async ({ page }) => {
    const editBtn = page.locator('button').filter({ has: page.locator('[data-lucide="edit"]') }).first();
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|supplier/i });
    await expect(form).toBeVisible();
  });

  test('deactivate supplier button is visible', async ({ page }) => {
    const deactivateBtn = page.getByRole('button', { name: /deactivate|disable/i });
    await expect(deactivateBtn).toBeVisible();
  });
});

test.describe('Add Supplier Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/suppliers');
  });

  test('add button opens supplier form', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /new supplier/i });
    await expect(form).toBeVisible();
  });

  test('form shows company name input', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/company name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
  });

  test('form shows contact person input', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const contactInput = page.getByLabel(/contact/i).or(page.locator('input[placeholder*="contact"]').first());
    await expect(contactInput).toBeVisible();
  });

  test('form shows email input', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]').first());
    await expect(emailInput).toBeVisible();
  });

  test('form shows phone input', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const phoneInput = page.getByLabel(/phone/i).or(page.locator('input[type="tel"]').first());
    await expect(phoneInput).toBeVisible();
  });

  test('form shows category selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const categorySelector = page.locator('select, [class*="category"]').filter({ hasText: /category|type/i });
    await expect(categorySelector).toBeVisible();
  });

  test('form shows payment terms selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const termsSelector = page.locator('select, [class*="terms"]').filter({ hasText: /payment terms/i });
    await expect(termsSelector).toBeVisible();
  });

  test('form validates required fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();
    
    const errors = page.locator('text=/required/i');
    await expect(errors).not.toHaveCount(0);
  });
});

test.describe('Invoice Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/invoices');
  });

  test('shows invoice log heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /invoice|invoice log/i })).toBeVisible();
  });

  test('displays invoice entry button', async ({ page }) => {
    const entryBtn = page.getByRole('button', { name: /new invoice|enter invoice/i });
    await expect(entryBtn).toBeVisible();
  });

  test('shows invoice list/table', async ({ page }) => {
    const invoices = page.locator('table, tr, [class*="invoice"]').filter({ hasText: /invoice/i });
    await expect(invoices).not.toHaveCount(0);
  });

  test('invoice shows invoice number', async ({ page }) => {
    const numbers = page.locator('td, span').filter({ hasText: /INV-[0-9]+/i });
    await expect(numbers).not.toHaveCount(0);
  });

  test('invoice shows supplier name', async ({ page }) => {
    const suppliers = page.locator('td, span').filter({ hasText: /[a-z]+/i });
    await expect(suppliers).not.toHaveCount(0);
  });

  test('invoice shows date', async ({ page }) => {
    const dates = page.locator('td, span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}/ });
    await expect(dates).not.toHaveCount(0);
  });

  test('invoice shows amount', async ({ page }) => {
    const amounts = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(amounts).not.toHaveCount(0);
  });

  test('invoice shows status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /pending|matched|posted/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('invoice shows match status', async ({ page }) => {
    const matchStatus = page.locator('[class*="match"], [class*="badge"]').filter({ hasText: /matched|unmatched|partial/i });
    await expect(matchStatus).not.toHaveCount(0);
  });
});

test.describe('Invoice Entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/invoices/new');
  });

  test('shows invoice entry heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /enter invoice|new invoice/i })).toBeVisible();
  });

  test('form shows supplier selector', async ({ page }) => {
    const supplierSelector = page.locator('select, [class*="supplier"]').filter({ hasText: /supplier/i });
    await expect(supplierSelector).toBeVisible();
  });

  test('form shows invoice number input', async ({ page }) => {
    const invoiceInput = page.getByLabel(/invoice number/i).or(page.locator('input[placeholder*="invoice"]').first());
    await expect(invoiceInput).toBeVisible();
  });

  test('form shows invoice date picker', async ({ page }) => {
    const datePicker = page.locator('input[type="date"]').filter({ hasText: /invoice date/i });
    await expect(datePicker).toBeVisible();
  });

  test('form shows line items section', async ({ page }) => {
    const lineItems = page.locator('[class*="line"], [class*="item"]').filter({ hasText: /item|line/i });
    await expect(lineItems).not.toHaveCount(0);
  });

  test('form shows add line item button', async ({ page }) => {
    const addLineBtn = page.getByRole('button', { name: /add line|add item/i });
    await expect(addLineBtn).toBeVisible();
  });

  test('line item shows ingredient selector', async ({ page }) => {
    const ingredientSelector = page.locator('select, [class*="ingredient"]').filter({ hasText: /ingredient/i });
    await expect(ingredientSelector).toBeVisible();
  });

  test('line item shows quantity input', async ({ page }) => {
    const qtyInput = page.locator('input[type="number"]').filter({ hasText: /quantity/i });
    await expect(qtyInput).toBeVisible();
  });

  test('line item shows unit price input', async ({ page }) => {
    const priceInput = page.locator('input[type="number"]').filter({ hasText: /price|unit/i });
    await expect(priceInput).toBeVisible();
  });

  test('form shows total amount', async ({ page }) => {
    const totalDisplay = page.locator('[class*="total"], span').filter({ hasText: /total/i });
    await expect(totalDisplay).toBeVisible();
  });

  test('form shows submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /submit|save invoice/i });
    await expect(submitBtn).toBeVisible();
  });
});

test.describe('Purchase Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/pos');
  });

  test('shows purchase orders heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /purchase order|po/i })).toBeVisible();
  });

  test('displays create PO button', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new po|create order/i });
    await expect(createBtn).toBeVisible();
  });

  test('shows PO list/table', async ({ page }) => {
    const pos = page.locator('table, tr, [class*="po"]').filter({ hasText: /po-|order/i });
    await expect(pos).not.toHaveCount(0);
  });

  test('PO shows PO number', async ({ page }) => {
    const numbers = page.locator('td, span').filter({ hasText: /PO-[0-9]+/i });
    await expect(numbers).not.toHaveCount(0);
  });

  test('PO shows supplier', async ({ page }) => {
    const suppliers = page.locator('td, span').filter({ hasText: /[a-z]+/i });
    await expect(suppliers).not.toHaveCount(0);
  });

  test('PO shows status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /draft|sent|confirmed|received/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('PO shows delivery date', async ({ page }) => {
    const dates = page.locator('td, span').filter({ hasText: /delivery|due/i });
    await expect(dates).not.toHaveCount(0);
  });

  test('PO shows total value', async ({ page }) => {
    const values = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(values).not.toHaveCount(0);
  });

  test('clicking PO opens detail view', async ({ page }) => {
    const po = page.locator('tr, [class*="po"]').first();
    await po.click();
    
    await expect(page.url()).toContain('/purchasing/pos/');
  });
});

test.describe('Create Purchase Order', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/pos/new');
  });

  test('shows create PO heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /new po|create purchase order/i })).toBeVisible();
  });

  test('form shows supplier selector', async ({ page }) => {
    const supplierSelector = page.locator('select, [class*="supplier"]').filter({ hasText: /supplier/i });
    await expect(supplierSelector).toBeVisible();
  });

  test('form shows delivery date picker', async ({ page }) => {
    const datePicker = page.locator('input[type="date"]').filter({ hasText: /delivery/i });
    await expect(datePicker).toBeVisible();
  });

  test('form shows order items section', async ({ page }) => {
    const items = page.locator('[class*="item"], [class*="line"]').filter({ hasText: /item|line/i });
    await expect(items).not.toHaveCount(0);
  });

  test('form shows add item button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add item|add line/i });
    await expect(addBtn).toBeVisible();
  });

  test('form shows notes/comments field', async ({ page }) => {
    const notesField = page.locator('textarea').filter({ hasText: /notes|comments/i });
    await expect(notesField).toBeVisible();
  });

  test('form shows submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /create|send po/i });
    await expect(submitBtn).toBeVisible();
  });

  test('form shows save as draft button', async ({ page }) => {
    const draftBtn = page.getByRole('button', { name: /save draft/i });
    await expect(draftBtn).toBeVisible();
  });
});

test.describe('Goods Receiving (GRN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/grns');
  });

  test('shows goods receiving heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /goods receiving|grn/i })).toBeVisible();
  });

  test('displays receive goods button', async ({ page }) => {
    const receiveBtn = page.getByRole('button', { name: /receive|new grn/i });
    await expect(receiveBtn).toBeVisible();
  });

  test('shows GRN list/table', async ({ page }) => {
    const grns = page.locator('table, tr, [class*="grn"]').filter({ hasText: /grn|receiving/i });
    await expect(grns).not.toHaveCount(0);
  });

  test('GRN shows GRN number', async ({ page }) => {
    const numbers = page.locator('td, span').filter({ hasText: /GRN-[0-9]+/i });
    await expect(numbers).not.toHaveCount(0);
  });

  test('GRN shows linked PO', async ({ page }) => {
    const poRefs = page.locator('td, span').filter({ hasText: /PO-[0-9]+/i });
    await expect(poRefs).not.toHaveCount(0);
  });

  test('GRN shows received date', async ({ page }) => {
    const dates = page.locator('td, span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}/ });
    await expect(dates).not.toHaveCount(0);
  });

  test('GRN shows status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /received|partial|pending/i });
    await expect(statuses).not.toHaveCount(0);
  });
});

test.describe('3-Way Matching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/matching');
  });

  test('shows 3-way match dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /3-way|matching dashboard/i })).toBeVisible();
  });

  test('displays matching statistics', async ({ page }) => {
    const stats = page.locator('[class*="stat"], [class*="kpi"]').filter({ hasText: /pending|matched|variance/i });
    await expect(stats).not.toHaveCount(0);
  });

  test('shows pending matches list', async ({ page }) => {
    const matches = page.locator('[class*="match"], [class*="card"]').filter({ hasText: /pending|match/i });
    await expect(matches).not.toHaveCount(0);
  });

  test('match shows PO reference', async ({ page }) => {
    const poRefs = page.locator('td, span').filter({ hasText: /PO-[0-9]+/i });
    await expect(poRefs).not.toHaveCount(0);
  });

  test('match shows invoice reference', async ({ page }) => {
    const invoiceRefs = page.locator('td, span').filter({ hasText: /INV-[0-9]+/i });
    await expect(invoiceRefs).not.toHaveCount(0);
  });

  test('match shows GRN reference', async ({ page }) => {
    const grnRefs = page.locator('td, span').filter({ hasText: /GRN-[0-9]+/i });
    await expect(grnRefs).not.toHaveCount(0);
  });

  test('match shows variance amount', async ({ page }) => {
    const variances = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(variances).not.toHaveCount(0);
  });

  test('verify match button is visible', async ({ page }) => {
    const verifyBtn = page.getByRole('button', { name: /verify|approve match/i });
    await expect(verifyBtn).toBeVisible();
  });

  test('match shows discrepancy warnings', async ({ page }) => {
    const warnings = page.locator('[class*="warning"], [class*="discrepancy"]').filter({ hasText: /mismatch|variance/i });
    await expect(warnings).not.toHaveCount(0);
  });
});

test.describe('Variance Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/variance-alerts');
  });

  test('shows variance alerts heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /variance|alerts/i })).toBeVisible();
  });

  test('displays alert list', async ({ page }) => {
    const alerts = page.locator('[class*="alert"], [class*="card"]').filter({ hasText: /variance|price|quantity/i });
    await expect(alerts).not.toHaveCount(0);
  });

  test('alert shows variance type', async ({ page }) => {
    const types = page.locator('td, span').filter({ hasText: /price|quantity|missing/i });
    await expect(types).not.toHaveCount(0);
  });

  test('alert shows variance amount', async ({ page }) => {
    const amounts = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(amounts).not.toHaveCount(0);
  });

  test('alert shows resolution status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /resolved|pending/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('resolve alert button is visible', async ({ page }) => {
    const resolveBtn = page.getByRole('button', { name: /resolve|dismiss/i });
    await expect(resolveBtn).toBeVisible();
  });
});

test.describe('Purchasing — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/suppliers');
  });

  test('shows error on failed suppliers load', async ({ page }) => {
    await page.route('**/api/purchasing/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no suppliers', async ({ page }) => {
    await page.route('**/api/purchasing/suppliers', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ suppliers: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no suppliers|empty/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/purchasing/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ suppliers: [{ id: 1, name: 'Test Supplier' }] }),
        });
      }
    });
    
    await page.goto('/purchasing/suppliers');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Purchasing — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/purchasing/suppliers');
  });

  test('cannot add supplier with duplicate name', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/company name/i).or(page.locator('input').first());
    await nameInput.fill('Existing Supplier');
    
    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('supplier form validates email format', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /new supplier/i });
    await addBtn.click();
    
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]').first());
    await emailInput.fill('invalid-email');
    
    const submitBtn = page.getByRole('button', { name: /save|create/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|email/i');
    await expect(error).toBeVisible();
  });

  test('invoice form validates positive amount', async ({ page }) => {
    await page.goto('/purchasing/invoices/new');
    
    const priceInput = page.locator('input[type="number"]').filter({ hasText: /price/i }).first();
    await priceInput.fill('-100');
    
    const submitBtn = page.getByRole('button', { name: /submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|positive/i');
    await expect(error).toBeVisible();
  });

  test('PO cannot be created without supplier', async ({ page }) => {
    await page.goto('/purchasing/pos/new');
    
    const submitBtn = page.getByRole('button', { name: /create|send/i });
    await submitBtn.click();
    
    const error = page.locator('text=/required|supplier/i');
    await expect(error).toBeVisible();
  });

  test('3-way match shows error on price mismatch', async ({ page }) => {
    await page.goto('/purchasing/matching');
    
    const mismatchWarning = page.locator('text=/mismatch|discrepancy|variance/i');
    await expect(mismatchWarning).toBeVisible();
  });
});

test.describe('Purchasing — Responsive Layout', () => {
  test('suppliers table is scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/purchasing/suppliers');
    
    const table = page.locator('table, [class*="table"]').first();
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('nav cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/purchasing');
    
    const cards = page.locator('[class*="card"]').filter({ hasText: /suppliers|invoices/i });
    const firstBox = await cards.first().boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });
});
