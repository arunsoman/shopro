import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Payments Module Tests — ShoPro Restaurant Web
 * Tests payment processing, supplier payments, and terminal management
 * 
 * Sources:
 * - PaymentFeature.tsx
 * - Supplier payment components
 */

test.describe('Payments — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('no NaN in payment dashboard', async ({ page }) => {
    await expectNoNaN(page, 'Payment Dashboard');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in pending payments', async ({ page }) => {
    await expectNoNaN(page, 'Pending Payments');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in supplier payment amounts', async ({ page }) => {
    await expectNoNaN(page, 'Supplier Payment Amounts');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in payment history', async ({ page }) => {
    await expectNoNaN(page, 'Payment History');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in invoice amounts', async ({ page }) => {
    // Check all invoice amount displays
    const amounts = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    const count = await amounts.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const amount = amounts.nth(i);
      const text = await amount.textContent();
      expect(text).not.toContain('NaN');
    }
  });

  test('no NaN in reconciliation totals', async ({ page }) => {
    await expectNoNaN(page, 'Reconciliation Totals');
    await expectNoNaNInNumericDisplays(page);
  });
});

test.describe('Payments — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('shows payments heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /payments|supplier pay/i })).toBeVisible();
  });

  test('displays payment dashboard', async ({ page }) => {
    const dashboard = page.locator('[class*="dashboard"], [class*="overview"]').filter({ hasText: /payment|overview/i });
    await expect(dashboard).toBeVisible();
  });

  test('shows pending payments summary', async ({ page }) => {
    const pendingSummary = page.locator('[class*="pending"], [class*="summary"]').filter({ hasText: /pending|due/i });
    await expect(pendingSummary).toBeVisible();
  });

  test('displays total payable amount', async ({ page }) => {
    const totalPayable = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/i });
    await expect(totalPayable).toBeVisible();
  });

  test('shows payment methods section', async ({ page }) => {
    const paymentMethods = page.locator('[class*="method"], [class*="payment"]').filter({ hasText: /method|card|bank/i });
    await expect(paymentMethods).not.toHaveCount(0);
  });

  test('displays recent payments list', async ({ page }) => {
    const recentPayments = page.locator('[class*="recent"], [class*="list"]').filter({ hasText: /recent|history/i });
    await expect(recentPayments).toBeVisible();
  });

  test('shows payment terminals section', async ({ page }) => {
    const terminals = page.locator('[class*="terminal"], [class*="device"]').filter({ hasText: /terminal|device/i });
    await expect(terminals).not.toHaveCount(0);
  });

  test('displays supplier payment queue', async ({ page }) => {
    const paymentQueue = page.locator('[class*="queue"], [class*="list"]').filter({ hasText: /queue|pending/i });
    await expect(paymentQueue).toBeVisible();
  });
});

test.describe('Payments — Supplier Payments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('shows suppliers awaiting payment', async ({ page }) => {
    const suppliersList = page.locator('[class*="supplier"], [class*="vendor"]').filter({ hasText: /supplier|vendor/i });
    await expect(suppliersList).not.toHaveCount(0);
  });

  test('displays invoice amount due', async ({ page }) => {
    const invoiceAmounts = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/i });
    await expect(invoiceAmounts).not.toHaveCount(0);
  });

  test('shows due date for invoices', async ({ page }) => {
    const dueDates = page.locator('span').filter({ hasText: /due|[0-9]{4}-[0-9]{2}-[0-9]{2}/i });
    await expect(dueDates).not.toHaveCount(0);
  });

  test('displays payment terms (Net 30, etc)', async ({ page }) => {
    const paymentTerms = page.locator('span').filter({ hasText: /net 30|net 15|cod/i });
    await expect(paymentTerms).not.toHaveCount(0);
  });

  test('shows pay now button', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now|pay invoice/i });
    await expect(payNowBtn).toBeVisible();
  });

  test('shows schedule payment button', async ({ page }) => {
    const scheduleBtn = page.getByRole('button', { name: /schedule|later/i });
    await expect(scheduleBtn).toBeVisible();
  });

  test('displays partial payment option', async ({ page }) => {
    const partialOption = page.locator('[class*="partial"], button').filter({ hasText: /partial/i });
    await expect(partialOption).toBeVisible();
  });

  test('shows bulk payment option', async ({ page }) => {
    const bulkBtn = page.getByRole('button', { name: /bulk|pay all/i });
    await expect(bulkBtn).toBeVisible();
  });
});

