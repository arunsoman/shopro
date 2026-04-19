import { test, expect, Page } from '@playwright/test';
import { loginAndNavigateTo } from '../../helpers/login';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: PaymentHub ─────────────────────────────────────────────
// ── Feature: Payments / Supplier Pay ───────────────────────────────────

test.beforeEach(async ({ page }) => {
  await loginAndNavigateTo(page, 'Supplier Pay');
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('PaymentHub — positive', () => {

  test('page loads with header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /supplier pay/i })).toBeVisible();
    await expect(page.getByText(/restaurant payment hub/i)).toBeVisible();
  });

  test('metrics cards are visible', async ({ page }) => {
    await expect(page.getByText(/this month/i)).toBeVisible();
    await expect(page.getByText(/pending/i)).toBeVisible();
    await expect(page.getByText(/suppliers/i)).toBeVisible();
    await expect(page.getByText(/providers/i)).toBeVisible();
  });

  test('add provider button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add provider/i })).toBeVisible();
  });

  test('payment providers list is visible', async ({ page }) => {
    await expect(page.getByText(/ach \/ bank transfer/i)).toBeVisible();
    await expect(page.getByText(/virtual card/i)).toBeVisible();
  });

  test('recent transactions are visible', async ({ page }) => {
    await expect(page.getByText(/fresh farms co\./i)).toBeVisible();
    await expect(page.getByText(/metro meats ltd\./i)).toBeVisible();
    await expect(page.getByText(/coastal seafood/i)).toBeVisible();
  });

  test('amounts are displayed correctly', async ({ page }) => {
    await expect(page.getByText(/\$24,850/i)).toBeVisible();
    await expect(page.getByText(/\$3,200/i)).toBeVisible();
  });

  test('suppliers button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: /suppliers/i })).toBeVisible();
  });

  test('pay invoice button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: /pay invoice/i })).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('PaymentHub — negative', () => {

  test('handles empty providers gracefully', async ({ page }) => {
    await page.route('**/api/**/payments/**', route => {
      route.fulfill({ body: JSON.stringify({ providers: [], transactions: [] }) });
    });
    
    await page.reload();
    
    // Page should still load
    await expect(page.getByRole('heading', { name: /supplier pay/i })).toBeVisible();
  });

  test('handles network error', async ({ page }) => {
    await page.route('**/api/**', route => route.abort('failed'));
    
    await page.reload();
    
    // Should still show page
    await expect(page.getByRole('heading', { name: /supplier pay/i })).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('PaymentHub — accessibility', () => {

  test('buttons are accessible', async ({ page }) => {
    const buttons = [
      page.getByRole('button', { name: /add provider/i }),
      page.getByRole('button', { name: /suppliers/i }),
      page.getByRole('button', { name: /pay invoice/i }),
    ];
    
    for (const btn of buttons) {
      await expect(btn).toBeVisible();
    }
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to PaymentHub.tsx to
 * make every selector bulletproof:
 *
 * [ ] Page header              → add data-testid="payment-header"
 * [ ] Add provider button     → add data-testid="add-provider-button"
 * [ ] Metrics container       → add data-testid="metrics-container"
 * [ ] Providers list          → add data-testid="providers-list"
 * [ ] Each provider card      → add data-testid="provider-{id}"
 * [ ] Transactions list        → add data-testid="transactions-list"
 * [ ] Each transaction        → add data-testid="transaction-{id}"
 * [ ] Suppliers button        → add data-testid="suppliers-button"
 * [ ] Pay invoice button      → add data-testid="pay-invoice-button"
 *
 * API endpoints to mock:
 * - GET /api/v1/payments/providers
 * - GET /api/v1/payments/transactions
 * - POST /api/v1/payments
 */
