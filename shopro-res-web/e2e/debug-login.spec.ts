import { test, expect } from '@playwright/test';

/**
 * Debug Login Test - Captures console errors and network requests
 */
test.describe('Debug Login Test', () => {
  test('Login with full debugging', async ({ page }) => {
    console.log('\n=== 🔍 DEBUG LOGIN TEST ===\n');
    
    test.setTimeout(120000);
    
    // Capture console messages
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
        console.log(`[CONSOLE ERROR] ${text}`);
      }
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
      console.log(`[PAGE ERROR] ${err.message}`);
    });
    
    // Capture network requests
    const requests: string[] = [];
    const failedRequests: string[] = [];
    
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        requests.push(`${req.method()} ${req.url()}`);
      }
    });
    
    page.on('response', res => {
      if (res.url().includes('/api/') && res.status() >= 400) {
        failedRequests.push(`${res.status()} ${res.url()}`);
      }
    });
    
    // Step 1: Navigate to staff page
    console.log('📍 Step 1: Navigate to /staff');
    await page.goto('/staff', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Step 2: Click Amanda Chen
    console.log('👆 Step 2: Click Amanda Chen');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const amandaBtn = buttons.find(btn => btn.textContent?.includes('Amanda Chen'));
      if (amandaBtn) {
        (amandaBtn as HTMLElement).click();
      }
    });
    await page.waitForTimeout(2000);
    
    // Step 3: Enter PIN 0000
    console.log('🔑 Step 3: Enter PIN 0000');
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const zeroBtn = buttons.find(btn => btn.textContent?.trim() === '0');
        if (zeroBtn) {
          (zeroBtn as HTMLElement).click();
        }
      });
      await page.waitForTimeout(300);
    }
    
    console.log('✅ PIN entered\n');
    
    // Wait longer for any async operations
    console.log('⏳ Waiting for login processing...');
    await page.waitForTimeout(5000);
    
    // Step 4: Report findings
    console.log('\n📊 === DEBUG REPORT ===\n');
    
    console.log(`📍 Final URL: ${page.url()}\n`);
    
    console.log(`📝 Console Messages: ${consoleMessages.length}`);
    if (consoleMessages.length > 0) {
      consoleMessages.slice(-10).forEach(msg => {
        console.log(`  - ${msg}`);
      });
    }
    console.log('');
    
    console.log(`❌ Errors: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach(err => {
        console.log(`  - ${err}`);
      });
    }
    console.log('');
    
    console.log(`🌐 API Requests: ${requests.length}`);
    if (requests.length > 0) {
      requests.slice(-10).forEach(req => {
        console.log(`  - ${req}`);
      });
    }
    console.log('');
    
    console.log(`⚠️  Failed Requests: ${failedRequests.length}`);
    if (failedRequests.length > 0) {
      failedRequests.forEach(req => {
        console.log(`  - ${req}`);
      });
    }
    console.log('');
    
    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/debug-final.png', fullPage: true });
    console.log('📸 Screenshot saved: debug-final.png\n');
    
    // Save HTML
    const fs = require('fs');
    const html = await page.content();
    fs.writeFileSync('e2e/screenshots/debug-final.html', html);
    console.log('💾 HTML saved: debug-final.html\n');
    
    console.log('=== 🔍 END DEBUG REPORT ===\n');
  });
});
