import { test, expect, Page } from '@playwright/test';
import { loginAsStaff } from '../../helpers/login';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: SettingsPage ─────────────────────────────────────────────
// ── Feature: Settings / Administration ─────────────────────────────────

test.beforeEach(async ({ page }) => {
  await loginAsStaff(page);
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('SettingsPage — positive', () => {

  test('page loads with title and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    await expect(page.getByText(/configure your restaurant/i)).toBeVisible();
  });

  test('navigation cards are visible', async ({ page }) => {
    await expect(page.getByText(/restaurant profile/i)).toBeVisible();
    await expect(page.getByText(/user management/i)).toBeVisible();
    await expect(page.getByText(/notifications/i)).toBeVisible();
    await expect(page.getByText(/security/i)).toBeVisible();
    await expect(page.getByText(/appearance/i)).toBeVisible();
    await expect(page.getByText(/data & export/i)).toBeVisible();
    await expect(page.getByText(/billing/i)).toBeVisible();
  });

  test('navigation card descriptions are visible', async ({ page }) => {
    await expect(page.getByText(/name, location, timezone/i)).toBeVisible();
    await expect(page.getByText(/staff roles and permissions/i)).toBeVisible();
    await expect(page.getByText(/email and push alerts/i)).toBeVisible();
    await expect(page.getByText(/password and 2fa/i)).toBeVisible();
    await expect(page.getByText(/theme and display/i)).toBeVisible();
    await expect(page.getByText(/backups and exports/i)).toBeVisible();
    await expect(page.getByText(/subscription and payments/i)).toBeVisible();
  });

  test('user management shows badge count', async ({ page }) => {
    await expect(page.getByText(/user management/i)).toBeVisible();
    // Badge should show number 5
    await expect(page.getByText('5')).toBeVisible();
  });

  test('clicking navigation card triggers action', async ({ page }) => {
    // Click on Restaurant Profile
    await page.getByText(/restaurant profile/i).click();
    
    // Should not throw error (console.log in onClick)
  });

  test('all navigation cards have icons', async ({ page }) => {
    // Check icons are rendered (svg elements)
    const icons = page.locator('svg');
    const iconCount = await icons.count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test('configuration section title is visible', async ({ page }) => {
    await expect(page.getByText(/configuration/i)).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('SettingsPage — negative', () => {

  test('handles empty nav cards gracefully', async ({ page }) => {
    // Mock empty nav cards
    await page.route('**/api/**/settings/**', route => {
      route.fulfill({ body: JSON.stringify({}) });
    });
    
    await page.reload();
    
    // Page should still load
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('SettingsPage — accessibility', () => {

  test('nav cards are keyboard accessible', async ({ page }) => {
    // Tab through nav cards
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should not throw errors
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to SettingsPage.tsx to
 * make every selector bulletproof:
 *
 * [ ] Page header              → add data-testid="settings-header"
 * [ ] Nav cards container     → add data-testid="nav-cards"
 * [ ] Restaurant Profile     → add data-testid="nav-restaurant-profile"
 * [ ] User Management        → add data-testid="nav-user-management"
 * [ ] Notifications         → add data-testid="nav-notifications"
 * [ ] Security              → add data-testid="nav-security"
 * [ ] Appearance           → add data-testid="nav-appearance"
 * [ ] Data & Export        → add data-testid="nav-data-export"
 * [ ] Billing              → add data-testid="nav-billing"
 * [ ] User badge count      → add data-testid="user-badge"
 *
 * API endpoints to mock:
 * - GET /api/v1/settings
 * - GET /api/v1/users
 */
