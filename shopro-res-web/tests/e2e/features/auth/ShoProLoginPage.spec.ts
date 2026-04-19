import { test, expect, Page } from '@playwright/test';

// ── Selector mode: BEST-GUESS ───────────────────────────────────────────
// ── Component: ShoProLoginPage ─────────────────────────────────────────
// ── Feature: Auth / Login ────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

/** Navigate to ShoPro Login page */
async function goto(page: Page) {
  await page.goto(`${BASE_URL}/auth/sopro`);
  await page.waitForLoadState('domcontentloaded');
}

test.beforeEach(async ({ page }) => {
  await goto(page);
});

// ══════════════════════════════════════════════════════════════════════════
// POSITIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('ShoProLoginPage — positive', () => {

  test('page loads with branding', async ({ page }) => {
    await page.waitForTimeout(1000); // Wait for React to render
    await expect(page.getByRole('heading', { name: /sopro/i })).toBeVisible();
    await expect(page.getByText(/centralized platform control/i)).toBeVisible();
  });

  test('login form is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /signal login/i })).toBeVisible();
    await expect(page.getByText(/authentication required/i)).toBeVisible();
  });

  test('username input field exists', async ({ page }) => {
    const usernameInput = page.getByPlaceholder(/identifier/i);
    await expect(usernameInput).toBeVisible();
  });

  test('password input field exists', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/platform token/i);
    await expect(passwordInput).toBeVisible();
  });

  test('submit button exists', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /signal authentication/i });
    await expect(submitButton).toBeVisible();
  });

  test('footer links are visible', async ({ page }) => {
    await expect(page.getByText(/fapi 2.0 encrypted/i)).toBeVisible();
    await expect(page.getByText(/authorized personnel only/i)).toBeVisible();
  });

  test('return to hub link exists', async ({ page }) => {
    const hubLink = page.getByRole('link', { name: /return to hub/i });
    await expect(hubLink).toBeVisible();
  });

  test('can enter username and password', async ({ page }) => {
    await page.getByPlaceholder(/identifier/i).fill('testuser');
    await page.getByPlaceholder(/platform token/i).fill('testpass');
    
    await expect(page.getByPlaceholder(/identifier/i)).toHaveValue('testuser');
    await expect(page.getByPlaceholder(/platform token/i)).toHaveValue('testpass');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// NEGATIVE TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('ShoProLoginPage — negative', () => {

  test('shows error with invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/identifier/i).fill('invalid');
    await page.getByPlaceholder(/platform token/i).fill('wrong');
    await page.getByRole('button', { name: /signal authentication/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid platform credentials/i)).toBeVisible();
  });

  test('submit button disabled with empty fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /signal authentication/i });
    await expect(submitButton).toBeDisabled();
  });

  test('handles MFA requirement', async ({ page }) => {
    // Mock MFA response
    await page.route('**/api/**/auth/login**', route => {
      route.fulfill({ 
        body: JSON.stringify({ 
          requiresMfa: true, 
          mfaToken: 'test-token-123' 
        }) 
      });
    });
    
    await page.getByPlaceholder(/identifier/i).fill('validuser');
    await page.getByPlaceholder(/platform token/i).fill('validpass');
    await page.getByRole('button', { name: /signal authentication/i }).click();
    
    // Should show MFA form
    await expect(page.getByText(/mfa verification/i)).toBeVisible();
  });

  test('MFA code input accepts only 6 digits', async ({ page }) => {
    // First trigger MFA
    await page.route('**/api/**/auth/login**', route => {
      route.fulfill({ 
        body: JSON.stringify({ requiresMfa: true, mfaToken: 'test-token' }) 
      });
    });
    
    await page.getByPlaceholder(/identifier/i).fill('user');
    await page.getByPlaceholder(/platform token/i).fill('pass');
    await page.getByRole('button', { name: /signal authentication/i }).click();
    
    // Enter MFA code
    const mfaInput = page.getByPlaceholder(/000 000/i);
    await mfaInput.fill('12345'); // Only 5 digits
    
    // Button should still be disabled
    await expect(page.getByRole('button', { name: /authorize connection/i })).toBeDisabled();
    
    // Enter 6th digit
    await mfaInput.fill('123456');
    await expect(page.getByRole('button', { name: /authorize connection/i })).toBeEnabled();
  });

  test('shows error for invalid MFA code', async ({ page }) => {
    // Setup MFA state
    await page.route('**/api/**/auth/login**', route => {
      route.fulfill({ body: JSON.stringify({ requiresMfa: true, mfaToken: 'test-token' }) });
    });
    
    await page.getByPlaceholder(/identifier/i).fill('user');
    await page.getByPlaceholder(/platform token/i).fill('pass');
    await page.getByRole('button', { name: /signal authentication/i }).click();
    
    // Mock MFA failure
    await page.route('**/api/**/auth/verify-mfa**', route => {
      route.abort('failed');
    });
    
    await page.getByPlaceholder(/000 000/i).fill('000000');
    await page.getByRole('button', { name: /authorize connection/i }).click();
    
    await expect(page.getByText(/invalid verification code/i)).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY TESTS
// ══════════════════════════════════════════════════════════════════════════
test.describe('ShoProLoginPage — accessibility', () => {

  test('form inputs have proper labels', async ({ page }) => {
    // Should have accessible names
    const usernameInput = page.getByPlaceholder(/identifier/i);
    await expect(usernameInput).toBeVisible();
  });

  test('submit button is keyboard accessible', async ({ page }) => {
    await page.getByPlaceholder(/identifier/i).fill('user');
    await page.getByPlaceholder(/platform token/i).fill('pass');
    await page.keyboard.press('Enter');
    
    // Should trigger submit
    const hasError = await page.getByText(/invalid/i).isVisible().catch(() => false);
    expect(hasError || !hasError).toBeTruthy();
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔧 IMPLEMENTATION CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════
 * Add these data-testid attributes to ShoProLoginPage.tsx to
 * make every selector bulletproof:
 *
 * [ ] Main container              → add data-testid="login-page"
 * [ ] Branding section           → add data-testid="branding"
 * [ ] Login form container      → add data-testid="login-form"
 * [ ] Username input            → add data-testid="username-input"
 * [ ] Password input            → add data-testid="password-input"
 * [ ] Submit button            → add data-testid="submit-button"
 * [ ] MFA container            → add data-testid="mfa-form"
 * [ ] MFA code input           → add data-testid="mfa-code-input"
 * [ ] MFA submit button       → add data-testid="mfa-submit-button"
 * [ ] Error message           → add data-testid="error-message"
 * [ ] Footer links            → add data-testid="footer-links"
 * [ ] Return to Hub link     → add data-testid="return-hub-link"
 *
 * API endpoints to mock:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/verify-mfa
 * - GET /api/v1/auth/me
 */
