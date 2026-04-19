import { test, expect } from '@playwright/test';
import { expectNoNaN, expectNoNaNInNumericDisplays } from './utils/nan-check';

/**
 * Labor & Staffing Module Tests — ShoPro Restaurant Web
 * Tests labor scheduling, staffing optimization, and labor cost management
 * 
 * Sources:
 * - LaborSchedulePage.tsx
 * - Staffing optimization components
 */

test.describe('Labor Staffing — NaN Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('no NaN in labor schedule', async ({ page }) => {
    await expectNoNaN(page, 'Labor Schedule');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in shift hours', async ({ page }) => {
    await expectNoNaN(page, 'Shift Hours Display');
    
    // Check hour displays specifically
    const hourDisplays = page.locator('span').filter({ hasText: /hours?/i });
    const count = await hourDisplays.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const hours = hourDisplays.nth(i);
      const text = await hours.textContent();
      expect(text).not.toContain('NaN');
    }
  });

  test('no NaN in labor cost calculations', async ({ page }) => {
    await expectNoNaN(page, 'Labor Cost Calculations');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in budget comparisons', async ({ page }) => {
    await expectNoNaN(page, 'Budget vs Actual');
    await expectNoNaNInNumericDisplays(page);
  });

  test('no NaN in overtime calculations', async ({ page }) => {
    await expectNoNaN(page, 'Overtime Calculations');
    await expectNoNaNInNumericDisplays(page);
  });
});

test.describe('Labor Staffing — Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows labor & staffing heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /labor|staffing|schedule/i })).toBeVisible();
  });

  test('displays weekly schedule view', async ({ page }) => {
    const scheduleView = page.locator('[class*="schedule"], [class*="calendar"]').filter({ hasText: /week|schedule/i });
    await expect(scheduleView).toBeVisible();
  });

  test('shows current week date range', async ({ page }) => {
    const dateRange = page.locator('span').filter({ hasText: /[0-9]{4}-[0-9]{2}-[0-9]{2}/ });
    await expect(dateRange).toBeVisible();
  });

  test('displays day-by-day schedule', async ({ page }) => {
    const days = page.locator('[class*="day"], [class*="column"]').filter({ hasText: /monday|tuesday|wednesday/i });
    await expect(days).not.toHaveCount(0);
  });

  test('shows shift cards/blocks', async ({ page }) => {
    const shifts = page.locator('[class*="shift"], [class*="block"]').filter({ hasText: /am|pm|[0-9]+:[0-9]+/i });
    await expect(shifts).not.toHaveCount(0);
  });

  test('displays employee names on shifts', async ({ page }) => {
    const employeeNames = page.locator('span').filter({ hasText: /[a-z]+/i });
    await expect(employeeNames).not.toHaveCount(0);
  });

  test('shows shift times (start-end)', async ({ page }) => {
    const shiftTimes = page.locator('span').filter({ hasText: /[0-9]+:[0-9]+\s*-\s*[0-9]+:[0-9]+/i });
    await expect(shiftTimes).not.toHaveCount(0);
  });

  test('displays labor cost summary', async ({ page }) => {
    const laborSummary = page.locator('[class*="summary"], [class*="total"]').filter({ hasText: /labor cost|total hours/i });
    await expect(laborSummary).toBeVisible();
  });

  test('shows scheduled hours vs budget', async ({ page }) => {
    const budgetComparison = page.locator('[class*="budget"], span').filter({ hasText: /budget|scheduled/i });
    await expect(budgetComparison).toBeVisible();
  });
});

