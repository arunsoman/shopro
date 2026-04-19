import { test, expect, Page } from '@playwright/test';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: StaffLoginPage ───────────────────────────────────────────
// ── Feature: Auth / Staff PIN Login ────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

/** Navigate to Staff Login page */
async function goto(page: Page) {
  await page.goto(`${BASE_URL}/auth/staff`);
}

test.beforeEach(async ({ page }) => {
  await goto(page);
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('StaffLoginPage — positive', () => {

  test('page loads with branding', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sopro pos/i })).toBeVisible();
    await expect(page.getByText(/terminal node entry/i)).toBeVisible();
  });

  test('loading state shows while fetching staff', async ({ page }) => {
    // Should show loading message or staff list
    const hasContent = await page.getByText(/synchronising station data/i).isVisible().catch(() => false)
      || await page.getByText(/select profile/i).isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('footer elements are visible', async ({ page }) => {
    await expect(page.getByText(/terminal encrypted/i)).toBeVisible();
    await expect(page.getByText(/active operations cycle/i)).toBeVisible();
  });

  test('return to hub link exists', async ({ page }) => {
    await expect(page.getByRole('link', { name: /return to hub/i })).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('StaffLoginPage — negative', () => {

  test('handles empty staff list', async ({ page }) => {
    await page.route('**/api/**/auth/staff**', route => {
      route.fulfill({ body: JSON.stringify([]) });
    });
    
    await page.reload();
    
    // Should show empty state or still load
    await expect(page.getByRole('heading', { name: /sopro pos/i })).toBeVisible();
  });

  test('handles network error', async ({ page }) => {
    await page.route('**/api/**', route => route.abort('failed'));
    
    await page.reload();
    
    // Should show error or still load
    await expect(page.getByRole('heading', { name: /sopro pos/i })).toBeVisible();
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to StaffLoginPage.tsx to
 * make every selector bulletproof:
 *
 * [ ] Page container           → add data-testid="staff-login-page"
 * [ ] Branding section        → add data-testid="branding"
 * [ ] Staff list container    → add data-testid="staff-list"
 * [ ] Each staff member       → add data-testid="staff-{id}"
 * [ ] PIN input area         → add data-testid="pin-input"
 * [ ] Numeric keypad          → add data-testid="keypad"
 * [ ] Error message          → add data-testid="error-message"
 * [ ] Loading state          → add data-testid="loading-state"
 *
 * API endpoints to mock:
 * - GET /api/v1/auth/staff?restaurantId={id}
 * - POST /api/v1/auth/staff/login
 */
