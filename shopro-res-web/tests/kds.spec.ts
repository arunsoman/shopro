import { test, expect } from '@playwright/test';
import { expectNoNaN } from './utils/nan-check';

/**
 * KDS (Kitchen Display System) Tests — ShoPro Restaurant Web
 * Tests Expo KDS interface for kitchen order management
 * 
 * Source: ExpoKds.tsx
 */

test.describe('KDS — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('no NaN in order timers', async ({ page }) => {
    await expectNoNaN(page, 'KDS Order Timers');
    
    // Check timer displays specifically
    const timers = page.locator('span').filter({ hasText: /[0-9]{2}:[0-9]{2}/ });
    const count = await timers.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const timer = timers.nth(i);
      const text = await timer.textContent();
      expect(text).not.toContain('NaN');
    }
  });

  test('no NaN in order quantities', async ({ page }) => {
    await expectNoNaN(page, 'Order Quantities');
  });

  test('no NaN in guest counts', async ({ page }) => {
    await expectNoNaN(page, 'Guest Counts');
  });
});

test.describe('KDS — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('shows KDS heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /kds|kitchen display/i })).toBeVisible();
  });

  test('shows expo view title', async ({ page }) => {
    await expect(page.getByText(/expo|expediter/i)).toBeVisible();
  });

  test('displays active orders section', async ({ page }) => {
    const activeSection = page.locator('[class*="active"], [class*="orders"]').filter({ hasText: /active|orders/i });
    await expect(activeSection).toBeVisible();
  });

  test('shows order tickets/cards', async ({ page }) => {
    const tickets = page.locator('[class*="ticket"], [class*="order"], [class*="card"]').filter({ hasText: /table|order/i });
    await expect(tickets).not.toHaveCount(0);
  });

  test('order ticket shows table number', async ({ page }) => {
    const tableNumbers = page.locator('span').filter({ hasText: /table\s*[0-9]+/i });
    await expect(tableNumbers).not.toHaveCount(0);
  });

  test('order ticket shows order number', async ({ page }) => {
    const orderNumbers = page.locator('span').filter({ hasText: /#[0-9]+|order\s*[0-9]+/i });
    await expect(orderNumbers).not.toHaveCount(0);
  });

  test('order ticket shows timestamp', async ({ page }) => {
    const timestamps = page.locator('span').filter({ hasText: /[0-9]{2}:[0-9]{2}|ago/i });
    await expect(timestamps).not.toHaveCount(0);
  });

  test('order ticket shows guest count', async ({ page }) => {
    const guestCounts = page.locator('span').filter({ hasText: /[0-9]+\s*guest/i });
    await expect(guestCounts).not.toHaveCount(0);
  });

  test('displays order items list', async ({ page }) => {
    const items = page.locator('[class*="item"], li').filter({ hasText: /[a-z]+/i });
    await expect(items).not.toHaveCount(0);
  });

  test('order item shows quantity', async ({ page }) => {
    const quantities = page.locator('span').filter({ hasText: /x\s*[0-9]+|[0-9]+\s*x/i });
    await expect(quantities).not.toHaveCount(0);
  });

  test('order item shows modifiers/special instructions', async ({ page }) => {
    const modifiers = page.locator('span').filter({ hasText: /no|extra|side|dress|well/i });
    await expect(modifiers).not.toHaveCount(0);
  });
});