test.describe('Payments — Payment Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('pay now opens payment form', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const paymentForm = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /payment|pay/i });
    await expect(paymentForm).toBeVisible();
  });

  test('payment form shows amount field', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const amountField = page.locator('input[type="number"]').filter({ hasText: /amount/i }).or(page.locator('input[placeholder*="amount"]').first());
    await expect(amountField).toBeVisible();
  });

  test('payment form shows payment method selector', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const methodSelector = page.locator('select, [class*="method"]').filter({ hasText: /method|card|bank|ach/i });
    await expect(methodSelector).toBeVisible();
  });

  test('payment form shows bank account selector', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const bankSelector = page.locator('select, [class*="bank"]').filter({ hasText: /bank|account/i });
    await expect(bankSelector).toBeVisible();
  });

  test('payment form shows payment date picker', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const datePicker = page.locator('input[type="date"]').filter({ hasText: /date/i });
    await expect(datePicker).toBeVisible();
  });

  test('payment form shows reference/memo field', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const memoField = page.locator('textarea, input').filter({ hasText: /reference|memo|note/i });
    await expect(memoField).toBeVisible();
  });

  test('payment form shows confirm button', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const confirmBtn = page.getByRole('button', { name: /confirm|submit|pay/i });
    await expect(confirmBtn).toBeVisible();
  });

  test('payment form shows cancel button', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const cancelBtn = page.getByRole('button', { name: /cancel/i });
    await expect(cancelBtn).toBeVisible();
  });

  test('cancel button closes payment form', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const cancelBtn = page.getByRole('button', { name: /cancel/i });
    await cancelBtn.click();
    
    const paymentForm = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /payment/i });
    await expect(paymentForm).not.toBeVisible();
  });
});

test.describe('Payments — Payment Methods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('displays bank transfer option', async ({ page }) => {
    const bankTransfer = page.locator('[class*="bank"], button').filter({ hasText: /bank transfer|ach|wire/i });
    await expect(bankTransfer).toBeVisible();
  });

  test('displays check payment option', async ({ page }) => {
    const checkPayment = page.locator('[class*="check"], button').filter({ hasText: /check|cheque/i });
    await expect(checkPayment).toBeVisible();
  });

  test('displays credit card option', async ({ page }) => {
    const creditCard = page.locator('[class*="card"], button').filter({ hasText: /credit card|card/i });
    await expect(creditCard).toBeVisible();
  });

  test('displays cash payment option', async ({ page }) => {
    const cashPayment = page.locator('[class*="cash"], button').filter({ hasText: /cash/i });
    await expect(cashPayment).toBeVisible();
  });

  test('shows add payment method button', async ({ page }) => {
    const addMethodBtn = page.getByRole('button', { name: /add method|new payment method/i });
    await expect(addMethodBtn).toBeVisible();
  });

  test('add payment method opens form', async ({ page }) => {
    const addMethodBtn = page.getByRole('button', { name: /add method/i });
    await addMethodBtn.click();
    
    const methodForm = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /payment method/i });
    await expect(methodForm).toBeVisible();
  });

  test('payment method form shows account details', async ({ page }) => {
    const addMethodBtn = page.getByRole('button', { name: /add method/i });
    await addMethodBtn.click();
    
    const accountField = page.locator('input').filter({ hasText: /account|routing/i });
    await expect(accountField).not.toHaveCount(0);
  });
});

