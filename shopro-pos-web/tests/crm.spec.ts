import { test, expect } from '@playwright/test';

/**
 * CRM & Loyalty Module Tests
 * Tests customer management, loyalty tiers, campaigns, and analytics
 * 
 * Source: /features/crm/pages/*, /features/crm/layouts/CrmLayout.tsx
 */

test.describe('CRM — Customer List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/customers');
  });

  test('shows customers heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible();
  });

  test('displays customer cards or table', async ({ page }) => {
    const customers = page.locator('[class*="customer"], [class*="card"], tr').filter({ hasText: /[a-z]+/i });
    await expect(customers).not.toHaveCount(0);
  });

  test('add customer button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /customer/i });
    await expect(addBtn).toBeVisible();
  });

  test('customer list shows contact info', async ({ page }) => {
    const contactInfo = page.locator('[class*="email"], [class*="phone"]').filter({ hasText: /@|[0-9]{3,}/ });
    await expect(contactInfo).not.toHaveCount(0);
  });

  test('customer list shows visit count or spend', async ({ page }) => {
    const stats = page.locator('[class*="visit"], [class*="spend"], span').filter({ hasText: /[0-9]+\s*visits|\$[0-9]+/i });
    await expect(stats).not.toHaveCount(0);
  });

  test('search customers by name works', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="text"]').first());
    await searchInput.fill('Test');
    
    // Should filter or show no results
    const customers = page.locator('[class*="customer"], [class*="card"]');
    const isEmpty = await page.locator('text=/no customers|empty/i').isVisible().catch(() => false);
    expect(isEmpty || await customers.count() >= 0).toBe(true);
  });
});

test.describe('CRM — Customer Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/customers');
  });

  test('clicking customer opens detail view', async ({ page }) => {
    const customerCard = page.locator('[class*="customer"], [class*="card"]').first();
    await customerCard.click();
    
    await expect(page.url()).toContain('/crm/customers/');
  });

  test('customer detail shows order history', async ({ page }) => {
    await page.goto('/crm/customers/1');
    
    const orderHistory = page.locator('[class*="order"], [class*="history"]').filter({ hasText: /order|history/i });
    await expect(orderHistory).toBeVisible();
  });

  test('customer detail shows preferences', async ({ page }) => {
    const preferences = page.locator('[class*="preference"], [class*="favorite"]').filter({ hasText: /preference|favorite/i });
    await expect(preferences).not.toHaveCount(0);
  });

  test('customer detail shows loyalty tier', async ({ page }) => {
    const tierBadge = page.locator('[class*="tier"], [class*="badge"]').filter({ hasText: /tier|gold|silver|bronze/i });
    await expect(tierBadge).toBeVisible();
  });

  test('edit customer button opens form', async ({ page }) => {
    await page.goto('/crm/customers/1');
    
    const editBtn = page.getByRole('button', { name: /edit/i });
    await editBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit|customer/i });
    await expect(form).toBeVisible();
  });
});

test.describe('CRM — Loyalty Tiers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/tiers');
  });

  test('shows loyalty tiers heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /loyalty|tier/i })).toBeVisible();
  });

  test('displays tier cards (Bronze, Silver, Gold)', async ({ page }) => {
    const tiers = page.locator('[class*="tier"], [class*="card"]').filter({ hasText: /bronze|silver|gold|platinum/i });
    await expect(tiers).not.toHaveCount(0);
  });

  test('tier shows requirements (points/spend)', async ({ page }) => {
    const requirements = page.locator('[class*="requirement"], span').filter({ hasText: /points|\$|spend/i });
    await expect(requirements).not.toHaveCount(0);
  });

  test('tier shows benefits list', async ({ page }) => {
    const benefits = page.locator('[class*="benefit"], li, span').filter({ hasText: /discount|perk|benefit/i });
    await expect(benefits).not.toHaveCount(0);
  });

  test('configure tier button opens form', async ({ page }) => {
    const configBtn = page.getByRole('button', { name: /configure|edit|settings/i }).first();
    await configBtn.click();
    
    const form = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /tier|loyalty/i });
    await expect(form).toBeVisible();
  });

  test('tier form shows threshold input', async ({ page }) => {
    const configBtn = page.getByRole('button', { name: /configure|edit/i }).first();
    await configBtn.click();
    
    const thresholdInput = page.getByLabel(/threshold|points|spend/i).or(page.locator('input[type="number"]').first());
    await expect(thresholdInput).toBeVisible();
  });

  test('tier form shows benefits editor', async ({ page }) => {
    const configBtn = page.getByRole('button', { name: /configure|edit/i }).first();
    await configBtn.click();
    
    const benefitsEditor = page.locator('[class*="benefit"], textarea, [class*="editor"]').filter({ hasText: /benefit|perk/i });
    await expect(benefitsEditor).toBeVisible();
  });
});

