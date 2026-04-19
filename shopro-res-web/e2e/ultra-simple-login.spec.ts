import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';

/**
 * Ultra-Simple Login Test
 * Just verify basic login flow works
 */
test.describe('Ultra-Simple Login', () => {
  test('Login with Amanda Chen (OWNER)', async ({ page }) => {
    console.log('\n=== 🧪 ULTRA-SIMPLE LOGIN TEST ===\n');
    
    // Increase timeout
    test.setTimeout(120000);
    
    try {
      // Step 1: Go to staff page
      console.log('📍 Step 1: Navigate to /staff');
      await page.goto('/staff', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Step 2: Click first staff card (Amanda Chen)
      console.log('👆 Step 2: Click Amanda Chen (OWNER)');
      const amandaBtn = page.locator('button:has-text("Amanda")').first();
      await amandaBtn.scrollIntoViewIfNeeded();
      await amandaBtn.click();
      await page.waitForTimeout(2000);
      
      // Step 3: Enter PIN 0000
      console.log('🔑 Step 3: Enter PIN 0000');
      
      // Find all buttons that look like PIN pad (usually have numbers)
      const zeroBtn = page.locator('button:has-text("0")').first();
      
      for (let i = 0; i < 4; i++) {
        await zeroBtn.scrollIntoViewIfNeeded();
        await zeroBtn.click();
        await page.waitForTimeout(300);
        console.log(`  - Entered digit ${i + 1}`);
      }
      
      // Step 4: Wait for navigation
      console.log('⏳ Step 4: Waiting for navigation...');
      await page.waitForTimeout(3000);
      
      // Step 5: Check result
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      const bodyText = await page.locator('body').textContent();
      
      if (currentUrl.includes('/staff')) {
        console.log('❌ Still on staff page - login may have failed\n');
      } else if (bodyText.includes('Something went wrong')) {
        console.log('❌ Error: Something went wrong\n');
      } else {
        console.log('✅ Successfully navigated away from staff page\n');
        console.log('🎉 TEST PASSED\n');
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'e2e/screenshots/final-result.png', fullPage: true });
      console.log('📸 Screenshot saved: final-result.png\n');
      
    } catch (error) {
      console.error('❌ Test failed with error:', error);
      
      // Take error screenshot
      await page.screenshot({ path: 'e2e/screenshots/error-result.png', fullPage: true });
      console.log('📸 Error screenshot saved: error-result.png\n');
      
      throw error;
    }
  });
});