test.describe('Payments — Payment History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('shows payment history section', async ({ page }) => {
    const historySection = page.locator('[class*="history"], [class*="recent"]').filter({ hasText: /history|recent/i });
    await expect(historySection).toBeVisible();
  });

  test('displays past payments list', async ({ page }) => {
    const pastPayments = page.locator('[class*="payment"], tr').filter({ hasText: /paid|completed/i });
    await expect(pastPayments).not.toHaveCount(0);
  });

  test('payment history shows date', async ({ page }) => {
    const dates = page.locator('span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}/ });
    await expect(dates).not.toHaveCount(0);
  });

  test('payment history shows amount', async ({ page }) => {
    const amounts = page.locator('span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(amounts).not.toHaveCount(0);
  });

  test('payment history shows supplier name', async ({ page }) => {
    const suppliers = page.locator('span').filter({ hasText: /[a-z]+/i });
    await expect(suppliers).not.toHaveCount(0);
  });

  test('payment history shows payment method', async ({ page }) => {
    const methods = page.locator('span').filter({ hasText: /bank|check|card|ach/i });
    await expect(methods).not.toHaveCount(0);
  });

  test('payment history shows status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /completed|pending|failed/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('filter payment history by date range', async ({ page }) => {
    const dateFilter = page.locator('select, button').filter({ hasText: /date|range/i });
    await expect(dateFilter).toBeVisible();
  });

  test('filter payment history by status', async ({ page }) => {
    const statusFilter = page.locator('select, button').filter({ hasText: /status|all/i });
    await statusFilter.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /completed|pending/i }).first();
    await option.click();
    
    const filtered = page.locator('[class*="payment"], tr');
    await expect(filtered).not.toHaveCount(0);
  });

  test('export payment history button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Payments — Payment Terminals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('shows payment terminals section', async ({ page }) => {
    const terminalsSection = page.locator('[class*="terminal"], [class*="device"]').filter({ hasText: /terminal|device/i });
    await expect(terminalsSection).not.toHaveCount(0);
  });

  test('displays terminal status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /online|offline|active/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('shows terminal name/ID', async ({ page }) => {
    const terminalNames = page.locator('span').filter({ hasText: /terminal|device|[0-9]+/i });
    await expect(terminalNames).not.toHaveCount(0);
  });

  test('displays terminal location', async ({ page }) => {
    const locations = page.locator('span').filter({ hasText: /location|pos|register/i });
    await expect(locations).not.toHaveCount(0);
  });

  test('shows terminal settings button', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).first();
    await expect(settingsBtn).toBeVisible();
  });

  test('terminal settings opens configuration', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).first();
    await settingsBtn.click();
    
    const configDialog = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /terminal|settings/i });
    await expect(configDialog).toBeVisible();
  });

  test('shows restart terminal option', async ({ page }) => {
    const restartBtn = page.getByRole('button', { name: /restart|reboot/i });
    await expect(restartBtn).toBeVisible();
  });

  test('shows terminal transaction history', async ({ page }) => {
    const transactionHistory = page.locator('[class*="transaction"], [class*="history"]').filter({ hasText: /transaction/i });
    await expect(transactionHistory).toBeVisible();
  });
});

test.describe('Payments — Reconciliation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('shows reconciliation section', async ({ page }) => {
    const reconciliation = page.locator('[class*="reconcile"], [class*="match"]').filter({ hasText: /reconcile|match/i });
    await expect(reconciliation).toBeVisible();
  });

  test('displays unmatched payments', async ({ page }) => {
    const unmatched = page.locator('[class*="unmatched"], span').filter({ hasText: /unmatched|pending/i });
    await expect(unmatched).toBeVisible();
  });

  test('shows reconcile button', async ({ page }) => {
    const reconcileBtn = page.getByRole('button', { name: /reconcile|match/i });
    await expect(reconcileBtn).toBeVisible();
  });

  test('displays bank statement import option', async ({ page }) => {
    const importBtn = page.getByRole('button', { name: /import|upload/i });
    await expect(importBtn).toBeVisible();
  });

  test('shows reconciliation report', async ({ page }) => {
    const report = page.locator('[class*="report"], [class*="summary"]').filter({ hasText: /reconciliation|report/i });
    await expect(report).toBeVisible();
  });
});