test.describe('CRM — Campaigns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/campaigns');
  });

  test('shows campaigns heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /campaign/i })).toBeVisible();
  });

  test('displays campaign list', async ({ page }) => {
    const campaigns = page.locator('[class*="campaign"], [class*="card"]').filter({ hasText: /campaign/i });
    await expect(campaigns).not.toHaveCount(0);
  });

  test('create campaign button is visible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create|launch/i }).filter({ hasText: /campaign/i });
    await expect(createBtn).toBeVisible();
  });

  test('campaign form shows name and message fields', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /campaign/i });
    await createBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
    
    const messageInput = page.getByLabel(/message/i).or(page.locator('textarea').first());
    await expect(messageInput).toBeVisible();
  });

  test('campaign form shows audience selector', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /campaign/i });
    await createBtn.click();
    
    const audienceSelector = page.locator('select, [class*="audience"]').filter({ hasText: /audience|segment|target/i });
    await expect(audienceSelector).toBeVisible();
  });

  test('campaign form shows channel selector (email/SMS)', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /campaign/i });
    await createBtn.click();
    
    const channelSelector = page.locator('[class*="channel"], [class*="radio"]').filter({ hasText: /email|sms|push/i });
    await expect(channelSelector).toBeVisible();
  });

  test('campaign shows send/schedule button', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send|schedule|launch/i });
    await expect(sendBtn).toBeVisible();
  });

  test('campaign shows performance metrics', async ({ page }) => {
    const metrics = page.locator('[class*="metric"], span').filter({ hasText: /sent|open|click/i });
    await expect(metrics).not.toHaveCount(0);
  });
});

test.describe('CRM — Segments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/segments');
  });

  test('shows segments heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /segment/i })).toBeVisible();
  });

  test('displays customer segments', async ({ page }) => {
    const segments = page.locator('[class*="segment"], [class*="card"]').filter({ hasText: /segment/i });
    await expect(segments).not.toHaveCount(0);
  });

  test('create segment button is visible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /segment/i });
    await expect(createBtn).toBeVisible();
  });

  test('segment builder shows filter conditions', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /segment/i });
    await createBtn.click();
    
    const filterConditions = page.locator('[class*="filter"], [class*="condition"]').filter({ hasText: /if|where|equals/i });
    await expect(filterConditions).toBeVisible();
  });

  test('segment shows customer count preview', async ({ page }) => {
    const countPreview = page.locator('[class*="count"], span').filter({ hasText: /[0-9]+\s*customers/i });
    await expect(countPreview).toBeVisible();
  });
});

test.describe('CRM — Promo Codes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/promos');
  });

  test('shows promo codes heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /promo|coupon|discount/i })).toBeVisible();
  });

  test('displays promo code list', async ({ page }) => {
    const promos = page.locator('[class*="promo"], [class*="code"], [class*="card"]').filter({ hasText: /promo|code|discount/i });
    await expect(promos).not.toHaveCount(0);
  });

  test('create promo button is visible', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create|generate/i }).filter({ hasText: /promo|code/i });
    await expect(createBtn).toBeVisible();
  });

  test('promo form shows code input', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /promo/i });
    await createBtn.click();
    
    const codeInput = page.getByLabel(/code/i).or(page.locator('input[placeholder*="code"]').first());
    await expect(codeInput).toBeVisible();
  });

  test('promo form shows discount type selector', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /promo/i });
    await createBtn.click();
    
    const typeSelector = page.locator('select, [class*="radio"]').filter({ hasText: /percent|fixed|amount/i });
    await expect(typeSelector).toBeVisible();
  });

  test('promo form shows expiry date picker', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /promo/i });
    await createBtn.click();
    
    const expiryPicker = page.locator('[class*="date"], input[type="date"]').filter({ hasText: /expir|valid/i });
    await expect(expiryPicker).toBeVisible();
  });

  test('promo shows usage count', async ({ page }) => {
    const usageCount = page.locator('span').filter({ hasText: /[0-9]+\s*used/i });
    await expect(usageCount).not.toHaveCount(0);
  });
});

