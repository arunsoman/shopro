import { test, expect } from '@playwright/test';

/**
 * Notifications Module Tests
 * Tests notification dashboard, types, channels, routing, and logs
 * 
 * Source: /features/notifications/pages/*, /features/notifications/layouts/NotificationAdminLayout.tsx
 */

test.describe('Notifications — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/dashboard');
  });

  test('shows notifications dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /notification|dashboard/i })).toBeVisible();
  });

  test('displays notification statistics', async ({ page }) => {
    const stats = page.locator('[class*="stat"], [class*="card"]').filter({ hasText: /sent|delivered|failed/i });
    await expect(stats).not.toHaveCount(0);
  });

  test('shows notification activity chart', async ({ page }) => {
    const chart = page.locator('svg, canvas, [class*="chart"]').filter({ hasText: /activity|volume/i });
    await expect(chart).not.toHaveCount(0);
  });

  test('displays recent notifications list', async ({ page }) => {
    const recentList = page.locator('[class*="recent"], [class*="list"]').filter({ hasText: /recent|notification/i });
    await expect(recentList).not.toHaveCount(0);
  });

  test('quick send notification button is visible', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send|new|compose/i });
    await expect(sendBtn).toBeVisible();
  });
});

test.describe('Notifications — Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/types');
  });

  test('shows notification types heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /type|notification type/i })).toBeVisible();
  });

  test('displays notification type list', async ({ page }) => {
    const types = page.locator('[class*="type"], [class*="card"]').filter({ hasText: /order|reservation|alert/i });
    await expect(types).not.toHaveCount(0);
  });

  test('add notification type button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /type/i });
    await expect(addBtn).toBeVisible();
  });

  test('notification type form shows name field', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /type/i });
    await addBtn.click();
    
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[placeholder*="name"]').first());
    await expect(nameInput).toBeVisible();
  });

  test('notification type form shows template editor', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /type/i });
    await addBtn.click();
    
    const templateEditor = page.locator('[class*="template"], textarea, [class*="editor"]').filter({ hasText: /template|message/i });
    await expect(templateEditor).toBeVisible();
  });

  test('notification type shows trigger events', async ({ page }) => {
    const triggers = page.locator('[class*="trigger"], span').filter({ hasText: /trigger|event|on/i });
    await expect(triggers).not.toHaveCount(0);
  });

  test('notification type has enable/disable toggle', async ({ page }) => {
    const toggle = page.locator('[class*="toggle"], input[type="checkbox"]').first();
    await expect(toggle).toBeVisible();
  });
});

test.describe('Notifications — Channels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/channels');
  });

  test('shows notification channels heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /channel/i })).toBeVisible();
  });

  test('displays channel list (Email, SMS, Push)', async ({ page }) => {
    const channels = page.locator('[class*="channel"], [class*="card"]').filter({ hasText: /email|sms|push|whatsapp/i });
    await expect(channels).not.toHaveCount(0);
  });

  test('add channel button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|connect/i }).filter({ hasText: /channel/i });
    await expect(addBtn).toBeVisible();
  });

  test('email channel shows SMTP configuration', async ({ page }) => {
    const smtpConfig = page.locator('[class*="smtp"], [class*="email"]').filter({ hasText: /smtp|host|port/i });
    await expect(smtpConfig).not.toHaveCount(0);
  });

  test('SMS channel shows provider configuration', async ({ page }) => {
    const smsConfig = page.locator('[class*="sms"], [class*="twilio"]').filter({ hasText: /twilio|provider|api/i });
    await expect(smsConfig).not.toHaveCount(0);
  });

  test('channel has test connection button', async ({ page }) => {
    const testBtn = page.getByRole('button', { name: /test|verify/i });
    await expect(testBtn).toBeVisible();
  });

  test('channel shows status indicator', async ({ page }) => {
    const statusIndicator = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /active|inactive|connected/i });
    await expect(statusIndicator).not.toHaveCount(0);
  });
});

test.describe('Notifications — Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/routing');
  });

  test('shows notification routing heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /routing|rule/i })).toBeVisible();
  });

  test('displays routing rules list', async ({ page }) => {
    const rules = page.locator('[class*="rule"], [class*="routing"]').filter({ hasText: /if|then|when/i });
    await expect(rules).not.toHaveCount(0);
  });

  test('add routing rule button is visible', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new|create/i }).filter({ hasText: /rule|routing/i });
    await expect(addBtn).toBeVisible();
  });

  test('routing rule builder shows condition selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /rule/i });
    await addBtn.click();
    
    const conditionSelector = page.locator('select, [class*="condition"]').filter({ hasText: /if|when|type/i });
    await expect(conditionSelector).toBeVisible();
  });

  test('routing rule builder shows channel selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /rule/i });
    await addBtn.click();
    
    const channelSelector = page.locator('select, [class*="channel"]').filter({ hasText: /email|sms|push/i });
    await expect(channelSelector).toBeVisible();
  });

  test('routing rule builder shows recipient selector', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|new/i }).filter({ hasText: /rule/i });
    await addBtn.click();
    
    const recipientSelector = page.locator('select, [class*="recipient"]').filter({ hasText: /send to|recipient|user/i });
    await expect(recipientSelector).toBeVisible();
  });

  test('routing rule has priority ordering', async ({ page }) => {
    const prioritySelector = page.locator('select, input[type="number"]').filter({ hasText: /priority|order/i });
    await expect(prioritySelector).not.toHaveCount(0);
  });
});

