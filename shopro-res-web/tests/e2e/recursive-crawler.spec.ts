/**
 * Shopro POS — Resilient UI Crawler v5
 *
 * - Never stops on failure → logs and moves on
 * - Auto-opens sidebar via Menu button
 * - Instead of waitForTimeout: waits for network idle + rendering
 * - Checks for NaN / undefined / N/A on every page
 * - Clicks every button, tab, card, searches every input
 * - Recurses one level into sub-pages
 */

import { test } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

interface PageResult {
  name: string; ok: boolean; heading: string;
  searches: { label: string; worked: boolean }[];
  filters: { label: string; worked: boolean }[];
  actions: { label: string; kind: string; worked: boolean; landedOn?: string }[];
  nanIssues: string[];
  errors: string[];
}

const results: PageResult[] = [];
const consoleErrors: string[] = [];
const networkErrors: { url: string; status: number }[] = [];

test('Crawl all pages — wait for render, not timeout', async ({ page }) => {
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text().substring(0, 200)); });
  page.on('response', resp => { if (resp.status() >= 400 && resp.url().includes('/api/')) networkErrors.push({ url: resp.url().substring(0, 200), status: resp.status() }); });

  const log = (icon: string, msg: string) => console.log(`  ${icon} ${msg}`);
  const safe = async (fn: () => Promise<void>, label: string): Promise<boolean> => {
    try { await fn(); return true; } catch (e: any) { log('⚠️', `${label}: ${e.message?.substring(0, 100)}`); return false; }
  };

  // ── WAIT FOR APP TO BE SETTLED ──
  // Waits for network idle (no requests for 300ms) and DOM to stop churning
  async function settle(ms = 400) {
    try {
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    } catch {}
    // Small buffer for React re-renders
    await page.waitForTimeout(ms);
  }

  // ── WAIT FOR SPECIFIC CONTENT TO APPEAR ──
  async function waitForContent(selector: string, timeout = 4000): Promise<boolean> {
    try {
      await page.locator(selector).first().waitFor({ state: 'visible', timeout });
      return true;
    } catch { return false; }
  }

  // ── ENSURE SIDEBAR OPEN ── click Menu if collapsed
  async function openSidebar(): Promise<boolean> {
    for (let i = 0; i < 3; i++) {
      const sidebar = page.locator('aside');
      const w = await sidebar.evaluate(el => (el as HTMLElement).offsetWidth).catch(() => 0);
      if (w > 50) return true;
      const menuBtn = page.locator('button[title="Menu"]');
      if (await menuBtn.isVisible().catch(() => false)) {
        await menuBtn.click({ timeout: 2000 });
        await settle(300);
        const w2 = await sidebar.evaluate(el => (el as HTMLElement).offsetWidth).catch(() => 0);
        if (w2 > 50) return true;
      }
    }
    return false;
  }

  async function heading(): Promise<string> {
    for (const sel of ['h1', 'h2', '[role="heading"]']) {
      try { const t = await page.locator(sel).first().textContent({ timeout: 1500 }); if (t?.trim()) return t.trim().substring(0, 80); } catch {}
    }
    return '(none)';
  }

  async function checkBadValues(): Promise<string[]> {
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

  // ════════════════════════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════════════════════════
  console.log('\n🔐 Logging in…');
  await page.goto(`${BASE_URL}/staff`);
  await waitForContent('button:has-text("Emma Wilson")', 10000);
  await page.getByRole('button', { name: /Emma Wilson/i }).click();
  await settle(600);
  const pin = page.locator('button:has-text("0")').first();
  for (let i = 0; i < 4; i++) { await pin.click(); await page.waitForTimeout(150); }
  await settle(); // wait for login API + dashboard render
  await openSidebar();
  console.log('✅ Logged in\n');

  const navItems = ['Dashboard','Inventory','Kitchen','Prime Cost','Engineering','Purchasing','Experiments','Reports','Supplier Pay','Staff & Labor','Kitchen Costs'];

  // ════════════════════════════════════════════════════════════════════
  // CRAWL
  // ════════════════════════════════════════════════════════════════════
  for (const navItem of navItems) {
    const r: PageResult = { name: navItem, ok: false, heading: '', searches: [], filters: [], actions: [], nanIssues: [], errors: [] };

    console.log(`\n${'━'.repeat(50)}\n🔍 ${navItem}\n${'━'.repeat(50)}`);

    // Open sidebar & click nav item
    if (!(await openSidebar())) { r.errors.push('sidebar not visible'); results.push(r); continue; }

    const btn = page.locator('aside button').filter({ has: page.getByText(navItem, { exact: true }) });
    if (!(await safe(() => btn.click({ timeout: 4000 }), `click "${navItem}"`))) {
      let ok = false;
      try {
        const btns = page.locator('aside button');
        for (let i = 0; i < await btns.count(); i++) {
          if ((await btns.nth(i).textContent({ timeout: 500 }) || '').trim() === navItem) { await btns.nth(i).click({ timeout: 2000 }); ok = true; break; }
        }
      } catch {}
      if (!ok) { r.errors.push('could not navigate'); results.push(r); continue; }
    }
    await settle(); // wait for page to render and API calls to finish

    r.heading = await heading();
    r.ok = r.heading !== '(none)';
    log(r.ok ? '📄' : '⚠️', `→ ${r.heading}`);
    if (!r.ok) { results.push(r); continue; }

    // ── NaN CHECK ──
    r.nanIssues = await checkBadValues();
    r.nanIssues.length ? r.nanIssues.forEach(i => log('🚨', i)) : log('✅', 'No NaN/undefined/N/A');

    // ── SEARCH INPUTS ──
    const inputs = page.locator('main input[type="text"], main input[type="search"], main input:not([type])').filter({ visible: true });
    for (let i = 0; i < Math.min(await inputs.count(), 4); i++) {
      try {
        const inp = inputs.nth(i);
        const label = (await inp.getAttribute('placeholder') || `search-${i}`).substring(0, 40);
        await inp.fill('test'); await settle(200);
        r.searches.push({ label, worked: true }); log('🔎', `Search: "${label}"`);
        await inp.clear();
      } catch { r.searches.push({ label: `search-${i}`, worked: false }); }
    }

    // ── TABS ──
    const tabs = page.locator('main [role="tab"]').filter({ visible: true });
    for (let i = 0; i < Math.min(await tabs.count(), 10); i++) {
      try {
        const tab = tabs.nth(i);
        const txt = (await tab.textContent({ timeout: 500 }) || '').trim().substring(0, 40);
        if (!txt) continue;
        const before = await heading();
        await tab.click({ timeout: 2000 });
        await settle(); // wait for tab content to render
        const after = await heading();
        r.filters.push({ label: txt, worked: true });
        r.actions.push({ label: `tab:${txt}`, kind: after !== before ? 'nav' : 'tab', worked: true, landedOn: after !== before ? after : undefined });
        log(after !== before ? '✅' : '🔘', `Tab "${txt}"${after !== before ? ` → ${after}` : ''}`);
        const nan = await checkBadValues(); nan.forEach(n => log('🚨', `Tab "${txt}": ${n}`));
      } catch {}
    }

    // ── INTERACTIVE ELEMENTS (cards, buttons, links) ──
    const els = page.locator('main button:not([title="Menu"]):not([aria-label="Menu"]), main a[href], main [role="button"]').filter({ visible: true });
    const seen = new Set<string>();
    for (let i = 0; i < Math.min(await els.count(), 20); i++) {
      try {
        const el = els.nth(i);
        const txt = (await el.textContent({ timeout: 300 }) || '').trim().substring(0, 50);
        const al = await el.getAttribute('aria-label').catch(() => '') || '';
        const label = (al || txt).substring(0, 45);
        if (!label || label.length < 2 || seen.has(label) || navItems.includes(label)) continue;
        seen.add(label);

        const before = await heading();
        const ok = await safe(() => el.click({ timeout: 2000 }), `"${label}"`);
        await settle(300); // short settle after click
        const after = await heading();
        const didNav = ok && after !== before && after !== '(none)';
        r.actions.push({ label, kind: didNav ? 'nav' : 'click', worked: ok, landedOn: didNav ? after : undefined });

        if (didNav) {
          log('✅→', `"${label}" → "${after}"`);
          // Check NaN on sub-page
          const subNaN = await checkBadValues(); subNaN.forEach(n => log('🚨', `Sub: ${n}`));
          // Search on sub-page
          const subInputs = page.locator('main input[type="text"], main input[type="search"], main input:not([type])').filter({ visible: true });
          for (let si = 0; si < Math.min(await subInputs.count(), 2); si++) {
            try { const sinp = subInputs.nth(si); await sinp.fill('test'); await settle(200); r.searches.push({ label: `sub:${si}`, worked: true }); await sinp.clear(); } catch {}
          }
          // Try back: look for back/home/arrow button, or use browser back
          const backBtns = page.locator('button[title="Home"], button[aria-label="Back"], button').filter({ hasText: /back|←|return/i });
          if (await backBtns.first().isVisible().catch(() => false)) {
            const bw = await safe(() => backBtns.first().click({ timeout: 2000 }), 'back');
            await settle();
            r.actions.push({ label: 'Back', kind: 'back', worked: bw });
            log('↩️', bw ? 'back worked' : 'back failed');
          } else {
            // No visible back button — go back via sidebar
            log('↩️', 'no back button, using sidebar to return');
          }
          // Always re-open sidebar after returning
          await openSidebar();
        } else {
          log(ok ? '🔘' : '❌', `"${label}"`);
        }
      } catch {}
    }

    results.push(r);
  }

  // ════════════════════════════════════════════════════════════════════
  // REPORT
  // ════════════════════════════════════════════════════════════════════
  console.log('\n\n╔' + '═'.repeat(78) + '╗');
  console.log('║  CRAWL REPORT'.padEnd(79) + '║');
  console.log('╠' + '═'.repeat(78) + '╣');
  let okP = 0, failP = 0, totA = 0, totS = 0, totF = 0, totN = 0;
  for (const r of results) {
    const ic = r.ok ? '✅' : '❌';
    console.log(`║  ${ic} ${r.name.padEnd(20)} ${r.heading.substring(0, 40).padEnd(41)}║`);
    r.ok ? okP++ : failP++;
    for (const a of r.actions) { totA++; const k = {nav:'→',back:'↩',tab:'⊗',click:'ʘ'}[a.kind]||'?'; console.log(`║    ${k} ${a.worked?'✅':'❌'} ${(a.label).substring(0,35).padEnd(37)}${(a.landedOn||'').substring(0,20).padEnd(20)}║`); }
    for (const s of r.searches) { totS++; console.log(`║    🔎 ${s.worked?'✅':'❌'} ${s.label.substring(0,40)}`.padEnd(79)+'║'); }
    for (const f of r.filters) { totF++; console.log(`║    ⊗  ${f.worked?'✅':'❌'} ${f.label.substring(0,40)}`.padEnd(79)+'║'); }
    for (const n of r.nanIssues) { totN++; console.log(`║    🚨 ${n.substring(0,70)}`.padEnd(79)+'║'); }
  }
  console.log('╠' + '═'.repeat(78) + '╣');
  console.log(`║  Pages: ${okP} OK / ${failP} failed${''.padEnd(52)}║`);
  console.log(`║  Actions: ${totA}${''.padEnd(60)}║`);
  console.log(`║  Searches: ${totS}${''.padEnd(57)}║`);
  console.log(`║  Tabs/filters: ${totF}${''.padEnd(53)}║`);
  console.log(`║  Bad values: ${totN}${''.padEnd(55)}║`);
  if (consoleErrors.length > 0) { console.log('╠'+'─'.repeat(78)+'╣'); console.log('║  CONSOLE ERRORS:'); for (const e of [...new Set(consoleErrors)].slice(0,15)) console.log(`║    ❌ ${e.substring(0,71)}`); }
  if (networkErrors.length > 0) { console.log('╠'+'─'.repeat(78)+'╣'); console.log('║  API 4xx/5xx:'); for (const ne of [...new Map(networkErrors.map(e=>[e.url.split('?')[0],e])).values()].slice(0,15)) console.log(`║    ❌ ${ne.status} ${ne.url.substring(0,65)}`); }
  console.log('╚' + '═'.repeat(78) + '╝');

  test.info().attachments.push({ name: 'crawl-report', body: Buffer.from(JSON.stringify({ results, consoleErrors: [...new Set(consoleErrors)], networkErrors: [...new Map(networkErrors.map(e => [e.url, e])).values()] }, null, 2)), contentType: 'application/json' });
});