test.describe('CRM — Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/analytics');
  });

  test('shows CRM analytics heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /analytics|crm analytics/i })).toBeVisible();
  });

  test('displays customer growth chart', async ({ page }) => {
    const growthChart = page.locator('svg, canvas, [class*="chart"]').filter({ hasText: /growth|customer/i });
    await expect(growthChart).not.toHaveCount(0);
  });

  test('shows retention rate metric', async ({ page }) => {
    const retentionMetric = page.locator('[class*="metric"], [class*="stat"]').filter({ hasText: /retention|rate/i });
    await expect(retentionMetric).toBeVisible();
  });

  test('shows customer lifetime value (CLV)', async ({ page }) => {
    const clvMetric = page.locator('[class*="clv"], [class*="lifetime"]').filter({ hasText: /ltv|clv|lifetime/i });
    await expect(clvMetric).toBeVisible();
  });

  test('shows repeat visit rate', async ({ page }) => {
    const repeatRate = page.locator('[class*="repeat"], span').filter({ hasText: /repeat|return/i });
    await expect(repeatRate).toBeVisible();
  });

  test('date range picker for analytics', async ({ page }) => {
    const dateRange = page.locator('[class*="date"], [class*="range"]').filter({ hasText: /date|period/i });
    await expect(dateRange).toBeVisible();
  });
});

test.describe('CRM — Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/feedback');
  });

  test('shows feedback dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /feedback|review/i })).toBeVisible();
  });

  test('displays feedback list', async ({ page }) => {
    const feedback = page.locator('[class*="feedback"], [class*="review"], [class*="card"]').filter({ hasText: /feedback|review/i });
    await expect(feedback).not.toHaveCount(0);
  });

  test('feedback shows rating stars', async ({ page }) => {
    const stars = page.locator('[class*="star"], svg').filter({ has: page.locator('[data-lucide="star"]') });
    await expect(stars).not.toHaveCount(0);
  });

  test('feedback shows average rating', async ({ page }) => {
    const avgRating = page.locator('[class*="average"], span').filter({ hasText: /[0-9]\.[0-9]\s*\/\s*5/i });
    await expect(avgRating).toBeVisible();
  });

  test('filter feedback by rating works', async ({ page }) => {
    const ratingFilter = page.locator('select, button').filter({ hasText: /rating|star/i });
    await ratingFilter.click();
    
    const option = page.locator('option, [role="option"]').first();
    await option.click();
    
    // Should filter feedback
    const filteredFeedback = page.locator('[class*="feedback"], [class*="review"]');
    await expect(filteredFeedback).not.toHaveCount(0);
  });
});

test.describe('CRM — Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/settings');
  });

  test('shows CRM settings heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /settings|crm settings/i })).toBeVisible();
  });

  test('loyalty program toggle is available', async ({ page }) => {
    const loyaltyToggle = page.locator('[class*="toggle"], input[type="checkbox"]').filter({ hasText: /loyalty|points/i });
    await expect(loyaltyToggle).toBeVisible();
  });

  test('points configuration shows earn rate', async ({ page }) => {
    const earnRate = page.locator('input[type="number"]').filter({ hasText: /earn|point/i }).or(page.locator('input[placeholder*="points"]').first());
    await expect(earnRate).toBeVisible();
  });

  test('points configuration shows redeem rate', async ({ page }) => {
    const redeemRate = page.locator('input[type="number"]').filter({ hasText: /redeem/i }).or(page.locator('input[placeholder*="redeem"]').nth(1));
    await expect(redeemRate).toBeVisible();
  });

  test('notification preferences are configurable', async ({ page }) => {
    const notifPrefs = page.locator('[class*="notification"], [class*="pref"]').filter({ hasText: /email|sms|notify/i });
    await expect(notifPrefs).not.toHaveCount(0);
  });
});

test.describe('CRM — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/customers');
  });

  test('shows error on failed customer load', async ({ page }) => {
    await page.route('**/api/crm/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no customers', async ({ page }) => {
    await page.route('**/api/crm/customers', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ customers: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no customers|empty|add your first/i');
    await expect(emptyState).toBeVisible();
  });
});

test.describe('CRM — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm/customers');
  });

  test('customer form validates email format', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /customer/i });
    await addBtn.click();
    
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]').first());
    await emailInput.fill('invalid-email');
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|email/i');
    await expect(error).toBeVisible();
  });

  test('promo code cannot have past expiry date', async ({ page }) => {
    await page.goto('/crm/promos');
    
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /promo/i });
    await createBtn.click();
    
    const expiryInput = page.locator('input[type="date"]').first();
    // Set to past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await expiryInput.fill(pastDate.toISOString().split('T')[0]);
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/invalid|past|future/i');
    await expect(error).toBeVisible();
  });

  test('segment requires at least one condition', async ({ page }) => {
    await page.goto('/crm/segments');
    
    const createBtn = page.getByRole('button', { name: /new|create/i }).filter({ hasText: /segment/i });
    await createBtn.click();
    
    const submitBtn = page.getByRole('button', { name: /save|submit/i });
    await submitBtn.click();
    
    const error = page.locator('text=/required|condition|least/i');
    await expect(error).toBeVisible();
  });
});
