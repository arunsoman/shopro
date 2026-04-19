/**
 * Shopro POS — Store-Driven Recursive Crawler v9
 *
 * Key improvement over v8: The app uses <div> not <main> for the content area.
 * Content is the <div> sibling of <aside>. All selectors updated accordingly.
 * Also: expanded search, tab, and form coverage with proper data-ready waits.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_BASE = 'http://localhost:8080/api/v1/restaurants/3';

// Content area: the <div> that's the sibling of <aside> (contains current screen)
const CONTENT = 'aside ~ div';

// ── ALL KNOWN SCREENS (from App.tsx Screen type) ─────────────────────────
// Excluded: "login", "kds"
const SIMPLE_SCREENS = [
  'dashboard', 'inventory', 'inventory-ingredients', 'inventory-count',
  'inventory-history', 'inventory-alerts', 'inventory-new-ingredient',
  'purchasing', 'purchase-suppliers', 'purchase-invoice-log', 'purchase-weekly',
  'purchase-trend', 'purchase-alerts', 'purchase-po-list', 'purchase-po-staging',
  'purchase-grn-list', 'purchase-matching', 'purchase-variance', 'purchase-audit',
  'prime-cost', 'engineering', 'engineering-setup', 'engineering-live', 'engineering-history',
  'labor-staffing', 'supplier-pay', 'experiment-lab', 'reports',
  'recipes', 'recipe-menu-items', 'recipe-list', 'recipe-cost-groups',
  'recipe-converter', 'recipe-editor',
] as const;

// Screens that need an ID set in store before navigating
const DETAIL_SCREENS: Record<string, { stateKey: string; apiPath: string; idExtractor: (data: any) => any }> = {
  'inventory-ingredient-detail': { stateKey: 'selectedIngredientId', apiPath: '/ingredients', idExtractor: (d: any[]) => d[0]?.id ?? null },
  'purchase-invoice-entry': { stateKey: 'selectedInvoiceId', apiPath: '/invoices', idExtractor: (d: any[]) => d[0]?.id ?? null },
  'purchase-invoice-editor': { stateKey: 'selectedInvoiceId', apiPath: '/invoices', idExtractor: (d: any[]) => d[0]?.id ?? null },
  'purchase-po-detail': { stateKey: 'selectedPOId', apiPath: '/purchase-orders', idExtractor: (d: any[]) => String(d[0]?.id ?? '') },
  'purchase-po-editor': { stateKey: 'selectedPOId', apiPath: '/purchase-orders', idExtractor: (_: any[]) => 'new' },
  'purchase-grn-detail': { stateKey: 'selectedGRNId', apiPath: '/purchasing/grns', idExtractor: (d: any[]) => String(d[0]?.id ?? '') },
  'purchase-grn-editor': { stateKey: 'selectedGRNId', apiPath: '/purchasing/grns', idExtractor: (_: any[]) => null },
  'purchase-grn-conflicts': { stateKey: 'selectedGRNId', apiPath: '/purchasing/grns', idExtractor: (d: any[]) => String(d[0]?.id ?? '') },
  'engineering-detail': { stateKey: 'selectedEngineeringId', apiPath: '/menu-engineering/periods', idExtractor: (d: any[]) => d[0]?.id ?? null },
  'engineering-whatif': { stateKey: 'selectedEngineeringId', apiPath: '/menu-engineering/periods', idExtractor: (d: any[]) => d[0]?.id ?? null },
  'engineering-comparison': { stateKey: 'selectedComparisonIds', apiPath: '/menu-engineering/periods', idExtractor: (d: any[]) => d.length >= 2 ? { id1: d[0].id, id2: d[1].id } : null },
  'recipe-editor-detail': { stateKey: 'selectedRecipeId', apiPath: '/recipes', idExtractor: (d: any[]) => d[0]?.id ?? null },
  'recipe-menu-item-editor': { stateKey: 'selectedMenuItemId', apiPath: '/menu-items', idExtractor: (d: any[]) => d[0]?.id ?? null },
  'inventory-period-detail': { stateKey: 'selectedPeriodId', apiPath: '/inventory/periods', idExtractor: (d: any[]) => d[0]?.id ?? null },
};

// ── DETERMINISTIC TEST DATA ────────────────────────────────────────────
const TEST_DATA: Record<string, string> = {
  text: 'Test Entry', search: 'chicken', email: 'test@shopro.com',
  number: '10', tel: '555-0100', password: 'Test1234!',
  date: '2025-01-15', url: 'https://example.com', time: '09:00',
};

interface ScreenResult {
  screen: string; heading: string; nanIssues: string[];
  searchesTried: number; searchesWorked: number;
  tabsTried: number; tabsWorked: number;
  formsFilled: number; skipped: boolean; skipReason?: string;
}

const allResults: ScreenResult[] = [];
const consoleErrors: string[] = [];
const networkErrors: { url: string; status: number; method: string }[] = [];

test('Store-Driven Crawler v9 — content-area selectors + search/tab/form coverage', async ({ page }) => {
  // Global error handler
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text().substring(0, 250)); });
  page.on('response', resp => {
    if (resp.status() >= 400 && resp.url().includes('/api/')) {
      networkErrors.push({ url: resp.url().substring(0, 200), status: resp.status(), method: resp.request().method() });
    }
  });

  // Safe version of page operations that won't crash if page closes
  const log = (icon: string, msg: string) => console.log(`${icon} ${msg}`);

  async function settle(ms = 300) {
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(ms);
  }

  async function storeNavigate(screen: string) {
    await page.evaluate((s) => { (window as any).__APP_STORE__.setState({ screen: s }); }, screen);
    await settle(400);
  }

  async function storeBack() {
    await page.evaluate(() => { (window as any).__APP_STORE__.getState().back(); });
    await settle(300);
  }

  async function storeGetScreen(): Promise<string> {
    return page.evaluate(() => (window as any).__APP_STORE__.getState().screen);
  }

  async function storeSetId(key: string, value: any) {
    await page.evaluate(({ k, v }) => { (window as any).__APP_STORE__.setState({ [k]: v }); }, { k: key, v: value });
  }

  async function getHeading(): Promise<string> {
    try {
      const h = await page.locator('h1, h2').first().textContent({ timeout: 2000 });
      return h?.trim().substring(0, 80) || '(none)';
    } catch { return '(none)'; }
  }

  // NaN check — scans the content area (aside ~ div), NOT main
  async function checkNaN(): Promise<string[]> {
    try {
      return await page.evaluate((sel) => {
        const found: string[] = [];
        const root = document.querySelector(sel);
        if (!root) return found;
        const all = root.querySelectorAll('*');
        for (const el of all) {
          if (el.childElementCount > 2) continue;
          const t = (el.textContent || '').trim();
          if (!t || t.length < 2) continue;
          if (/\$NaN/.test(t)) found.push(`$NaN in <${el.tagName.toLowerCase()}>: "${t.substring(0, 80)}"`);
          else if (/\bNaN\b/.test(t) && !/\bNaNE/i.test(t)) found.push(`NaN in <${el.tagName.toLowerCase()}>: "${t.substring(0, 80)}"`);
          if (/\bundefined\b/.test(t)) found.push(`undefined in <${el.tagName.toLowerCase()}>: "${t.substring(0, 60)}"`);
          if (/\$infinity/i.test(t)) found.push(`Infinity in <${el.tagName.toLowerCase()}>: "${t.substring(0, 60)}"`);
        }
        return [...new Set(found)].slice(0, 20);
      }, CONTENT);
    } catch { return []; }
  }

  async function fillInput(input: any): Promise<string> {
    try {
      const type = (await input.getAttribute('type')) || 'text';
      const placeholder = (await input.getAttribute('placeholder')) || '';
      const name = (await input.getAttribute('name')) || '';
      const ariaLabel = (await input.getAttribute('aria-label')) || '';
      const label = (placeholder || ariaLabel || name || type).substring(0, 40);

      if (['checkbox', 'radio', 'submit', 'button', 'hidden', 'file', 'image'].includes(type)) return '';

      let value = TEST_DATA.text;
      if (type === 'email' || /email/i.test(placeholder + name + ariaLabel)) value = TEST_DATA.email;
      else if (type === 'number' || /price|cost|amount|qty|quant|rate|wage/i.test(placeholder + name)) value = TEST_DATA.number;
      else if (type === 'tel' || /phone|tel/i.test(placeholder + name)) value = TEST_DATA.tel;
      else if (type === 'date') value = TEST_DATA.date;
      else if (type === 'url') value = TEST_DATA.url;
      else if (type === 'password') value = TEST_DATA.password;
      else if (type === 'time') value = TEST_DATA.time;
      else if (type === 'search' || /search|filter|find/i.test(placeholder + name)) value = TEST_DATA.search;

      await input.fill(value);
      await input.dispatchEvent('input');
      return label;
    } catch { return ''; }
  }

  // Wait for data to load on a screen (network idle + table/list renders)
  async function waitForData(timeout = 6000) {
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);
    // Wait for any table row or data item to appear
    try {
      await page.locator(`${CONTENT} table tbody tr, ${CONTENT} [role="row"], ${CONTENT} [class*="data-list"] > div`).first().waitFor({ state: 'visible', timeout });
    } catch {}
    await page.waitForTimeout(500);
  }

  // ── FETCH IDs FROM APIs ──────────────────────────────────────────────
  const apiIds: Record<string, any> = {};
  log('🌐', 'Fetching IDs from APIs...');
  for (const [screen, config] of Object.entries(DETAIL_SCREENS)) {
    try {
      const resp = await page.request.get(`${API_BASE}${config.apiPath}`);
      if (resp.ok()) {
        const data = await resp.json();
        const id = config.idExtractor(data);
        if (id !== null && id !== undefined) {
          apiIds[screen] = id;
          log('✅', `${screen}: ${config.stateKey} = ${JSON.stringify(id)}`);
        } else { log('⚠️', `${screen}: no data from ${config.apiPath}`); }
      } else { log('⚠️', `${screen}: API returned ${resp.status()}`); }
    } catch (e: any) { log('⚠️', `${screen}: ${e.message.substring(0, 60)}`); }
  }

  // ════════════════════════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════════════════════════
  log('🔐', 'Logging in…');
  await page.goto(`${BASE_URL}/staff`);
  await page.waitForSelector('button:has-text("Emma Wilson")', { timeout: 10000 });
  await page.getByRole('button', { name: /Emma Wilson/i }).click();
  await settle(500);
  const pin = page.locator('button:has-text("0")').first();
  for (let i = 0; i < 4; i++) { await pin.click(); await page.waitForTimeout(150); }
  await settle(500);
  log('✅', 'Logged in\n');

  const storeAvailable = await page.evaluate(() => typeof (window as any).__APP_STORE__ !== 'undefined');
  expect(storeAvailable).toBe(true);
  log('🏪', 'Store exposed on __APP_STORE__ ✅\n');

  // ════════════════════════════════════════════════════════════════════
  // PHASE 1: VISIT EVERY SCREEN + check NaN
  // ════════════════════════════════════════════════════════════════════
  log('📋', '═══ PHASE 1: Visiting all screens ═══');

  for (const screen of SIMPLE_SCREENS) {
    console.log(`\n${'─'.repeat(50)}`);
    log('🔍', `Navigating to: ${screen}`);
    await storeNavigate(screen);
    const currentScreen = await storeGetScreen();
    const heading = await getHeading();
    const nanIssues = await checkNaN();
    const r: ScreenResult = { screen, heading, nanIssues, searchesTried: 0, searchesWorked: 0, tabsTried: 0, tabsWorked: 0, formsFilled: 0, skipped: false };
    log(currentScreen === screen ? '✅' : '⚠️', `${screen} → "${heading}"`);
    for (const n of nanIssues) log('🚨', n);
    allResults.push(r);
  }

  for (const [screen, config] of Object.entries(DETAIL_SCREENS)) {
    console.log(`\n${'─'.repeat(50)}`);
    log('🔍', `Detail: ${screen}`);
    if (!apiIds[screen]) {
      log('⏭️', `${screen}: skipped — no ID`);
      allResults.push({ screen, heading: '(skipped)', nanIssues: [], searchesTried: 0, searchesWorked: 0, tabsTried: 0, tabsWorked: 0, formsFilled: 0, skipped: true, skipReason: 'no ID' });
      continue;
    }
    await storeSetId(config.stateKey, apiIds[screen]);
    await storeNavigate(screen);
    const currentScreen = await storeGetScreen();
    const heading = await getHeading();
    const nanIssues = await checkNaN();
    const r: ScreenResult = { screen, heading, nanIssues, searchesTried: 0, searchesWorked: 0, tabsTried: 0, tabsWorked: 0, formsFilled: 0, skipped: false };
    log(currentScreen === screen ? '✅' : '⚠️', `${screen} → "${heading}"`);
    for (const n of nanIssues) log('🚨', n);
    allResults.push(r);
  }

  // ════════════════════════════════════════════════════════════════════
  // PHASE 2: SEARCH BARS
  // ════════════════════════════════════════════════════════════════════
  log('\n📋', '═══ PHASE 2: Search coverage ═══');

  const screensWithSearch = [
    'inventory-ingredients', 'inventory-alerts', 'inventory-history',
    'purchase-suppliers', 'purchase-invoice-log', 'purchase-po-list',
    'purchase-grn-list', 'purchase-matching', 'purchase-variance', 'purchase-audit',
    'engineering', 'engineering-history', 'reports', 'recipes', 'recipe-list', 'recipe-menu-items',
  ];

  for (const screen of screensWithSearch) {
    log('🔎', `Search: ${screen}`);
    await storeNavigate(screen);
    await waitForData();

    const result = allResults.find(r => r.screen === screen);
    if (!result) continue;

    // Find search inputs in the CONTENT area (not header)
    const searchInputs = page.locator(`${CONTENT} input[type="search"], ${CONTENT} input[placeholder*="Search" i], ${CONTENT} input[placeholder*="search" i], ${CONTENT} input[placeholder*="Filter" i], ${CONTENT} input[placeholder*="Vendor" i], ${CONTENT} input[placeholder*="SKU" i]`).filter({ visible: true });
    const searchCount = await searchInputs.count().catch(() => 0);

    for (let i = 0; i < Math.min(searchCount, 3); i++) {
      try {
        const input = searchInputs.nth(i);
        const placeholder = await input.getAttribute('placeholder') || '';
        await input.fill('chicken');
        await input.dispatchEvent('input');
        await settle(800);

        const hasResults = await page.locator(`${CONTENT} table tbody tr, ${CONTENT} [role="row"], ${CONTENT} [class*="row"]`).count() > 0;
        const hasEmpty = await page.locator(CONTENT).textContent({ timeout: 1000 }).then(t => /no.*found|empty|no.*result|no.*match|0 items/i.test(t || '')).catch(() => false);
        result.searchesTried++;
        if (hasResults || !hasEmpty) result.searchesWorked++;
        log('🔎', `  "${placeholder.substring(0, 40)}" → ${hasResults ? 'has results' : hasEmpty ? 'no results' : 'rendered'}`);

        await input.clear();
        await input.dispatchEvent('input');
        await settle(300);
      } catch {}
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // PHASE 3: TABS / FILTERS
  // ════════════════════════════════════════════════════════════════════
  log('\n📋', '═══ PHASE 3: Tab/filter coverage ═══');

  const screensWithTabs = [
    'dashboard', 'inventory', 'prime-cost', 'engineering', 'purchasing',
    'purchase-invoice-log', 'purchase-trend', 'reports', 'labor-staffing',
    'supplier-pay', 'recipe-menu-items', 'experiment-lab',
  ];

  for (const screen of screensWithTabs) {
    log('🔘', `Tabs: ${screen}`);
    await storeNavigate(screen);
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const result = allResults.find(r => r.screen === screen);
    if (!result) continue;

    const tabs = page.locator(`${CONTENT} [role="tab"], ${CONTENT} [role="tablist"] button, ${CONTENT} button[data-state], ${CONTENT} button[role="tab"], ${CONTENT} [class*="TabsList"] button, ${CONTENT} button[class*="tab-"], ${CONTENT} [class*="tab "]`).filter({ visible: true });
    const tabCount = await tabs.count().catch(() => 0);

    for (let i = 0; i < Math.min(tabCount, 10); i++) {
      try {
        const tab = tabs.nth(i);
        const txt = (await tab.textContent({ timeout: 500 }) || '').trim().substring(0, 30);
        if (!txt || txt.length < 2) continue;
        await tab.click({ timeout: 2000 });
        await settle(400);
        result.tabsTried++;
        result.tabsWorked++;
        log('🔘', `  "${txt}" on ${screen}`);
        const nan = await checkNaN();
        for (const n of nan) { log('🚨', `  Tab "${txt}": ${n}`); if (!result.nanIssues.includes(n)) result.nanIssues.push(n); }
      } catch {}
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // PHASE 4: FORM FILLS
  // ════════════════════════════════════════════════════════════════════
  log('\n📋', '═══ PHASE 4: Form coverage ═══');

  const screensWithForms = [
    'inventory-new-ingredient', 'purchase-invoice-entry', 'purchase-invoice-editor',
    'purchase-po-editor', 'engineering-setup',
  ];

  for (const screen of screensWithForms) {
    if (screen === 'purchase-invoice-entry' && apiIds['purchase-invoice-entry']) await storeSetId('selectedInvoiceId', apiIds['purchase-invoice-entry']);
    if (screen === 'purchase-invoice-editor' && apiIds['purchase-invoice-editor']) await storeSetId('selectedInvoiceId', apiIds['purchase-invoice-editor']);
    if (screen === 'purchase-po-editor') await storeSetId('selectedPOId', 'new');

    log('📝', `Form: ${screen}`);
    await storeNavigate(screen);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const result = allResults.find(r => r.screen === screen);
    if (!result) continue;

    const inputs = page.locator(`${CONTENT} input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"])`).filter({ visible: true });
    let filled = 0;
    const inputCount = await inputs.count().catch(() => 0);
    for (let i = 0; i < Math.min(inputCount, 12); i++) {
      try { const label = await fillInput(inputs.nth(i)); if (label) filled++; } catch {}
    }

    // Also fill textareas and selects
    const selects = page.locator(`${CONTENT} select`).filter({ visible: true });
    const selectCount = await selects.count().catch(() => 0);
    for (let i = 0; i < Math.min(selectCount, 5); i++) {
      try {
        if (await selects.nth(i).locator('option').count() > 1) { await selects.nth(i).selectOption({ index: 1 }); filled++; }
      } catch {}
    }

    result.formsFilled = filled;
    log('📝', `  Filled ${filled} inputs on ${screen}`);
  }

  // ════════════════════════════════════════════════════════════════════
  // PHASE 5: HUB CARD CRAWL
  // ════════════════════════════════════════════════════════════════════
  log('\n📋', '═══ PHASE 5: Hub card crawl ═══');

  const hubScreens = ['inventory', 'purchasing', 'engineering', 'prime-cost', 'recipes'];

  for (const hub of hubScreens) {
    log('🗂️', `Hub: ${hub}`);
    await storeNavigate(hub);
    await settle(500);

    // Click buttons/divs inside the content area that might navigate
    const clickables = page.locator(`${CONTENT} button:not([data-testid="back-button"]):not([title="Menu"]):not([aria-label="Menu"]), ${CONTENT} [role="button"], ${CONTENT} a[href]`).filter({ visible: true });
    const count = await clickables.count().catch(() => 0);
    log('🗂️', `  ${count} clickable elements`);

    for (let i = 0; i < Math.min(count, 12); i++) {
      try {
        const el = clickables.nth(i);
        const txt = (await el.textContent({ timeout: 300 }) || '').trim().substring(0, 50);
        const beforeScreen = await storeGetScreen();

        await el.click({ timeout: 2000 });
        await settle(500);

        const afterScreen = await storeGetScreen();
        if (afterScreen !== beforeScreen) {
          const afterHeading = await getHeading();
          log('✅→', `  "${txt}" → ${afterScreen} ("${afterHeading}")`);
          const nan = await checkNaN();
          for (const n of nan) log('🚨', `  ${n}`);
          await storeBack();
          await settle(300);
        }
      } catch {}
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ════════════════════════════════════════════════════════════════════
  let okPages = 0, failPages = 0, skipped = 0;
  let totSearch = 0, totSearchWorked = 0, totTabs = 0, totTabsWorked = 0, totForms = 0, totNaN = 0;

  console.log('\n\n' + '╔' + '═'.repeat(78) + '╗');
  console.log('║  STORE-DRIVEN CRAWLER v9 — FINAL REPORT'.padEnd(79) + '║');
  console.log('╠' + '═'.repeat(78) + '╣');

  for (const r of allResults) {
    if (r.skipped) { skipped++; continue; }
    const ic = r.heading !== '(none)' ? '✅' : '❌';
    ic === '✅' ? okPages++ : failPages++;
    console.log(`║  ${ic} ${r.screen.padEnd(40)} "${r.heading.substring(0, 30)}"`.padEnd(79) + '║');
    for (const n of r.nanIssues) { totNaN++; console.log(`║    🚨 ${n.substring(0, 70)}`.padEnd(79) + '║'); }
    if (r.searchesTried > 0) { totSearch += r.searchesTried; totSearchWorked += r.searchesWorked; console.log(`║    🔎 Search: ${r.searchesWorked}/${r.searchesTried} worked`.padEnd(79) + '║'); }
    if (r.tabsTried > 0) { totTabs += r.tabsTried; totTabsWorked += r.tabsWorked; console.log(`║    🔘 Tabs: ${r.tabsWorked}/${r.tabsTried} worked`.padEnd(79) + '║'); }
    if (r.formsFilled > 0) { totForms += r.formsFilled; console.log(`║    📝 Forms: ${r.formsFilled} inputs filled`.padEnd(79) + '║'); }
  }

  console.log('╠' + '═'.repeat(78) + '╣');
  console.log(`║  Pages: ${okPages} OK / ${failPages} failed / ${skipped} skipped`.padEnd(79) + '║');
  console.log(`║  Searches: ${totSearchWorked}/${totSearch} worked`.padEnd(79) + '║');
  console.log(`║  Tabs: ${totTabsWorked}/${totTabs} worked`.padEnd(79) + '║');
  console.log(`║  Form inputs: ${totForms} filled`.padEnd(79) + '║');
  console.log(`║  NaN issues: ${totNaN}`.padEnd(79) + '║');

  if (consoleErrors.length > 0) {
    console.log('╠' + '─'.repeat(78) + '╣');
    console.log('║  CONSOLE ERRORS:'.padEnd(79) + '║');
    for (const e of [...new Set(consoleErrors)].slice(0, 25)) console.log(`║    ❌ ${e.substring(0, 71)}`.padEnd(79) + '║');
  }
  if (networkErrors.length > 0) {
    console.log('╠' + '─'.repeat(78) + '╣');
    console.log('║  API 4xx/5xx:'.padEnd(79) + '║');
    for (const ne of [...new Map(networkErrors.map(e => [e.url.split('?')[0], e])).values()].slice(0, 25)) console.log(`║    ❌ ${ne.method} ${ne.status} ${ne.url.substring(0, 55)}`.padEnd(79) + '║');
  }
  console.log('╚' + '═'.repeat(78) + '╝');

  test.info().attachments.push({
    name: 'store-crawler-v9-report',
    body: Buffer.from(JSON.stringify({ allResults, consoleErrors: [...new Set(consoleErrors)], networkErrors: [...new Map(networkErrors.map(e => [e.url, e])).values()] }, null, 2)),
    contentType: 'application/json',
  });

  const nanIssues = allResults.filter(r => r.nanIssues.some(n => n.includes('$NaN')));
  expect(nanIssues.length, `$NaN issues on: ${nanIssues.map(r => r.screen).join(', ')}`).toBe(0);
});