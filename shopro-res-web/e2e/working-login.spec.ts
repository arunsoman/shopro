import { test, expect } from '@playwright/test';

/**
 * Working Login Test - Based on actual HTML structure
 */
test.describe('Working Login Test', () => {
  test('Login with Amanda Chen', async ({ page }) => {
    console.log('\n=== 🧪 WORKING LOGIN TEST ===\n');
    
    test.setTimeout(120000);
    
    // Step 1: Navigate to staff page
    console.log('📍 Step 1: Navigate to /staff');
    await page.goto('/staff', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Step 2: Click Amanda Chen button
    // HTML: <button><div>A</div><div><div>Amanda Chen</div><div>OWNER</div></div></button>
    console.log('👆 Step 2: Click Amanda Chen');
    
    const amandaBtn = page.locator('button:has-text("Amanda Chen")').first();
    await amandaBtn.scrollIntoViewIfNeeded();
    await amandaBtn.click({ force: true });
    
    console.log('✅ Clicked Amanda Chen\n');
    await page.waitForTimeout(2000);
    
    // Step 3: Check if PIN pad appeared
    console.log('🔍 Step 3: Looking for PIN pad...');
    
    const zeroBtn = page.locator('button:has-text("0")').first();
    const hasZeroBtn = await zeroBtn.count() > 0;
    
    if (!hasZeroBtn) {
      console.log('❌ PIN pad not found! Taking screenshot...\n');
      await page.screenshot({ path: 'e2e/screenshots/no-pin-pad.png', fullPage: true });
      throw new Error('PIN pad did not appear after clicking staff card');
    }
    
    console.log('✅ PIN pad found\n');
    
    // Step 4: Enter PIN 0000
    console.log('🔑 Step 4: Entering PIN 0000');
    
    for (let i = 0; i < 4; i++) {
      const btn = page.locator('button:has-text("0")').first();
      await btn.scrollIntoViewIfNeeded();
      await btn.click({ force: true });
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
      await page.screenshot({ path: 'e2e/screenshots/login-failed.png', fullPage: true });
      throw new Error('Login did not redirect');
    } else {
      console.log('✅ Successfully redirected!\n');
      console.log('🎉 TEST PASSED\n');
    }
    
    // Take success screenshot
    await page.screenshot({ path: 'e2e/screenshots/login-success.png', fullPage: true });
    console.log('📸 Screenshot saved: login-success.png\n');
  });
});
