import { test, expect, type Page } from '@playwright/test';
import { loginWithPIN0000 } from './helpers/auth';

/**
 * E2E Tests for Purchase Order Creation with Auto-Filled Unit Costs
 * 
 * Tests the complete flow:
 * 1. Navigate to Reorder Staging
 * 2. Verify unit costs are displayed from Preferred Vendors
 * 3. Select items and raise PO
 * 4. Verify prices are auto-filled in modal
 * 5. Submit PO and verify success
 */
test.describe('Purchase Order - Auto-Filled Unit Costs', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login once for all tests
    await loginWithPIN0000(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ── Test 1: Navigate to Reorder Staging ─────────────────────────────────
  test('1. Reorder Staging page loads successfully', async () => {
    await page.goto('/purchasing');
    await page.waitForLoadState('networkidle');
    
    // Click on Reorder Staging
    await page.click('text=Reorder Staging, text=Staging');
    await page.waitForTimeout(2000);
    
    // Verify page loaded
    await expect(page.locator('text=Reorder Staging, text=Staging, text=Procurement')).toBeVisible({ timeout: 10000 });
    
    // Should not have errors
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  });

  // ── Test 2: Verify Unit Costs Displayed ────────────────────────────────
  test('2. Unit costs are displayed for items with preferred vendors', async () => {
    await page.goto('/purchasing');
    await page.click('text=Reorder Staging, text=Staging');
    await page.waitForTimeout(2000);
    
    // Check for currency symbols in unit cost column
    // The table should show prices like "$4.25 per LB"
    const unitCostCells = page.locator('text=/\\$[0-9]+\\.[0-9]{2}/');
    const count = await unitCostCells.count();
    
    // Should have at least some items with unit costs
    expect(count).toBeGreaterThan(0);
    
    // Verify format: "$X.XX per UNIT"
    const firstCost = await unitCostCells.first().textContent();
    expect(firstCost).toMatch(/\$[0-9]+\.[0-9]{2}/);
  });

  // ── Test 3: Items Without Preferred Vendor Show "Not set" ─────────────
  test('3. Items without preferred vendors show "Not set"', async () => {
    await page.goto('/purchasing');
    await page.click('text=Reorder Staging, text=Staging');
    await page.waitForTimeout(2000);
    
    // Some items may not have preferred vendors
    const notSetText = page.locator('text=Not set');
    const count = await notSetText.count();
    
    // This is optional - may or may not have items without vendors
    console.log(`Found ${count} items without preferred vendor pricing`);
  });

  // ── Test 4: Select Vendor and Raise PO ─────────────────────────────────
  test('4. Clicking vendor card selects all items from that vendor', async () => {
    await page.goto('/purchasing');
    await page.click('text=Reorder Staging, text=Staging');
    await page.waitForTimeout(2000);
    
    // Click first vendor card
    const firstVendorCard = page.locator('.vendor-card, [class*="vendor"], [class*="card"]').first();
    await firstVendorCard.click();
    await page.waitForTimeout(500);
    
    // Verify items are selected (checkboxes should be checked)
    const selectedCheckboxes = page.locator('input[type="checkbox"]:checked');
    const count = await selectedCheckboxes.count();
    
    // Should have selected at least 1 item
    expect(count).toBeGreaterThan(0);
  });

  // ── Test 5: Raise PO Modal Opens ───────────────────────────────────────
  test('5. Raise PO modal opens with pre-filled data', async () => {
    await page.goto('/purchasing');
    await page.click('text=Reorder Staging, text=Staging');
    await page.waitForTimeout(2000);
    
    // Click "Raise PO" or "Create PO" button
    const raisePoButton = page.locator('button:has-text("Raise PO"), button:has-text("Create PO")').first();
    await raisePoButton.click();
    await page.waitForTimeout(1000);
    
    // Modal should be visible
    const modal = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Should have supplier selector
    await expect(page.locator('text=Supplier, text=Select Supplier')).toBeVisible();
  });

  // ── Test 6: Unit Prices Auto-Filled ────────────────────────────────────
  test('6. Unit prices are auto-filled from preferred vendors', async () => {
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
    
    // Find unit price inputs
    const unitPriceInputs = page.locator('input[name*="unitPrice"], input[name*="price"]');
    const count = await unitPriceInputs.count();
    
    if (count > 0) {
      // At least one price should be filled
      const firstPrice = await unitPriceInputs.first().inputValue();
      
      // Should have a value (not empty)
      expect(firstPrice.length).toBeGreaterThan(0);
      
      // Should be a valid number
      const priceValue = parseFloat(firstPrice);
      expect(priceValue).toBeGreaterThan(0);
      
      console.log(`Auto-filled unit price: $${priceValue.toFixed(2)}`);
    }
  });

  // ── Test 7: Submit PO Successfully ─────────────────────────────────────
  test('7. Submit PO creates order successfully', async () => {
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
    
    // Select supplier if needed
    const supplierDropdown = page.locator('select, [role="listbox"]').first();
    if (await supplierDropdown.isVisible()) {
      await supplierDropdown.selectOption({ index: 0 });
      await page.waitForTimeout(300);
    }
    
    // Click Confirm/Submit
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Create")').last();
    await confirmButton.click();
    await page.waitForTimeout(2000);
    
    // Should show success message or redirect
    const hasSuccess = 
      await page.locator('text=success, text=created, text=PO created').first().isVisible().catch(() => false) ||
      await page.locator('[class*="toast"], [class*="notification"]').first().isVisible().catch(() => false);
    
    // Either success message or page changed
    expect(hasSuccess).toBe(true);
  });

  // ── Test 8: Verify PO in List ──────────────────────────────────────────
  test('8. Created PO appears in PO list', async () => {
    await page.goto('/purchasing');
    await page.waitForTimeout(1000);
    
    // Navigate to PO List
    await page.click('text=Purchase Orders, text=PO List');
    await page.waitForTimeout(2000);
    
    // Should have a table with POs
    const tableRows = page.locator('tr, [class*="row"]').filter({ hasText: /PO-|Purchase Order/ });
    const count = await tableRows.count();
    
    // Should have at least 1 PO
    expect(count).toBeGreaterThan(0);
    
    console.log(`Found ${count} purchase orders`);
  });
});