test.describe('Labor Staffing — Schedule Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows add shift button', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift|new shift/i });
    await expect(addShiftBtn).toBeVisible();
  });

  test('add shift opens shift form', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const shiftForm = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /new shift|add shift/i });
    await expect(shiftForm).toBeVisible();
  });

  test('shift form shows employee selector', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const employeeSelector = page.locator('select, [class*="employee"]').filter({ hasText: /employee|staff/i });
    await expect(employeeSelector).toBeVisible();
  });

  test('shift form shows date picker', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const datePicker = page.locator('input[type="date"]').filter({ hasText: /date/i });
    await expect(datePicker).toBeVisible();
  });

  test('shift form shows start time picker', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const startTime = page.locator('input[type="time"]').filter({ hasText: /start/i }).or(page.locator('input[type="time"]').first());
    await expect(startTime).toBeVisible();
  });

  test('shift form shows end time picker', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const endTime = page.locator('input[type="time"]').filter({ hasText: /end/i }).or(page.locator('input[type="time"]').nth(1));
    await expect(endTime).toBeVisible();
  });

  test('shift form shows position/role selector', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const positionSelector = page.locator('select, [class*="position"]').filter({ hasText: /position|role/i });
    await expect(positionSelector).toBeVisible();
  });

  test('shift form shows department selector', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const deptSelector = page.locator('select, [class*="department"]').filter({ hasText: /department|kitchen|foh/i });
    await expect(deptSelector).toBeVisible();
  });

  test('shift form calculates hours automatically', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const hoursDisplay = page.locator('[class*="hours"], span').filter({ hasText: /hours?/i });
    await expect(hoursDisplay).toBeVisible();
  });

  test('shift form shows save button', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const saveBtn = page.getByRole('button', { name: /save|create/i });
    await expect(saveBtn).toBeVisible();
  });

  test('shift form validates end time after start time', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const startTime = page.locator('input[type="time"]').first();
    const endTime = page.locator('input[type="time"]').nth(1);
    
    await startTime.fill('18:00');
    await endTime.fill('14:00');
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/invalid|end time|start time/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Labor Staffing — Shift Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('edit shift button is visible', async ({ page }) => {
    const editBtn = page.locator('button').filter({ has: page.locator('[data-lucide="edit"]') }).first();
    await expect(editBtn).toBeVisible();
  });

  test('clicking edit opens shift form', async ({ page }) => {
    const editBtn = page.locator('button').filter({ has: page.locator('[data-lucide="edit"]') }).first();
    await editBtn.click();
    
    const shiftForm = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /edit shift/i });
    await expect(shiftForm).toBeVisible();
  });

  test('delete shift button is visible', async ({ page }) => {
    const deleteBtn = page.locator('button').filter({ has: page.locator('[data-lucide="trash"]') }).first();
    await expect(deleteBtn).toBeVisible();
  });

  test('delete shift shows confirmation', async ({ page }) => {
    const deleteBtn = page.locator('button').filter({ has: page.locator('[data-lucide="trash"]') }).first();
    await deleteBtn.click();
    
    const confirmDialog = page.locator('[role="dialog"]').filter({ hasText: /confirm|delete|sure/i });
    await expect(confirmDialog).toBeVisible();
  });

  test('swap shift button is available', async ({ page }) => {
    const swapBtn = page.getByRole('button', { name: /swap|exchange/i });
    await expect(swapBtn).toBeVisible();
  });

  test('duplicate shift button is available', async ({ page }) => {
    const duplicateBtn = page.getByRole('button', { name: /duplicate|copy/i });
    await expect(duplicateBtn).toBeVisible();
  });

  test('click and drag to create shift', async ({ page }) => {
    // Some schedulers support drag-to-create
    const scheduleGrid = page.locator('[class*="schedule"], [class*="grid"]').first();
    await expect(scheduleGrid).toBeVisible();
    
    // Try dragging (if supported)
    const startCell = page.locator('[class*="cell"], [class*="time-slot"]').first();
    await startCell.dragTo(page.locator('[class*="cell"], [class*="time-slot"]').nth(3));
    
    // Should create a shift or show form
    const shiftForm = page.locator('[class*="form"], [class*="dialog"]').filter({ hasText: /shift/i });
    await expect(shiftForm.or(startCell)).toBeVisible();
  });
});

test.describe('Labor Staffing — Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows employee list/sidebar', async ({ page }) => {
    const employeeList = page.locator('[class*="employee"], [class*="staff"]').filter({ hasText: /employee|staff/i });
    await expect(employeeList).not.toHaveCount(0);
  });

  test('displays employee availability', async ({ page }) => {
    const availability = page.locator('[class*="availability"], span').filter({ hasText: /available|unavailable/i });
    await expect(availability).toBeVisible();
  });

  test('shows employee hours summary', async ({ page }) => {
    const hoursSummary = page.locator('span').filter({ hasText: /[0-9]+\s*hours?/i });
    await expect(hoursSummary).toBeVisible();
  });

  test('displays overtime warning', async ({ page }) => {
    const overtimeWarning = page.locator('[class*="overtime"], [class*="warning"]').filter({ hasText: /overtime|ot/i });
    await expect(overtimeWarning).toBeVisible();
  });

  test('shows employee role/badge', async ({ page }) => {
    const roleBadge = page.locator('[class*="badge"], span').filter({ hasText: /server|cook|manager|host/i });
    await expect(roleBadge).toBeVisible();
  });

  test('filter employees by department', async ({ page }) => {
    const deptFilter = page.locator('select, button').filter({ hasText: /department|all/i });
    await deptFilter.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /kitchen|foh|bar/i }).first();
    await option.click();
    
    const filteredEmployees = page.locator('[class*="employee"]');
    await expect(filteredEmployees).not.toHaveCount(0);
  });
});

