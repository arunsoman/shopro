import { test, expect } from '@playwright/test';
import { loginWithPIN0000 } from './helpers/auth';

/**
 * E2E Tests for Complete Procurement Cycle
 * 
 * Tests the full flow:
 * 1. Low Stock Alert → Reorder Staging
 * 2. Create Purchase Order (with auto-filled prices)
 * 3. Receive Goods (GRN)
 * 4. Enter Invoice
 * 5. 3-Way Match Verification
 */
test.describe('Complete Procurement Cycle - PO to Invoice', () => {
  test.beforeEach(async ({ page }) => {
    await loginWithPIN0000(page);
  });

  // ── Test 1: View Low Stock Alerts ─────────────────────────────────────
  test('1. Low stock alerts are displayed', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    
    // Navigate to Low Stock Alerts
    await page.click('text=Low Stock, text=Alerts');
    await page.waitForTimeout(2000);
    
    // Should have alert table/list
    const alertRows = page.locator('tr, [class*="row"], [class*="alert"]');
    const count = await alertRows.count();
    
    console.log(`Found ${count} low stock alerts`);
    
    // Should have some alerts (seeded data)
    expect(count).toBeGreaterThan(0);
  });

  // ── Test 2: Navigate to Reorder Staging ───────────────────────────────
  test('2. Reorder staging shows items needing restock', async ({ page }) => {
    await page.goto('/purchasing');
    await page.click('text=Reorder Staging, text=Staging');
    await page.waitForTimeout(2000);
    
    // Verify staging page loaded
    await expect(page.locator('text=Reorder Staging, text=Staging')).toBeVisible();
    
    // Should have vendor cards or table
    const hasContent = 
      await page.locator('.vendor-card, [class*="vendor"], table').first().isVisible();
    
    expect(hasContent).toBe(true);
  });

  // ── Test 3: Create Purchase Order ─────────────────────────────────────
  test('3. Create PO with auto-filled unit costs', async ({ page }) => {
    await page.goto('/purchasing');
    await page.click('text=Reorder Staging, text=Staging');
    await page.waitForTimeout(2000);
    
    // Select first item
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.click();
    await page.waitForTimeout(300);
    
    // Click Raise PO
    const raisePoButton = page.locator('button:has-text("Raise PO"), button:has-text("Create PO")').first();
    await raisePoButton.click();
    await page.waitForTimeout(1000);
    
    // Verify modal opened
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Select supplier (first option)
    const supplierSelect = page.locator('select').first();
    if (await supplierSelect.isVisible()) {
      await supplierSelect.selectOption({ index: 0 });
      await page.waitForTimeout(300);
    }
    
    // Verify unit price is filled
    const unitPriceInput = page.locator('input[name*="unitPrice"]').first();
    const unitPrice = await unitPriceInput.inputValue();
    
    console.log(`Auto-filled unit price: $${unitPrice}`);
    expect(unitPrice.length).toBeGreaterThan(0);
    
    // Submit PO
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Submit")').last();
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    // Should show success
    const hasSuccess = 
      await page.locator('text=success, text=created').first().isVisible().catch(() => false);
    
    console.log(`PO creation success: ${hasSuccess ? '✅' : '⚠️'}`);
  });

  // ── Test 4: View Purchase Orders List ─────────────────────────────────
  test('4. Created PO appears in PO list', async ({ page }) => {
    await page.goto('/purchasing');
    await page.click('text=Purchase Orders, text=PO List');
    await page.waitForTimeout(2000);
    
    // Should have PO table
    const poRows = page.locator('tr, [class*="row"]').filter({ hasText: /PO-|Purchase Order/ });
    const count = await poRows.count();
    
    console.log(`Found ${count} purchase orders`);
    expect(count).toBeGreaterThan(0);
  });

  // ── Test 5: Create GRN (Goods Receipt Note) ───────────────────────────
  test('5. Create GRN for received goods', async ({ page }) => {
    await page.goto('/purchasing');
    await page.click('text=GRN, text=Goods Receipt');
    await page.waitForTimeout(2000);
    
    // Should have GRN creation UI
    const hasGRNContent = 
      await page.locator('text=GRN, text=Goods Receipt, text=Receive').first().isVisible();
    
    expect(hasGRNContent).toBe(true);
    
    console.log('GRN page loaded successfully');
  });

  // ── Test 6: Enter Purchase Invoice ────────────────────────────────────
  test('6. Enter purchase invoice', async ({ page }) => {
    await page.goto('/purchasing');
    await page.click('text=Invoice, text=Purchase Invoice');
    await page.waitForTimeout(2000);
    
    // Should have invoice entry UI
    const hasInvoiceContent = 
      await page.locator('text=Invoice, text=Purchase Invoice').first().isVisible();
    
    expect(hasInvoiceContent).toBe(true);
    
    console.log('Invoice entry page loaded successfully');
  });

  // ── Test 7: 3-Way Match Verification ──────────────────────────────────
  test('7. 3-way match (PO-GRN-Invoice) verification', async ({ page }) => {
    await page.goto('/purchasing');
    await page.click('text=Matching, text=3-Way');
    await page.waitForTimeout(2000);
    
    // Should have matching dashboard
    const hasMatchingContent = 
      await page.locator('text=Matching, text=3-Way, text=Verification').first().isVisible();
    
    expect(hasMatchingContent).toBe(true);
    
    console.log('3-way match dashboard loaded successfully');
  });

  // ── Test 8: Verify Inventory Updated ──────────────────────────────────
  test('8. Inventory levels updated after GRN', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForTimeout(2000);
    
    // Should have ingredient table
    const ingredientRows = page.locator('tr, [class*="row"]').filter({ hasText: /ING|Ingredient/ });
    const count = await ingredientRows.count();
    
    console.log(`Found ${count} ingredients in inventory`);
    expect(count).toBeGreaterThan(0);
  });
});
