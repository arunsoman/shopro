# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audit.spec.ts >> Shopro POS - Full Application Audit >> 1. Authentication — PIN login succeeds
- Location: e2e/audit.spec.ts:38:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - button "Home" [ref=e6] [cursor=pointer]:
          - img [ref=e7]
        - button "Menu" [ref=e9] [cursor=pointer]:
          - img [ref=e10]
        - generic [ref=e12]: Nexus
        - generic [ref=e13]:
          - img [ref=e14]
          - textbox "Search…" [ref=e16]
      - generic [ref=e17]:
        - button "Theme" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
        - button "🇺🇸" [ref=e21] [cursor=pointer]
        - button "Logout" [ref=e22] [cursor=pointer]:
          - img [ref=e23]
    - generic [ref=e25]:
      - complementary:
        - generic [ref=e26]:
          - button "Dashboard" [ref=e27] [cursor=pointer]:
            - img [ref=e28]
            - text: Dashboard
          - button "Inventory" [ref=e30] [cursor=pointer]:
            - img [ref=e31]
            - text: Inventory
          - button "Kitchen" [ref=e33] [cursor=pointer]:
            - img [ref=e34]
            - text: Kitchen
          - button "Prime Cost" [ref=e36] [cursor=pointer]:
            - img [ref=e37]
            - text: Prime Cost
          - button "Engineering" [ref=e39] [cursor=pointer]:
            - img [ref=e40]
            - text: Engineering
          - button "Purchasing" [ref=e42] [cursor=pointer]:
            - img [ref=e43]
            - text: Purchasing
          - button "Experiments" [ref=e45] [cursor=pointer]:
            - img [ref=e46]
            - text: Experiments
          - button "Reports" [ref=e48] [cursor=pointer]:
            - img [ref=e49]
            - text: Reports
          - button "Supplier Pay" [ref=e51] [cursor=pointer]:
            - img [ref=e52]
            - text: Supplier Pay
          - button "Staff & Labor" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
            - text: Staff & Labor
          - button "Kitchen Costs" [ref=e57] [cursor=pointer]:
            - img [ref=e58]
            - text: Kitchen Costs
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - img [ref=e67]
            - generic [ref=e69]:
              - heading "Intelligence Hub" [level=1] [ref=e70]
              - paragraph [ref=e71]: 8 role dashboards · CFO active
          - generic [ref=e72]: Live · 11:41 PM
        - generic [ref=e75]:
          - button "CFO Financial Command" [ref=e76] [cursor=pointer]:
            - generic [ref=e77]:
              - img [ref=e79]
              - generic [ref=e81]: CFO
            - generic [ref=e82]: Financial Command
          - button "General Manager Business Owner View" [ref=e83] [cursor=pointer]:
            - generic [ref=e84]:
              - img [ref=e85]
              - generic [ref=e90]: General Manager
            - generic [ref=e91]: Business Owner View
          - button "Exec Chef Yield Guardian" [ref=e92] [cursor=pointer]:
            - generic [ref=e93]:
              - img [ref=e94]
              - generic [ref=e96]: Exec Chef
            - generic [ref=e97]: Yield Guardian
          - button "FOH Manager Experience Curator" [ref=e98] [cursor=pointer]:
            - generic [ref=e99]:
              - img [ref=e100]
              - generic [ref=e103]: FOH Manager
            - generic [ref=e104]: Experience Curator
          - button "Bar Manager Liquid Assets" [ref=e105] [cursor=pointer]:
            - generic [ref=e106]:
              - img [ref=e107]
              - generic [ref=e111]: Bar Manager
            - generic [ref=e112]: Liquid Assets
          - button "Shift Manager Real-Time Ops" [ref=e113] [cursor=pointer]:
            - generic [ref=e114]:
              - img [ref=e115]
              - generic [ref=e117]: Shift Manager
            - generic [ref=e118]: Real-Time Ops
          - button "Catering Event Profitability" [ref=e119] [cursor=pointer]:
            - generic [ref=e120]:
              - img [ref=e121]
              - generic [ref=e123]: Catering
            - generic [ref=e124]: Event Profitability
          - button "Experiment Lab A/B Test Engine" [ref=e125] [cursor=pointer]:
            - generic [ref=e126]:
              - img [ref=e127]
              - generic [ref=e129]: Experiment Lab
            - generic [ref=e130]: A/B Test Engine
        - generic [ref=e132]:
          - generic [ref=e133]:
            - img [ref=e135]
            - generic [ref=e137]:
              - heading "CFO Command Center" [level=2] [ref=e138]
              - paragraph [ref=e139]: Financial intelligence · 7 decision panels · Real-time
            - generic [ref=e140]: Live
          - generic [ref=e142]:
            - button "Financial Pulse" [ref=e143] [cursor=pointer]:
              - img [ref=e144]
              - text: Financial Pulse
            - button "Leak Detection" [ref=e147] [cursor=pointer]:
              - img [ref=e148]
              - text: Leak Detection
            - button "Menu Matrix" [ref=e150] [cursor=pointer]:
              - img [ref=e151]
              - text: Menu Matrix
            - button "Labor" [ref=e153] [cursor=pointer]:
              - img [ref=e154]
              - text: Labor
            - button "Inventory Capital" [ref=e159] [cursor=pointer]:
              - img [ref=e160]
              - text: Inventory Capital
            - button "Flash Reports" [ref=e164] [cursor=pointer]:
              - img [ref=e165]
              - text: Flash Reports
            - button "Strategic" [ref=e167] [cursor=pointer]:
              - img [ref=e168]
              - text: Strategic
          - generic [ref=e171]:
            - generic [ref=e172]:
              - img [ref=e174]
              - generic [ref=e177]:
                - heading "Executive Financial Pulse" [level=3] [ref=e178]
                - paragraph [ref=e179]: Prime Cost · Cash · Break-Even · Flash P&L
            - generic [ref=e180]:
              - generic [ref=e181]:
                - paragraph [ref=e182]: Prime Cost
                - generic [ref=e183]:
                  - paragraph [ref=e184]: 0.0%
                  - img [ref=e188]
                - generic [ref=e193]:
                  - paragraph [ref=e194]: "Target: 55%"
                  - generic [ref=e195]:
                    - img [ref=e196]
                    - text: 2.1%
              - generic [ref=e199]:
                - paragraph [ref=e200]: Cash Position
                - generic [ref=e201]:
                  - paragraph [ref=e202]: $38,400
                  - img [ref=e206]
                - generic [ref=e211]:
                  - paragraph [ref=e212]: "7-day outlook: ↓$4.2k"
                  - generic [ref=e213]:
                    - img [ref=e214]
                    - text: 5.2%
              - generic [ref=e217]:
                - paragraph [ref=e218]: Break-Even
                - paragraph [ref=e220]: 1200 covers
                - generic [ref=e221]:
                  - paragraph [ref=e222]: "Actual today: 118"
                  - generic [ref=e223]:
                    - img [ref=e224]
                    - text: 24.0%
              - generic [ref=e227]:
                - paragraph [ref=e228]: Flash P&L
                - paragraph [ref=e230]: +$0
                - generic [ref=e231]:
                  - paragraph [ref=e232]: vs last Tue
                  - generic [ref=e233]:
                    - img [ref=e234]
                    - text: 14.7%
            - generic [ref=e237]:
              - paragraph [ref=e238]: Prime Cost Trend (8 weeks)
              - img [ref=e241]:
                - generic [ref=e260]: Target
              - generic [ref=e261]:
                - generic [ref=e262]: 8 weeks ago
                - generic [ref=e263]: Today
            - generic [ref=e264]:
              - button "Lock Purchase Orders" [ref=e265] [cursor=pointer]:
                - img [ref=e266]
                - text: Lock Purchase Orders
              - button "Trigger Emergency Menu Engineering" [ref=e269] [cursor=pointer]:
                - img [ref=e270]
                - text: Trigger Emergency Menu Engineering
              - button "View Full P&L" [ref=e272] [cursor=pointer]:
                - img [ref=e273]
                - text: View Full P&L
    - contentinfo [ref=e276]:
      - generic [ref=e277]: © 2025 ShoPro AI
      - generic [ref=e278]: "|"
      - generic [ref=e279]: v1.8.0
      - generic [ref=e280]: Session 00:10
      - generic [ref=e281]: "|"
  - generic "Notifications"