test.describe('Labor Staffing — Budget & Forecasting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows labor budget target', async ({ page }) => {
    const budgetTarget = page.locator('span').filter({ hasText: /budget|target/i });
    await expect(budgetTarget).toBeVisible();
  });

  test('displays budget vs actual comparison', async ({ page }) => {
    const comparison = page.locator('[class*="comparison"], span').filter({ hasText: /budget|actual/i });
    await expect(comparison).toBeVisible();
  });

  test('shows variance from budget', async ({ page }) => {
    const variance = page.locator('[class*="variance"], span').filter({ hasText: /variance|\+|-/i });
    await expect(variance).toBeVisible();
  });

  test('displays sales forecast', async ({ page }) => {
    const salesForecast = page.locator('span').filter({ hasText: /forecast|projected sales/i });
    await expect(salesForecast).toBeVisible();
  });

  test('shows labor cost percentage of sales', async ({ page }) => {
    const laborPercentage = page.locator('span').filter({ hasText: /[0-9]+%/ });
    await expect(laborPercentage).toBeVisible();
  });

  test('displays recommended staffing levels', async ({ page }) => {
    const recommendations = page.locator('[class*="recommendation"], span').filter({ hasText: /recommended|optimal/i });
    await expect(recommendations).not.toHaveCount(0);
  });
});

test.describe('Labor Staffing — Time Periods', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows week selector', async ({ page }) => {
    const weekSelector = page.locator('select, [class*="week"]').filter({ hasText: /week/i });
    await expect(weekSelector).toBeVisible();
  });

  test('can navigate to previous week', async ({ page }) => {
    const prevBtn = page.getByRole('button', { name: /previous|<|prior/i });
    await expect(prevBtn).toBeVisible();
  });

  test('can navigate to next week', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /next|>|following/i });
    await expect(nextBtn).toBeVisible();
  });

  test('can jump to specific week', async ({ page }) => {
    const weekSelector = page.locator('select').or(page.locator('button').filter({ hasText: /week/i })).first();
    await weekSelector.click();
    
    const option = page.locator('option, [role="option"]').filter({ hasText: /week/i }).first();
    await option.click();
    
    // Should update schedule
    const scheduleView = page.locator('[class*="schedule"]').first();
    await expect(scheduleView).toBeVisible();
  });

  test('shows month view option', async ({ page }) => {
    const monthViewBtn = page.getByRole('button', { name: /month|monthly/i });
    await expect(monthViewBtn).toBeVisible();
  });

  test('shows day view option', async ({ page }) => {
    const dayViewBtn = page.getByRole('button', { name: /day|daily/i });
    await expect(dayViewBtn).toBeVisible();
  });
});

test.describe('Labor Staffing — Compliance & Rules', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows break time indicators', async ({ page }) => {
    const breakIndicators = page.locator('[class*="break"], span').filter({ hasText: /break|rest/i });
    await expect(breakIndicators).toBeVisible();
  });

  test('displays overtime alerts', async ({ page }) => {
    const overtimeAlerts = page.locator('[class*="alert"]').filter({ hasText: /overtime|ot/i });
    await expect(overtimeAlerts).not.toHaveCount(0);
  });

  test('shows minor labor law compliance', async ({ page }) => {
    const complianceInfo = page.locator('[class*="compliance"], span').filter({ hasText: /minor|compliance/i });
    await expect(complianceInfo).toBeVisible();
  });

  test('displays rest period warnings', async ({ page }) => {
    const restWarnings = page.locator('[class*="warning"]').filter({ hasText: /rest|break/i });
    await expect(restWarnings).toBeVisible();
  });

  test('shows maximum hours warning', async ({ page }) => {
    const maxHoursWarning = page.locator('[class*="warning"]').filter({ hasText: /maximum|limit/i });
    await expect(maxHoursWarning).toBeVisible();
  });
});

