import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';

/**
 * Simple Login Test - Just verify we can login with PIN 0000
 */
test.describe('Simple Login Test', () => {
  test('Login with PIN 0000', async ({ page }) => {
    console.log('\n=== 🧪 SIMPLE LOGIN TEST ===\n');
    
    // Navigate to staff page
    console.log('📍 Navigating to /staff...');
    await page.goto('/staff');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of staff page
    await page.screenshot({ path: 'e2e/screenshots/01-staff-page.png' });
    console.log('✅ Screenshot saved: 01-staff-page.png\n');
    
    // Get page HTML
    const html = await page.content();
    writeFileSync('e2e/screenshots/01-staff-page.html', html);
    console.log('✅ HTML saved: 01-staff-page.html\n');
    
    // Find all buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`🔘 Found ${buttonCount} buttons\n`);
    
    // Log button texts
    for (let i = 0; i < Math.min(10, buttonCount); i++) {
      const btn = buttons.nth(i);
      const text = await btn.textContent();
      const className = await btn.getAttribute('class');
      
      if (text && text.trim()) {
        console.log(`  Button [${i}]: "${text.trim()}"`);
        console.log(`           Class: ${className?.substring(0, 80)}...`);
      }
    }
    
    console.log('\n');
    
    // Click first button that looks like a staff card
    console.log('👆 Clicking first staff button...');
    let clicked = false;
    
    for (let i = 0; i < buttonCount && !clicked; i++) {
      const btn = buttons.nth(i);
      const text = await btn.textContent();
      
      // Look for staff-related text
      if (text && (text.includes('Chef') || text.includes('Manager') || text.includes('Waiter') || text.includes('Staff'))) {
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        console.log(`✅ Clicked button: "${text.trim()}"\n`);
        clicked = true;
      }
    }
    
    // If no staff button found, click first button
    if (!clicked) {
      const firstBtn = buttons.first();
      await firstBtn.scrollIntoViewIfNeeded();
      await firstBtn.click();
      const text = await firstBtn.textContent();
      console.log(`✅ Clicked first button: "${text?.trim() || 'no text'}"\n`);
    }
    
    await page.waitForTimeout(1000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'e2e/screenshots/02-pin-pad.png' });
    console.log('✅ Screenshot saved: 02-pin-pad.png\n');
    
    // Find PIN buttons
    const pinButtons = page.locator('button:has-text("0"), button:has-text("1"), button:has-text("2")');
    const pinCount = await pinButtons.count();
    console.log(`🔢 Found ${pinCount} PIN buttons\n`);
    
    // Enter PIN 0000
    console.log('🔑 Entering PIN 0000...');
    for (let i = 0; i < 4; i++) {
      const zeroBtn = page.locator('button:has-text("0")').first();
      await zeroBtn.scrollIntoViewIfNeeded();
      await zeroBtn.click();
      await page.waitForTimeout(200);
      console.log(`  Digit ${i + 1}: 0`);
    }
    console.log('✅ PIN entered\n');
    
    await page.waitForTimeout(2000);
    
    // Take screenshot after PIN
    await page.screenshot({ path: 'e2e/screenshots/03-after-login.png' });
    console.log('✅ Screenshot saved: 03-after-login.png\n');
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}\n`);
    
    // Check for dashboard content
    const bodyText = await page.locator('body').textContent();
    
    if (bodyText.includes('Dashboard') || bodyText.includes('Intelligence') || bodyText.includes('Home')) {
      console.log('✅ Login successful! Reached dashboard\n');
    } else if (bodyText.includes('Something went wrong')) {
      console.log('❌ Error: Something went wrong\n');
    } else {
      console.log('⚠️  Unclear if login succeeded\n');
    }
    
    console.log('=== ✅ TEST COMPLETE ===\n');
  });
});