```

# Test source

```ts
  1  | import { type Page } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Logs in as John Chef using PIN 1234.
  5  |  * Navigates to /staff, clicks the first staff card, enters the PIN.
  6  |  */
  7  | export async function loginAsJohnChef(page: Page): Promise<void> {
  8  |   await page.goto('/staff');
  9  |   await page.waitForLoadState('networkidle');
  10 | 
  11 |   // Click the first staff card (John Chef)
  12 |   const firstCard = page.locator('[data-testid="staff-card"]').first();
  13 |   if (await firstCard.count() > 0) {
  14 |     await firstCard.click();
  15 |   } else {
  16 |     // Fallback: click whichever card contains "Chef" or is first
  17 |     await page.locator('text=John Chef').first().click();
  18 |   }
  19 | 
  20 |   // Wait for PIN pad to appear
  21 |   await page.waitForSelector('button', { timeout: 5000 });
  22 | 
  23 |   // Enter PIN: 1, 2, 3, 4
  24 |   const pinButtons = page.locator('button');
  25 |   // Most PIN pads show digit buttons by their text
  26 |   const digits = ['1', '2', '3', '4'];
  27 |   for (const digit of digits) {
  28 |     await page.locator(`button:has-text("${digit}")`).first().click();
  29 |     await page.waitForTimeout(100);
  30 |   }
  31 | 
  32 |   // Wait for redirect to dashboard
> 33 |   await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10_000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  34 | }
  35 | 
```