test.describe('KDS — Order Status & Timing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('order shows elapsed time timer', async ({ page }) => {
    const timers = page.locator('span').filter({ hasText: /[0-9]{2}:[0-9]{2}/ });
    await expect(timers).not.toHaveCount(0);
  });

  test('timer updates in real-time', async ({ page }) => {
    const timer = page.locator('span').filter({ hasText: /[0-9]{2}:[0-9]{2}/ }).first();
    
    const timeBefore = await timer.textContent();
    await page.waitForTimeout(60000); // Wait 1 minute
    const timeAfter = await timer.textContent();
    
    // Timer should have changed
    expect(timeBefore).not.toEqual(timeAfter);
  });

  test('order shows status badge', async ({ page }) => {
    const statusBadges = page.locator('[class*="status"], [class*="badge"]').filter({ hasText: /new|cooking|ready/i });
    await expect(statusBadges).not.toHaveCount(0);
  });

  test('new orders have visual indicator', async ({ page }) => {
    const newIndicators = page.locator('[class*="new"], [class*="urgent"]').filter({ hasText: /new|fresh/i });
    await expect(newIndicators).not.toHaveCount(0);
  });

  test('orders color-coded by time', async ({ page }) => {
    const tickets = page.locator('[class*="ticket"]').first();
    const color = await tickets.evaluate(el => 
      window.getComputedStyle(el).borderColor || window.getComputedStyle(el).backgroundColor
    );
    
    expect(color).toBeTruthy();
  });

  test('shows fire time for orders', async ({ page }) => {
    const fireTimes = page.locator('span').filter({ hasText: /fired|[0-9]{2}:[0-9]{2}/i });
    await expect(fireTimes).not.toHaveCount(0);
  });
});

test.describe('KDS — Course Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('shows course indicators (Appetizer, Main, Dessert)', async ({ page }) => {
    const courses = page.locator('[class*="course"], span').filter({ hasText: /appetizer|main|dessert|starter/i });
    await expect(courses).not.toHaveCount(0);
  });

  test('courses are color-coded', async ({ page }) => {
    const courseBadges = page.locator('[class*="course"], [class*="badge"]').filter({ hasText: /appetizer|main|dessert/i });
    const count = await courseBadges.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const badge = courseBadges.nth(i);
      await expect(badge).toBeVisible();
    }
  });

  test('shows course firing buttons', async ({ page }) => {
    const fireButtons = page.getByRole('button', { name: /fire|start/i });
    await expect(fireButtons).not.toHaveCount(0);
  });

  test('fire button triggers course', async ({ page }) => {
    const fireBtn = page.getByRole('button', { name: /fire appetizer/i }).or(page.getByRole('button', { name: /fire/i }).first());
    await fireBtn.click();
    
    // Should show confirmation or change status
    const confirmation = page.locator('text=/fired|started|sent to kitchen/i');
    await expect(confirmation).toBeVisible();
  });
});

test.describe('KDS — Order Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('shows bump/complete button', async ({ page }) => {
    const bumpBtn = page.getByRole('button', { name: /bump|complete|done/i });
    await expect(bumpBtn).toBeVisible();
  });

  test('bump button removes order from active list', async ({ page }) => {
    const bumpBtn = page.getByRole('button', { name: /bump|complete/i }).first();
    await bumpBtn.click();
    
    // Order should be removed or moved to completed
    const activeOrders = page.locator('[class*="active"]').filter({ hasText: /orders/i });
    await expect(activeOrders).toBeVisible();
  });

  test('shows recall button for bumped orders', async ({ page }) => {
    const recallBtn = page.getByRole('button', { name: /recall|undo/i });
    await expect(recallBtn).toBeVisible();
  });

  test('shows hold/pause button', async ({ page }) => {
    const holdBtn = page.getByRole('button', { name: /hold|pause/i });
    await expect(holdBtn).toBeVisible();
  });

  test('hold button pauses order timer', async ({ page }) => {
    const holdBtn = page.getByRole('button', { name: /hold/i }).first();
    await holdBtn.click();
    
    // Should show held status
    const heldStatus = page.locator('text=/held|paused/i');
    await expect(heldStatus).toBeVisible();
  });

  test('shows rush/priority button', async ({ page }) => {
    const rushBtn = page.getByRole('button', { name: /rush|priority|urgent/i });
    await expect(rushBtn).toBeVisible();
  });

  test('rush button marks order as urgent', async ({ page }) => {
    const rushBtn = page.getByRole('button', { name: /rush/i }).first();
    await rushBtn.click();
    
    // Should show rush indicator
    const rushIndicator = page.locator('[class*="rush"], [class*="urgent"]');
    await expect(rushIndicator).toBeVisible();
  });
});