test.describe('Notifications — Send', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/send');
  });

  test('shows send notification heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /send|compose/i })).toBeVisible();
  });

  test('send form shows recipient selector', async ({ page }) => {
    const recipientSelector = page.locator('select, [class*="recipient"]').filter({ hasText: /send to|recipient/i });
    await expect(recipientSelector).toBeVisible();
  });

  test('send form shows channel selector', async ({ page }) => {
    const channelSelector = page.locator('select, [class*="channel"]').filter({ hasText: /email|sms|push/i });
    await expect(channelSelector).toBeVisible();
  });

  test('send form shows subject input', async ({ page }) => {
    const subjectInput = page.getByLabel(/subject/i).or(page.locator('input[placeholder*="subject"]').first());
    await expect(subjectInput).toBeVisible();
  });

  test('send form shows message body editor', async ({ page }) => {
    const messageEditor = page.locator('[class*="message"], textarea, [class*="editor"]').filter({ hasText: /message|body/i });
    await expect(messageEditor).toBeVisible();
  });

  test('send form shows template picker', async ({ page }) => {
    const templatePicker = page.locator('select, [class*="template"]').filter({ hasText: /template/i });
    await expect(templatePicker).toBeVisible();
  });

  test('send form has send now button', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send|send now/i });
    await expect(sendBtn).toBeVisible();
  });

  test('send form has schedule option', async ({ page }) => {
    const scheduleOption = page.locator('[class*="schedule"], input[type="datetime-local"]').filter({ hasText: /schedule|later/i });
    await expect(scheduleOption).toBeVisible();
  });
});

test.describe('Notifications — Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/logs');
  });

  test('shows notification logs heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /log|history/i })).toBeVisible();
  });

  test('displays notification log table', async ({ page }) => {
    const logTable = page.locator('table, tr, [class*="log"]').filter({ hasText: /sent|delivered|failed/i });
    await expect(logTable).not.toHaveCount(0);
  });

  test('log shows timestamp', async ({ page }) => {
    const timestamps = page.locator('td, span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}/ });
    await expect(timestamps).not.toHaveCount(0);
  });

  test('log shows delivery status', async ({ page }) => {
    const statuses = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /sent|delivered|failed|pending/i });
    await expect(statuses).not.toHaveCount(0);
  });

  test('filter logs by status works', async ({ page }) => {
    const statusFilter = page.locator('select, button').filter({ hasText: /status|all/i });
    await statusFilter.click();
    
    const option = page.locator('option, [role="option"]').first();
    await option.click();
    
    const filteredLogs = page.locator('table, tr');
    await expect(filteredLogs).not.toHaveCount(0);
  });

  test('log entry shows error details on failure', async ({ page }) => {
    const errorDetails = page.locator('[class*="error"], span').filter({ hasText: /error|failed|reason/i });
    await expect(errorDetails).not.toHaveCount(0);
  });

  test('export logs button is available', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|csv/i });
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Notifications — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/dashboard');
  });

  test('shows error on failed notifications load', async ({ page }) => {
    await page.route('**/api/notifications/*', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no notifications', async ({ page }) => {
    await page.route('**/api/notifications/dashboard', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ stats: {}, recent: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no notifications|empty/i');
    await expect(emptyState).toBeVisible();
  });
});

test.describe('Notifications — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/notifications/send');
  });

  test('send form validates recipient is selected', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send/i });
    await sendBtn.click();
    
    const error = page.locator('text=/required|select recipient/i');
    await expect(error).toBeVisible();
  });

  test('send form validates message is not empty', async ({ page }) => {
    const recipientSelector = page.locator('select').first();
    await recipientSelector.selectOption('1');
    
    const sendBtn = page.getByRole('button', { name: /send/i });
    await sendBtn.click();
    
    const error = page.locator('text=/required|message/i');
    await expect(error).toBeVisible();
  });

  test('cannot send to invalid email', async ({ page }) => {
    const recipientInput = page.getByLabel(/email/i).or(page.locator('input[type="email"]').first());
    await recipientInput.fill('invalid-email');
    
    const sendBtn = page.getByRole('button', { name: /send/i });
    await sendBtn.click();
    
    const error = page.locator('text=/invalid|email/i');
    await expect(error).toBeVisible();
  });
});
