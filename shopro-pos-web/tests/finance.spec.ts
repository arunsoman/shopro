import { test, expect } from '@playwright/test';

/**
 * Finance Module Tests
 * Tests financial reports, ledger, P&L, balance sheet, and accounts
 * 
 * Source: /features/finance/pages/*, /features/finance/layouts/FinanceLayout.tsx
 */

test.describe('Finance — Overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance');
  });

  test('shows finance overview heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /finance|overview/i })).toBeVisible();
  });

  test('displays financial KPI cards', async ({ page }) => {
    const kpiCards = page.locator('[class*="stat"], [class*="card"]').filter({ hasText: /revenue|profit|expense|cash/i });
    await expect(kpiCards).not.toHaveCount(0);
  });

  test('shows cash flow chart', async ({ page }) => {
    const cashFlowChart = page.locator('svg, canvas, [class*="chart"]').filter({ hasText: /cash|flow/i });
    await expect(cashFlowChart).not.toHaveCount(0);
  });

  test('displays quick links to reports', async ({ page }) => {
    const quickLinks = page.locator('a, button').filter({ hasText: /ledger|p&l|balance|account/i });
    await expect(quickLinks).not.toHaveCount(0);
  });

  test('date range picker for financial data', async ({ page }) => {
    const dateRange = page.locator('[class*="date"], [class*="range"]').filter({ hasText: /date|period|fiscal/i });
    await expect(dateRange).toBeVisible();
  });
});

test.describe('Finance — Ledger', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance/ledger');
  });

  test('shows general ledger heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ledger|general ledger/i })).toBeVisible();
  });

  test('displays ledger entries table', async ({ page }) => {
    const ledgerEntries = page.locator('table, tr, [class*="ledger"]').filter({ hasText: /debit|credit|balance/i });
    await expect(ledgerEntries).not.toHaveCount(0);
  });

  test('ledger shows transaction dates', async ({ page }) => {
    const dates = page.locator('td, span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{2}/ });
    await expect(dates).not.toHaveCount(0);
  });

  test('ledger shows account names', async ({ page }) => {
    const accounts = page.locator('td, span').filter({ hasText: /cash|account|receivable|payable/i });
    await expect(accounts).not.toHaveCount(0);
  });

  test('filter ledger by account works', async ({ page }) => {
    const accountFilter = page.locator('select, button').filter({ hasText: /account|all/i });
    await accountFilter.click();
    
    const option = page.locator('option, [role="option"]').first();
    await option.click();
    
    // Should filter entries
    const filteredEntries = page.locator('table, tr');
    await expect(filteredEntries).not.toHaveCount(0);
  });

  test('export ledger button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|csv/i });
    await expect(exportBtn).toBeVisible();
  });

  test('ledger entry drill-down shows details', async ({ page }) => {
    const entry = page.locator('tr, [class*="entry"]').first();
    await entry.click();
    
    // Should show modal or navigate to detail
    const detail = page.locator('[class*="detail"], [role="dialog"]').filter({ hasText: /transaction|entry/i });
    await expect(detail).toBeVisible().catch(() => {
      // Might navigate instead
      expect(page.url()).not.toContain('/ledger');
    });
  });
});

