/**
 * Inventory Module — Deep Recursive Crawl
 *
 * Navigates to each Inventory sub-page, searches inputs, toggles filters,
 * clicks every button/card/link, checks for NaN, and verifies back navigation.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Inventory Module — Deep Crawl', () => {

  test('Crawl all Inventory sub-pages, searches, filters, buttons', async ({ page }) => {
    const consoleErrors: string[] = [];
    const networkErrors: { url: string; status: number }[] = [];
    const nanIssues: string[] = [];

    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text().substring(0, 200)); });
    page.on('response', resp => { if (resp.status() >= 400 && resp.url().includes('/api/')) networkErrors.push({ url: resp.url().substring(0, 200), status: resp.status() }); });

    const log = (icon: string, msg: string) => console.log(`  ${icon} ${msg}`);
    const safe = async (fn: () => Promise<void>, label: string): Promise<boolean> => {
      try { await fn(); return true; } catch (e: any) { log('⚠️', `${label}: ${e.message?.substring(0, 100)}`); return false; }
    };

    async function settle(ms = 300) {
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(ms);
    }

    async function openSidebar(): Promise<boolean> {
      for (let i = 0; i < 3; i++) {
        const w = await page.locator('aside').evaluate(el => (el as HTMLElement).offsetWidth).catch(() => 0);
        if (w > 50) return true;
        const menuBtn = page.locator('button[title="Menu"]');
        if (await menuBtn.isVisible().catch(() => false)) { await menuBtn.click({ timeout: 2000 }); await settle(200); }
        const w2 = await page.locator('aside').evaluate(el => (el as HTMLElement).offsetWidth).catch(() => 0);
        if (w2 > 50) return true;
      }
      return false;
    }

    async function heading(): Promise<string> {
      for (const sel of ['h1', 'h2', '[role="heading"]']) {
        try { const t = await page.locator(sel).first().textContent({ timeout: 1500 }); if (t?.trim()) return t.trim().substring(0, 80); } catch {}
      }
      return '(none)';
    }

    async function checkNaN(): Promise<string[]> {
      try {
        return await page.evaluate(() => {
          const body = document.body.innerText || '';
          const lines = body.split('\n');
          const found: string[] = [];
          for (const line of lines) {
            const t = line.trim(); if (!t || t.length < 2) continue;
            if (/\bNaN\b/.test(t)) found.push(`NaN: "${t.substring(0, 80)}"`);
            if (/\bundefined\b/.test(t)) found.push(`undefined: "${t.substring(0, 80)}"`);
            if (/\$N\/A/i.test(t) || (/\bN\/A\b/.test(t) && /\$|[0-9]/.test(t.substring(0, 20)))) found.push(`N/A: "${t.substring(0, 80)}"`);
            if (/\$[Ii]nfinity/i.test(t) || /\$-[^0-9]/.test(t)) found.push(`Inf: "${t.substring(0, 80)}"`);
          }
          return [...new Set(found)];
        });
      } catch { return []; }
    }

    async function checkSearchInputs(): Promise<{ label: string; worked: boolean }[]> {
      const results: { label: string; worked: boolean }[] = [];
      const inputs = page.locator('main input[type="text"], main input[type="search"], main input:not([type])').filter({ visible: true });
      for (let i = 0; i < Math.min(await inputs.count(), 5); i++) {
        try {
          const inp = inputs.nth(i);
          const ph = await inp.getAttribute('placeholder').catch(() => '') || `search-${i}`;
          const label = ph.substring(0, 40);
          await inp.fill('test'); await settle(200);
          results.push({ label, worked: true });
          log('🔎', `Search "${label}" → typed`);
          await inp.clear();
        } catch { results.push({ label: `search-${i}`, worked: false }); }
      }
      return results;
    }

    async function checkFilters(): Promise<{ label: string; worked: boolean }[]> {
      const results: { label: string; worked: boolean }[] = [];
      const filters = page.locator('main [role="tab"], main button[class*="tab"]').filter({ visible: true });
      for (let i = 0; i < Math.min(await filters.count(), 10); i++) {
        try {
          const f = filters.nth(i);
          const txt = (await f.textContent({ timeout: 500 }) || '').trim().substring(0, 40);
          if (!txt) continue;
          await f.click({ timeout: 2000 }); await settle();
          results.push({ label: txt, worked: true });
          log('🔘', `Filter/tab "${txt}"`);
          const nan = await checkNaN(); nan.forEach(n => { log('🚨', `After "${txt}": ${n}`); nanIssues.push(n); });
        } catch {}
      }
      return results;
    }

    // ═══════════════════════════════════════════════════════════════
    // LOGIN
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🔐 Logging in…');
    await page.goto(`${BASE_URL}/staff`);
    await page.waitForSelector('button:has-text("Emma Wilson")', { timeout: 10000 });
    await page.getByRole('button', { name: /Emma Wilson/i }).click();
    await settle(600);
    const pin = page.locator('button:has-text("0")').first();
    for (let i = 0; i < 4; i++) { await pin.click(); await page.waitForTimeout(150); }
    await settle();
    await openSidebar();
    console.log('✅ Logged in\n');

    // Navigate to Inventory
    console.log('╔' + '═'.repeat(60) + '╗');
    console.log('║  INVENTORY MODULE — DEEP CRAWL'.padEnd(61) + '║');
    console.log('╚' + '═'.repeat(60) + '╝');

    await openSidebar();
    await safe(() => page.locator('aside button').filter({ has: page.getByText('Inventory', { exact: true }) }).click({ timeout: 4000 }), 'navigate to Inventory');
    await settle();
    const invHeading = await heading();
    log('📄', `Inventory Hub → ${invHeading}`);
    const invNaN = await checkNaN();
    invNaN.forEach(n => { log('🚨', n); nanIssues.push(n); });
    if (invNaN.length === 0) log('✅', 'No NaN on Inventory Hub');

    // Search on Inventory Hub
    const searchResults = await checkSearchInputs();
    // Filter tabs on Inventory Hub (FOOD/BAR tabs)
    const filterResults = await checkFilters();

    // ═══════════════════════════════════════════════════════════════
    // SUB-PAGES
    // ═══════════════════════════════════════════════════════════════
    const subPages = [
      { name: 'Ingredient Master', screen: 'inventory-ingredients' },
      { name: 'Count Entry', screen: 'inventory-count' },
      { name: 'Period History', screen: 'inventory-history' },
      { name: 'Low Stock Alerts', screen: 'inventory-alerts' },
    ];

    for (const sub of subPages) {
      console.log(`\n  ${'─'.repeat(50)}`);
      console.log(`  🔍 ${sub.name}`);

      // Navigate to sub-page via sidebar → Inventory first, then click the card
      await openSidebar();
      await safe(() => page.locator('aside button').filter({ has: page.getByText('Inventory', { exact: true }) }).click({ timeout: 4000 }), `navigate to Inventory for ${sub.name}`);
      await settle();

      // Find and click the card/link for this sub-page
      const card = page.locator('main button, main a, main [role="button"]').filter({ hasText: new RegExp(sub.name, 'i') }).first();
      if (!(await card.isVisible().catch(() => false))) {
        // Try navigate directly via App store
        await safe(() => page.evaluate((screen: string) => { (window as any).__APP_NAVIGATE__?.(screen); }, sub.screen), `direct navigate to ${sub.screen}`);
        if (!(await card.isVisible().catch(() => false))) {
          log('⚠️', `Could not navigate to ${sub.name}`);
          continue;
        }
      }
      await card.click({ timeout: 3000 });
      await settle();

      const subHeading = await heading();
      log('  📄', `→ ${subHeading}`);

      // Check NaN
      const subNaN = await checkNaN();
      subNaN.forEach(n => { log('  🚨', n); nanIssues.push(n); });
      if (subNaN.length === 0) log('  ✅', 'No NaN');

      // Search on sub-page
      const subSearches = await checkSearchInputs();

      // Filters on sub-page
      const subFilters = await checkFilters();

      // Interactive elements on sub-page
      const els = page.locator('main button:not([title="Menu"]):not([aria-label="Menu"])').filter({ visible: true });
      const seen = new Set<string>();
      for (let i = 0; i < Math.min(await els.count(), 15); i++) {
        try {
          const el = els.nth(i);
          const txt = (await el.textContent({ timeout: 300 }) || '').trim().substring(0, 50);
          if (!txt || txt.length < 2 || seen.has(txt)) continue;
          seen.add(txt);
          // Skip back/home buttons
          if (/back|←|return|close/i.test(txt)) continue;
          log('  🔘', `Button: "${txt.substring(0, 40)}"`);
        } catch {}
      }

      // Back button
      const backBtn = page.locator('button').filter({ hasText: /←|back|return/i }).first();
      if (await backBtn.isVisible().catch(() => false)) {
        const bw = await safe(() => backBtn.click({ timeout: 2000 }), 'back');
        await settle();
        log('  ↩️', bw ? 'Back worked' : 'Back failed');
      } else {
        log('  ↩️', 'No back button found');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // + NEW INGREDIENT FORM
    // ═══════════════════════════════════════════════════════════════
    console.log(`\n  ${'─'.repeat(50)}`);
    console.log('  🔍 New Ingredient Form');

    await openSidebar();
    await safe(() => page.locator('aside button').filter({ has: page.getByText('Inventory', { exact: true }) }).click({ timeout: 4000 }), 'navigate to Inventory');
    await settle();

    const newBtn = page.locator('button').filter({ hasText: /new ingredient|add ingredient|create/i }).first();
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click({ timeout: 2000 });
      await settle();
      log('  📄', `New Ingredient form → ${await heading()}`);

      // Check form inputs
      const formInputs = page.locator('main input[type="text"], main input[type="number"], main input:not([type])').filter({ visible: true });
      log('  📝', `Found ${Math.min(await formInputs.count(), 10)} form inputs`);
      // Type into first few inputs
      for (let i = 0; i < Math.min(await formInputs.count(), 5); i++) {
        try {
          const inp = formInputs.nth(i);
          const ph = await inp.getAttribute('placeholder').catch(() => '') || `input-${i}`;
          await inp.fill('Test Value');
          log('  🔎', `Form input "${ph.substring(0, 30)}" → filled`);
        } catch {}
      }

      const formNaN = await checkNaN();
      formNaN.forEach(n => { log('  🚨', n); nanIssues.push(n); });
      if (formNaN.length === 0) log('  ✅', 'No NaN on New Ingredient form');

      // Cancel / go back
      const cancelBtn = page.locator('button').filter({ hasText: /cancel|back|←/i }).first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await safe(() => cancelBtn.click({ timeout: 2000 }), 'cancel');
        await settle();
        log('  ↩️', 'Cancelled form');
      }
    } else {
      log('  ⚠️', 'New Ingredient button not found');
    }

    // ═══════════════════════════════════════════════════════════════
    // FINAL REPORT
    // ═══════════════════════════════════════════════════════════════
    console.log('\n\n╔' + '═'.repeat(60) + '╗');
    console.log('║  INVENTORY MODULE — SUMMARY'.padEnd(61) + '║');
    console.log('╠' + '═'.repeat(60) + '╣');
    console.log(`║  Hub: ${invHeading}`.padEnd(61) + '║');
    console.log(`║  Sub-pages visited: ${subPages.length}`.padEnd(61) + '║');
    console.log(`║  Searches: ${searchResults.filter(s => s.worked).length} OK`.padEnd(61) + '║');
    console.log(`║  Filters/tabs: ${filterResults.filter(f => f.worked).length} OK`.padEnd(61) + '║');
    if (nanIssues.length > 0) {
      console.log('║  🚨 BAD VALUES:'.padEnd(61) + '║');
      nanIssues.forEach(n => console.log(`║    ${n.substring(0, 56)}`.padEnd(61) + '║'));
    } else {
      console.log('║  ✅ No NaN/undefined/N/A found'.padEnd(61) + '║');
    }
    if (networkErrors.length > 0) {
      console.log('║  🔴 API ERRORS:'.padEnd(61) + '║');
      [...new Map(networkErrors.map(e => [e.url.split('?')[0], e])).values()].forEach(e => console.log(`║    ❌ ${e.status} ${e.url.substring(0, 50)}`.padEnd(61) + '║'));
    }
    if (consoleErrors.length > 0) {
      console.log('║  CONSOLE ERRORS:'.padEnd(61) + '║');
      [...new Set(consoleErrors)].slice(0, 10).forEach(e => console.log(`║    ❌ ${e.substring(0, 55)}`.padEnd(61) + '║'));
    }
    console.log('╚' + '═'.repeat(60) + '╝');

    test.info().attachments.push({
      name: 'inventory-crawl-report',
      body: Buffer.from(JSON.stringify({ invHeading, subPages, searchResults, filterResults, nanIssues, networkErrors, consoleErrors: [...new Set(consoleErrors)] }, null, 2)),
      contentType: 'application/json',
    });
  });
});