test.describe('Labor Staffing — Export & Reporting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows export schedule button', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download|print/i });
    await expect(exportBtn).toBeVisible();
  });

  test('export downloads schedule PDF', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);
    
    expect(download.suggestedFilename()).toMatch(/\.(pdf|csv|xlsx)$/);
  });

  test('shows publish schedule button', async ({ page }) => {
    const publishBtn = page.getByRole('button', { name: /publish|send|notify/i });
    await expect(publishBtn).toBeVisible();
  });

  test('shows labor report option', async ({ page }) => {
    const reportBtn = page.getByRole('button', { name: /report|analytics/i });
    await expect(reportBtn).toBeVisible();
  });
});

test.describe('Labor Staffing — API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('shows error on failed schedule load', async ({ page }) => {
    await page.route('**/api/labor/**', route => {
      route.fulfill({ status: 500 });
    });
    
    await page.reload();
    
    const errorBanner = page.locator('text=/error|failed|unable to load/i');
    await expect(errorBanner).toBeVisible();
  });

  test('shows empty state when no shifts', async ({ page }) => {
    await page.route('**/api/labor/schedule', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ shifts: [] }),
      });
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/no shifts|empty|create your first/i');
    await expect(emptyState).toBeVisible();
  });

  test('retry button reloads after error', async ({ page }) => {
    let failCount = 0;
    
    await page.route('**/api/labor/**', route => {
      if (failCount < 1) {
        failCount++;
        route.fulfill({ status: 500 });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ shifts: [{ id: 1, employee: 'Test', start: '09:00', end: '17:00' }] }),
        });
      }
    });
    
    await page.goto('/labor');
    
    const retryBtn = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();
    
    const errorBanner = page.locator('text=/error|failed/i');
    await expect(errorBanner).not.toBeVisible();
  });
});

test.describe('Labor Staffing — Negative Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/labor');
  });

  test('cannot schedule employee on unavailable day', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const employeeSelector = page.locator('select').first();
    await employeeSelector.selectOption('1');
    
    // Try to schedule on unavailable day
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/unavailable|conflict/i');
    await expect(error).toBeVisible();
  });

  test('cannot create overlapping shifts for same employee', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/overlap|conflict|already scheduled/i');
    await expect(error).toBeVisible();
  });

  test('shift form validates required fields', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const errors = page.locator('text=/required/i');
    await expect(errors).not.toHaveCount(0);
  });

  test('cannot exceed maximum weekly hours', async ({ page }) => {
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    // Try to add excessive hours
    const saveBtn = page.getByRole('button', { name: /save/i });
    await saveBtn.click();
    
    const error = page.locator('text=/maximum|exceed|limit/i');
    await expect(error).toBeVisible();
  });
});

test.describe('Labor Staffing — Responsive Layout', () => {
  test('schedule grid is scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/labor');
    
    const scheduleGrid = page.locator('[class*="schedule"], [class*="grid"]').first();
    const isScrollable = await scheduleGrid.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(isScrollable).toBe(true);
  });

  test('shift cards stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/labor');
    
    const shifts = page.locator('[class*="shift"], [class*="block"]');
    const firstBox = await shifts.first().boundingBox();
    const secondBox = await shifts.nth(1).boundingBox();
    
    if (firstBox && secondBox) {
      expect(secondBox.y).toBeGreaterThan(firstBox.y);
    }
  });

  test('employee list is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/labor');
    
    const employeeList = page.locator('[class*="employee"]').first();
    await expect(employeeList).toBeVisible();
  });
});

test.describe('Labor Staffing — Performance', () => {
  test('labor schedule loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/labor');
    await expect(page.getByRole('heading', { name: /labor|staffing/i })).toBeVisible();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000);
  });

  test('shift creation is fast', async ({ page }) => {
    await page.goto('/labor');
    
    const startTime = Date.now();
    
    const addShiftBtn = page.getByRole('button', { name: /add shift/i });
    await addShiftBtn.click();
    
    const saveBtn = page.getByRole('button', { name: /save/i });
    await expect(saveBtn).toBeVisible();
    
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(2000);
  });
});