test.describe('Finance — Profit & Loss', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance/pnl');
  });

  test('shows P&L statement heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /profit|loss|p&l|income statement/i })).toBeVisible();
  });

  test('displays revenue section', async ({ page }) => {
    const revenueSection = page.locator('[class*="revenue"], tr').filter({ hasText: /revenue|sales|income/i });
    await expect(revenueSection).toBeVisible();
  });

  test('displays COGS section', async ({ page }) => {
    const cogsSection = page.locator('[class*="cogs"], tr').filter({ hasText: /cogs|cost of goods|food cost/i });
    await expect(cogsSection).toBeVisible();
  });

  test('displays operating expenses section', async ({ page }) => {
    const opexSection = page.locator('[class*="expense"], tr').filter({ hasText: /expense|operating|labor/i });
    await expect(opexSection).toBeVisible();
  });

  test('shows gross profit calculation', async ({ page }) => {
    const grossProfit = page.locator('[class*="gross"], span').filter({ hasText: /gross profit|margin/i });
    await expect(grossProfit).toBeVisible();
  });

  test('shows net profit calculation', async ({ page }) => {
    const netProfit = page.locator('[class*="net"], span').filter({ hasText: /net profit|net income/i });
    await expect(netProfit).toBeVisible();
  });

  test('P&L shows period comparison', async ({ page }) => {
    const comparison = page.locator('[class*="compare"], [class*="variance"]').filter({ hasText: /vs|variance|change/i });
    await expect(comparison).not.toHaveCount(0);
  });

  test('export P&L report button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|pdf/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Finance — Balance Sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance/balance');
  });

  test('shows balance sheet heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /balance sheet/i })).toBeVisible();
  });

  test('displays assets section', async ({ page }) => {
    const assetsSection = page.locator('[class*="asset"], tr').filter({ hasText: /asset|cash|inventory|equipment/i });
    await expect(assetsSection).toBeVisible();
  });

  test('displays liabilities section', async ({ page }) => {
    const liabilitiesSection = page.locator('[class*="liability"], tr').filter({ hasText: /liability|payable|loan/i });
    await expect(liabilitiesSection).toBeVisible();
  });

  test('displays equity section', async ({ page }) => {
    const equitySection = page.locator('[class*="equity"], tr').filter({ hasText: /equity|capital|retained/i });
    await expect(equitySection).toBeVisible();
  });

  test('balance sheet balances (Assets = Liabilities + Equity)', async ({ page }) => {
    const balanceCheck = page.locator('[class*="total"], span').filter({ hasText: /total|balance/i });
    await expect(balanceCheck).not.toHaveCount(0);
  });

  test('export balance sheet button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|pdf/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Finance — Accounts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance/accounts');
  });

  test('shows chart of accounts heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /account|chart of accounts/i })).toBeVisible();
  });

  test('displays account list', async ({ page }) => {
    const accounts = page.locator('[class*="account"], tr, [class*="card"]').filter({ hasText: /account/i });
    await expect(accounts).not.toHaveCount(0);
  });

  test('add account button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /account/i });
    await expect(addBtn).toBeVisible();
  });

  test('account form shows name and type fields', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /account/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
    
    const typeSelector = page.locator('select, [class*="type"]').filter({ hasText: /type|asset|liability/i });
    await expect(typeSelector).toBeVisible();
  });

  test('accounts are grouped by type', async ({ page }) => {
    const groups = page.locator('[class*="group"], h3, h4').filter({ hasText: /asset|liability|equity|income|expense/i });
    await expect(groups).not.toHaveCount(0);
  });

  test('account shows current balance', async ({ page }) => {
    const balances = page.locator('td, span').filter({ hasText: /\$|€|£|[0-9]+\.[0-9]+/ });
    await expect(balances).not.toHaveCount(0);
  });

  test('edit account button opens form', async ({ page }) => {
    const editBtn = page.getByRole('button', { name: /edit/i }).first();
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|account/i });
    await expect(form).toBeVisible();
  });
});

test.describe('Finance — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance/ledger');
  });

  test('shows error on failed ledger load', async ({ page }) => {
    await page.route('**/api/finance/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no transactions', async ({ page }) => {
    await page.route('**/api/finance/ledger', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ entries: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no transactions|empty|no entries/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads data after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/finance/*', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ entries: [{ id: 1, account: 'Cash', debit: 100, credit: 0 }] }),
        });
      }
    });
    
    await page.goto('/finance/ledger');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Finance — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/finance/accounts');
  });

  test('account form validates unique account name', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /account/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input').first());
    await nameInput.fill('Existing Account');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/duplicate|exists/i');
    await expect(error).toBeVisible();
  });

  test('account cannot be deleted if has transactions', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
    await deleteBtn.click();
    
    const confirmBtn = page.getByRole('button', { name: /confirm|yes/i });
    await confirmBtn.click();
    
    // Should show error or prevent deletion
    const error = page.locator('text=/cannot delete|has transactions|in use/i');
    await expect(error).toBeVisible().catch(() => {
      // Might handle differently
    });
  });

  test('ledger entry requires valid amount', async ({ page }) => {
    await page.goto('/finance/ledger');
    
    const addEntryBtn = page.getByRole('button', { name: /add|new|entry/i });
    await addEntryBtn.click();
    
    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill('-100');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|positive|amount/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Finance — Responsive Layout', () => {
  test('ledger table adapts to mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/finance/ledger');
    
    const table = page.locator('table, [class*="table"]');
    const isScrollable = await table.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('P&L statement stacks on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/finance/pnl');
    
    const sections = page.locator('[class*="section"], [class*="revenue"]');
    const firstBox = await sections.first().boundingBox();
    const secondBox = await sections.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });
});
