import { test, expect } from '@playwright/test';
import { loginWithPIN0000 } from './helpers/auth';

/**
 * Selector Discovery Test
 * Helps identify correct selectors for the actual UI
 */
test.describe('Selector Discovery', () => {
  test('Discover selectors for main navigation', async ({ page }) => {
    console.log('\n=== 🔍 SELECTOR DISCOVERY TEST ===\n');
    
    // Login
    await loginWithPIN0000(page);
    await page.waitForTimeout(2000);
    
    // Get current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}\n`);
    
    // Find all navigation links
    console.log('🔗 Finding navigation links...');
    const navLinks = page.locator('a, [role="link"], button');
    const navCount = await navLinks.count();
    console.log(`Found ${navCount} navigation elements\n`);
    
    // Log first 10 nav elements
    for (let i = 0; i < Math.min(10, navCount); i++) {
      const element = navLinks.nth(i);
      const text = await element.textContent();
      const href = await element.getAttribute('href');
      const className = await element.getAttribute('class');
      
      if (text && text.trim().length > 0) {
        console.log(`  [${i}] Text: "${text.trim()}"`);
        if (href) console.log(`      Href: ${href}`);
        if (className) console.log(`      Class: ${className.substring(0, 50)}...`);
        console.log('');
      }
    }
    
    // Find purchasing-related elements
    console.log('🛒 Finding Purchasing-related elements...');
    const purchasingElements = page.locator('text=/purchasing|Purchasing/i');
    const purchasingCount = await purchasingElements.count();
    console.log(`Found ${purchasingCount} purchasing elements\n`);
    
    for (let i = 0; i < Math.min(5, purchasingCount); i++) {
      const element = purchasingElements.nth(i);
      const tagName = await element.evaluate(el => el.tagName);
      const className = await element.getAttribute('class');
      console.log(`  [${i}] Tag: ${tagName}, Class: ${className?.substring(0, 50)}...`);
    }
    
    console.log('\n');
    
    // Navigate to Purchasing page
    console.log('📍 Navigating to /purchasing...');
    await page.goto('/purchasing');
    await page.waitForTimeout(3000);
    
    // Get page content
    const pageTitle = await page.locator('h1, h2, h3').first().textContent();
    console.log(`📄 Page title: ${pageTitle}\n`);
    
    // Find all cards
    console.log('🃏 Finding card elements...');
    const cards = page.locator('[class*="card"], [class*="Card"], div');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} potential card elements\n`);
    
    // Find tables
    console.log('📊 Finding table elements...');
    const tables = page.locator('table, [class*="table"], [class*="Table"]');
    const tableCount = await tables.count();
    console.log(`Found ${tableCount} table elements\n`);
    
    // Find buttons
    console.log('🔘 Finding buttons...');
    const buttons = page.locator('button, [role="button"]');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons\n`);
    
    // Log button texts
    for (let i = 0; i < Math.min(10, buttonCount); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      if (text && text.trim().length > 0) {
        console.log(`  Button [${i}]: "${text.trim()}"`);
      }
    }
    
    console.log('\n');
    
    // Find checkboxes
    console.log('☑️  Finding checkboxes...');
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`Found ${checkboxCount} checkboxes\n`);
    
    // Find any text with dollar amounts
    console.log('💰 Finding dollar amounts...');
    const dollarTexts = page.locator('text=/\\$[0-9]+/');
    const dollarCount = await dollarTexts.count();
    console.log(`Found ${dollarCount} elements with dollar amounts\n`);
    
    if (dollarCount > 0) {
      const firstDollar = await dollarTexts.first().textContent();
      console.log(`  First dollar amount: ${firstDollar}\n`);
    }
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'e2e/screenshots/selector-discovery.png', fullPage: true });
    console.log('✅ Screenshot saved to e2e/screenshots/selector-discovery.png\n');
    
    // Save page HTML
    console.log('💾 Saving page HTML...');
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('e2e/screenshots/page-source.html', html);
    console.log('✅ HTML saved to e2e/screenshots/page-source.html\n');
    
    console.log('=== ✅ SELECTOR DISCOVERY COMPLETE ===\n');
  });
});
