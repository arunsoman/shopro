import { test, expect } from '@playwright/test';

/**
 * JavaScript-Based Login Test
 * Uses element.evaluate() to click, bypassing viewport issues
 */
test.describe('JS-Based Login Test', () => {
  test('Login with Amanda Chen using JS click', async ({ page }) => {
    console.log('\n=== 🧪 JAVASCRIPT CLICK TEST ===\n');
    
    test.setTimeout(120000);
    
    // Step 1: Navigate to staff page
    console.log('📍 Step 1: Navigate to /staff');
    await page.goto('/staff', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Step 2: Click Amanda Chen using JavaScript
    console.log('👆 Step 2: Click Amanda Chen (using JavaScript)');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const amandaBtn = buttons.find(btn => btn.textContent?.includes('Amanda Chen'));
      if (amandaBtn) {
        (amandaBtn as HTMLElement).click();
        console.log('Clicked Amanda Chen button');
      } else {
        throw new Error('Amanda Chen button not found');
      }
    });
    
    console.log('✅ Clicked Amanda Chen\n');
    await page.waitForTimeout(3000);
    
    // Step 3: Check if PIN pad appeared
    console.log('🔍 Step 3: Looking for PIN pad...');
    
    const zeroBtn = page.locator('button:has-text("0")').first();
    const hasZeroBtn = await zeroBtn.count() > 0;
    
    if (!hasZeroBtn) {
      console.log('❌ PIN pad not found! Taking screenshot...\n');
      await page.screenshot({ path: 'e2e/screenshots/js-no-pin-pad.png', fullPage: true });
      
      // Debug: List all buttons
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons:`);
      for (let i = 0; i < Math.min(10, allButtons.length); i++) {
        const text = await allButtons[i].textContent();
        console.log(`  [${i}] ${text?.trim()}`);
      }
      console.log('');
      
      throw new Error('PIN pad did not appear');
    }
    
    console.log('✅ PIN pad found\n');
    
    // Step 4: Enter PIN 0000
    console.log('🔑 Step 4: Entering PIN 0000');
    
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const zeroBtn = buttons.find(btn => btn.textContent?.trim() === '0');
        if (zeroBtn) {
          (zeroBtn as HTMLElement).click();
        }
      });
      await page.waitForTimeout(200);
      console.log(`  - Digit ${i + 1} entered`);
    }
    
    console.log('✅ PIN entered\n');
    await page.waitForTimeout(3000);
    
    // Step 5: Check result
    console.log('📍 Step 5: Checking result...');
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}\n`);
    
    if (currentUrl.includes('/staff')) {
      console.log('❌ Still on /staff page - login failed\n');
      await page.screenshot({ path: 'e2e/screenshots/js-login-failed.png', fullPage: true });
      throw new Error('Login did not redirect');
    } else {
      console.log('✅ Successfully redirected!\n');
      console.log('🎉 TEST PASSED\n');
    }
    
    // Take success screenshot
    await page.screenshot({ path: 'e2e/screenshots/js-login-success.png', fullPage: true });
    console.log('📸 Screenshot saved: js-login-success.png\n');
  });
});