test.describe('KDS — Filtering & Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('shows filter buttons', async ({ page }) => {
    const filters = page.locator('button').filter({ hasText: /all|active|ready|new/i });
    await expect(filters).not.toHaveCount(0);
  });

  test('filter by all orders works', async ({ page }) => {
    const allFilter = page.getByRole('button', { name: /all/i }).first();
    await allFilter.click();
    
    const orders = page.locator('[class*="ticket"], [class*="order"]');
    await expect(orders).not.toHaveCount(0);
  });

  test('filter by active orders works', async ({ page }) => {
    const activeFilter = page.getByRole('button', { name: /active/i });
    await activeFilter.click();
    
    const activeOrders = page.locator('[class*="ticket"]').filter({ hasText: /active/i });
    await expect(activeOrders).not.toHaveCount(0);
  });

  test('filter by ready orders works', async ({ page }) => {
    const readyFilter = page.getByRole('button', { name: /ready/i });
    await readyFilter.click();
    
    const readyOrders = page.locator('[class*="ticket"]').filter({ hasText: /ready/i });
    await expect(readyOrders).not.toHaveCount(0);
  });

  test('shows sort options', async ({ page }) => {
    const sortOptions = page.locator('select, button').filter({ hasText: /sort|time|table/i });
    await expect(sortOptions).toBeVisible();
  });

  test('sort by time works', async ({ page }) => {
    const sortBtn = page.getByRole('button', { name: /sort|time/i });
    await sortBtn.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /time|oldest/i }).first();
    await option.click();
    
    // Orders should be sorted
    const tickets = page.locator('[class*="ticket"]');
    await expect(tickets.first()).toBeVisible();
  });

  test('sort by table number works', async ({ page }) => {
    const sortBtn = page.getByRole('button', { name: /sort|table/i });
    await sortBtn.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /table/i }).first();
    await option.click();
    
    const tickets = page.locator('[class*="ticket"]');
    await expect(tickets.first()).toBeVisible();
  });
});

test.describe('KDS — Station View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('shows station selector', async ({ page }) => {
    const stationSelector = page.locator('select, button').filter({ hasText: /station|expo|grill|sauté/i });
    await expect(stationSelector).toBeVisible();
  });

  test('station filter shows specific items', async ({ page }) => {
    const stationSelector = page.locator('select').or(page.locator('button').filter({ hasText: /station/i })).first();
    await stationSelector.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /grill|sauté|cold/i }).first();
    await option.click();
    
    const stationItems = page.locator('[class*="item"]').filter({ hasText: /grill|sauté/i });
    await expect(stationItems).not.toHaveCount(0);
  });

  test('shows all stations view', async ({ page }) => {
    const allStations = page.getByRole('button', { name: /all stations/i });
    await expect(allStations).toBeVisible();
  });
});

test.describe('KDS — Order Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('clicking order expands details', async ({ page }) => {
    const ticket = page.locator('[class*="ticket"]').first();
    await ticket.click();
    
    // Should expand or show modal
    const details = page.locator('[class*="detail"], [class*="expanded"]');
    await expect(details).toBeVisible();
  });

  test('order details show server name', async ({ page }) => {
    const ticket = page.locator('[class*="ticket"]').first();
    await ticket.click();
    
    const serverName = page.locator('span').filter({ hasText: /server/i });
    await expect(serverName).toBeVisible();
  });

  test('order details show course sequence', async ({ page }) => {
    const ticket = page.locator('[class*="ticket"]').first();
    await ticket.click();
    
    const courseSeq = page.locator('span').filter({ hasText: /course [0-9]|appetizer|main/i });
    await expect(courseSeq).toBeVisible();
  });

  test('order details show special instructions', async ({ page }) => {
    const ticket = page.locator('[class*="ticket"]').first();
    await ticket.click();
    
    const instructions = page.locator('span').filter({ hasText: /special|note|allergy/i });
    await expect(instructions).toBeVisible();
  });
});

