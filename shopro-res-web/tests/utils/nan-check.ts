/**
 * NaN Detection Utility for Playwright Tests
 * 
 * Reusable function to detect NaN values displayed in the UI
 * Use this in every page test to catch calculation/display errors
 */

import { Page, expect } from '@playwright/test';

/**
 * Checks if any element on the page displays "NaN" text
 * Should be called after page load or after any numeric operation
 * 
 * @param page - Playwright Page object
 * @param context - Optional context description for error messages
 */
export async function expectNoNaN(page: Page, context: string = ''): Promise<void> {
  const contextPrefix = context ? ` (${context})` : '';
  
  // Wait for page to stabilize
  await page.waitForTimeout(500);
  
  // Check for NaN in text content
  const nanElements = page.locator('text=/NaN/i');
  const count = await nanElements.count();
  
  if (count > 0) {
    // Get details about where NaN appears
    const firstNaN = nanElements.first();
    const textContent = await firstNaN.textContent();
    const tagName = await firstNaN.evaluate(el => el.tagName);
    const className = await firstNaN.evaluate(el => el.className);
    
    // Try to get more context (parent element)
    const parentInfo = await firstNaN.evaluate(el => {
      const parent = el.parentElement;
      return {
        parentTag: parent?.tagName,
        parentClass: parent?.className,
        parentText: parent?.textContent?.slice(0, 100)
      };
    });
    
    throw new Error(
      `NaN detected${contextPrefix}!\n` +
      `  Count: ${count} element(s)\n` +
      `  Element: <${tagName}> with class "${className}"\n` +
      `  Content: "${textContent}"\n` +
      `  Parent: <${parentInfo.parentTag}> class="${parentInfo.parentClass}"\n` +
      `  Parent text: "${parentInfo.parentText}"\n` +
      `  URL: ${page.url()}`
    );
  }
  
  expect(count).toBe(0);
}

/**
 * Checks for NaN in specific numeric displays (prices, percentages, counts)
 * More targeted check for common numeric display patterns
 * 
 * @param page - Playwright Page object
 * @param selectors - CSS selectors to check for NaN
 */
export async function expectNoNaNInSelectors(page: Page, selectors: string[]): Promise<void> {
  for (const selector of selectors) {
    const elements = page.locator(selector);
    const count = await elements.count();
    
    for (let i = 0; i < count; i++) {
      const element = elements.nth(i);
      const text = await element.textContent();
      
      if (text && text.includes('NaN')) {
        throw new Error(
          `NaN detected in selector "${selector}"!\n` +
          `  Element ${i + 1} of ${count}\n` +
          `  Content: "${text}"\n` +
          `  URL: ${page.url()}`
        );
      }
    }
  }
}

/**
 * Checks for common numeric display patterns that might show NaN
 * Automatically checks elements with currency, percentage, and number formatting
 * 
 * @param page - Playwright Page object
 */
export async function expectNoNaNInNumericDisplays(page: Page): Promise<void> {
  // Common selectors for numeric displays
  const numericSelectors = [
    '[class*="price"]',
    '[class*="cost"]',
    '[class*="amount"]',
    '[class*="total"]',
    '[class*="value"]',
    '[class*="percentage"]',
    '[class*="percent"]',
    '[class*="rate"]',
    '[class*="count"]',
    '[class*="quantity"]',
    '[class*="revenue"]',
    '[class*="sales"]',
    '[class*="budget"]',
    '[class*="variance"]',
    '[data-testid*="price"]',
    '[data-testid*="cost"]',
    '[data-testid*="amount"]',
    'span:has-text("$")',
    'span:has-text("€")',
    'span:has-text("£")',
    'span:has-text("%")',
  ];
  
  await expectNoNaNInSelectors(page, numericSelectors);
}