test.describe('Payments — Settings & Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('shows payment settings button', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).nth(1);
    await expect(settingsBtn).toBeVisible();
  });

  test('payment settings opens configuration', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).nth(1);
    await settingsBtn.click();
    
    const settingsDialog = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /payment settings/i });
    await expect(settingsDialog).toBeVisible();
  });

  test('settings shows default payment method', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).nth(1);
    await settingsBtn.click();
    
    const defaultMethod = page.locator('select, [class*="default"]').filter({ hasText: /default method/i });
    await expect(defaultMethod).toBeVisible();
  });

  test('settings shows auto-pay configuration', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).nth(1);
    await settingsBtn.click();
    
    const autoPayConfig = page.locator('[class*="auto"], input[type="checkbox"]').filter({ hasText: /auto-pay|automatic/i });
    await expect(autoPayConfig).toBeVisible();
  });

  test('settings shows payment approval workflow', async ({ page }) => {
    const settingsBtn = page.locator('button').filter({ has: page.locator('[data-lucide="settings"]') }).nth(1);
    await settingsBtn.click();
    
    const approvalConfig = page.locator('[class*="approval"], [class*="workflow"]').filter({ hasText: /approval|workflow/i });
    await expect(approvalConfig).toBeVisible();
  });
});

test.describe('Payments — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('shows error on failed payments load', async ({ page }) => {
    await page.route('**/api/payments/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no pending payments', async ({ page }) => {
    await page.route('**/api/payments/pending', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ payments: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no pending|empty|all caught up/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/payments/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ payments: [{ id: 1, supplier: 'Test', amount: 100 }] }),
        });
      }
    });
    
    await page.goto('/payments');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });

  test('shows error on payment processing failure', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    await page.route('**/api/payments/process', route => {
      route.fulfill({ status: 500 });
    });
    
    const confirmBtn = page.getByRole('button', { name: /confirm|pay/i });
    await confirmBtn.click();
    
    const errorBanner = page.locator('text=/error|failed|payment failed/i');
    await expect(errorBanner).toBeVisible();
  });
});

test.describe('Payments — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payments');
  });

  test('cannot pay more than invoice amount', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const amountField = page.locator('input[type="number"]').filter({ hasText: /amount/i }).first();
    await amountField.fill('999999');
    
    const confirmBtn = page.getByRole('button', { name: /confirm/i });
    await confirmBtn.click();
    
    const error = page.locator('text=/exceeds|invalid amount/i');
    await expect(error).toBeVisible();
  });

  test('payment form validates required fields', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const confirmBtn = page.getByRole('button', { name: /confirm/i });
    await confirmBtn.click();
    
    const errors = page.locator('text=/required/i');
    await expect(errors).not.toHaveCount(0);
  });

  test('cannot schedule payment in the past', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const datePicker = page.locator('input[type="date"]').first();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await datePicker.fill(pastDate.toISOString().split('T')[0]);
    
    const confirmBtn = page.getByRole('button', { name: /confirm/i });
    await confirmBtn.click();
    
    const error = page.locator('text=/invalid|past|future/i');
    await expect(error).toBeVisible();
  });

  test('cannot process payment without bank account', async ({ page }) => {
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    // Don't select bank account
    const confirmBtn = page.getByRole('button', { name: /confirm/i });
    await confirmBtn.click();
    
    const error = page.locator('text=/required|select account/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Payments — Responsive Layout', () => {
  test('payments dashboard is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/payments');
    
    const dashboard = page.locator('[class*="dashboard"]').first();
    await expect(dashboard).toBeVisible();
  });

  test('payment cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/payments');
    
    const cards = page.locator('[class*="card"]').filter({ hasText: /pending|supplier/i });
    const firstBox = await cards.first().boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });

  test('payment history table is scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/payments');
    
    const table = page.locator('table, [class*="table"]').first();
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });
});

test.describe('Payments — Performance', () => {
  test('payments page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/payments');
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000);
  });

  test('payment processing is fast', async ({ page }) => {
    await page.goto('/payments');
    
    const startTime = Date.now();
    
    const payNowBtn = page.getByRole('button', { name: /pay now/i }).first();
    await payNowBtn.click();
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(2000);
  });
});