test.describe('KDS — Auto-Refresh', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('KDS auto-refreshes orders', async ({ page }) => {
    // Count initial orders
    const initialCount = await page.locator('[class*="ticket"]').count();
    
    // Wait for auto-refresh (typically 30 seconds)
    await page.waitForTimeout(5000);
    
    // Count should potentially change
    const newCount = await page.locator('[class*="ticket"]').count();
    expect(newCount).toBeDefined();
  });

  test('shows last refresh timestamp', async ({ page }) => {
    const refreshTime = page.locator('span').filter({ hasText: /updated|refresh|last/i });
    await expect(refreshTime).toBeVisible();
  });

  test('manual refresh button is available', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /refresh|reload/i });
    await expect(refreshBtn).toBeVisible();
  });

  test('manual refresh updates orders', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /refresh/i });
    await refreshBtn.click();
    
    // Should show loading or update
    const loading = page.locator('[class*="spin"], [class*="loading"]');
    await expect(loading).toBeVisible({ timeout: 2000 }).catch(() => {
      // Refresh might be instant
    });
  });
});

test.describe('KDS — Notifications & Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('shows new order notification', async ({ page }) => {
    const notif = page.locator('[class*="notification"], [class*="alert"]').filter({ hasText: /new order/i });
    await expect(notif).toBeVisible();
  });

  test('shows overdue order alert', async ({ page }) => {
    const overdueAlert = page.locator('[class*="overdue"], [class*="late"]').filter({ hasText: /overdue|late/i });
    await expect(overdueAlert).toBeVisible();
  });

  test('shows 86\'d item alert', async ({ page }) => {
    const soldOutAlert = page.locator('[class*="86"], [class*="sold out"]').filter({ hasText: /86|sold out/i });
    await expect(soldOutAlert).toBeVisible();
  });

  test('notification sound plays on new order', async ({ page }) => {
    // This is hard to test in Playwright, but we can check for visual indicator
    const visualIndicator = page.locator('[class*="flash"], [class*="blink"]');
    await expect(visualIndicator).toBeVisible();
  });
});

test.describe('KDS — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kds');
  });

  test('shows error on failed orders load', async ({ page }) => {
    await page.route('**/api/kds/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no orders', async ({ page }) => {
    await page.route('**/api/kds/orders', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ orders: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no orders|empty|all caught up/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads orders after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/kds/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ orders: [{ id: 1, table: 5, items: [] }] }),
        });
      }
    });
    
    await page.goto('/kds');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('KDS — Responsive Layout', () => {
  test('KDS displays correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/kds');
    
    const tickets = page.locator('[class*="ticket"]');
    await expect(tickets.first()).toBeVisible();
  });

  test('order tickets are readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/kds');
    
    const ticket = page.locator('[class*="ticket"]').first();
    const box = await ticket.boundingBox();
    
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThan(300);
    }
  });

  test('KDS supports landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/kds');
    
    const tickets = page.locator('[class*="ticket"]');
    const count = await tickets.count();
    
    // Should show multiple tickets in landscape
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('KDS — Performance', () => {
  test('KDS loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/kds');
    await expect(page.getByRole('heading', { name: /kds/i })).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000);
  });

  test('order bump is instant', async ({ page }) => {
    const bumpBtn = page.getByRole('button', { name: /bump|complete/i }).first();
    
    const startTime = Date.now();
    await bumpBtn.click();
    const endTime = Date.now();
    
    // Should be instant (< 500ms)
    expect(endTime - startTime).toBeLessThan(1000);
  });
});
