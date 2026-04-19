# Menu Engineering — UX QA Report
## "Where to go + what you'll see" Guide

> **Purpose:** After running the seeder and restarting the app, use this guide to navigate every Menu Engineering screen and confirm what you should see. Each entry lists: **Route → What to look for → What data should appear → How to verify it's working.**

---

## How to Get Here

```
1. Open: http://localhost:3000
2. Login as manager / owner
3. Navigate: Sidebar → Menu Engineering  (or /engineering)
```

**First:** Restart the server to trigger the seeder:
```bash
cd /home/arun/IdeaProjects/shopro-pos && ./gradlew :shopro-res:bootRun
```
Or if using IntelliJ: Run the `ShoProApplication` configuration.

**Expected console output on startup:**
```
[ME Seeder] Seeding Menu Engineering data for 16 menu items...
[ME Seeder] Q1 2026 period created with id=1
[ME Seeder] Q2 2026 period created with id=2
[ME Seeder] Done. Q1 id=1, Q2 id=2. Open /engineering to view.
```

---

## Screen Map

| Screen | Route | Tab / Entry |
|--------|-------|-------------|
| Engineering Hub | `/engineering` | Entry point |
| Period Setup | `/engineering/new` | Hub → "New Analysis" |
| Period Detail (Overview tab) | `/engineering/periods/2` | Hub → click any period card |
| Period Detail (Matrix tab) | same + tab switch | Tab 2: Matrix |
| Period Detail (Results tab) | same + tab switch | Tab 3: Results |
| Period Detail (Categories tab) | same + tab switch | Tab 4: Categories |
| Item Drill-Down SlideOver | opens on row click | From Results tab or Matrix dot |
| Recommendation Panel | opens inside slideover | From ItemDrillDownSlideOver |
| What-If Simulator | `/engineering/periods/2/whatif` | Results tab → "What-If" button |
| Period Comparison | `/engineering/compare` | Sidebar or Hub |
| Live Sales Counter | `/engineering/live` | Sidebar or Hub |
| Period History | `/engineering/history` | Sidebar or Hub |

---

## 1. Engineering Hub
### Route: `/engineering`

**What you'll see:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Menu Engineering                                         ⟳    │
│  Powered by 90-day analysis cycles                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ Quick Stats ─────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │ 2 Analyses  │  │  16 Items    │  │  Avg 29.1%  │    │  │
│  │  │ Total       │  │  Analyzed    │  │  Avg FC%    │    │  │
│  │  └──────────────┐  └──────────────┐  └──────────────┘    │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Analysis History                                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🟢 Q1 2026 — Jan to Mar                           [→]   │   │
│  │    Jan 1 – Mar 31, 2026 · COMPLETED · 16 items · 90d  │   │
│  │    Avg FC%: 29.1% · Health Score: 72                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ⚪ Q2 2026 — Apr to Jun                          [→]   │   │
│  │    Apr 1 – Jun 30, 2026 · DRAFT · 16 items · 90d      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ New Analysis]                                               │
└─────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected Value | How to Verify |
|---------|---------------|---------------|
| Total Analyses | `2` | Two period cards visible |
| Q1 2026 card | Status badge: 🟢 COMPLETED | Card has green badge |
| Q2 2026 card | Status badge: ⚪ DRAFT | Card has gray badge |
| Items Analyzed | `16` | Matches count of seeded menu items |
| Avg Food Cost % | ~`29.1%` | Within 20–40% range |
| Period dates | Jan 1–Mar 31 and Apr 1–Jun 30 | Visible on each card |

**Interactions:**
- Click `Q1 2026` card → navigates to `/engineering/periods/1`
- Click `Q2 2026` card → navigates to `/engineering/periods/2`
- Click `+ New Analysis` → opens `CreateAnalysisModal`
- Click `⟳` refresh icon → reloads all period cards

---

## 2. Period Setup (New Analysis)
### Route: `/engineering/new`

**Trigger:** Click `+ New Analysis` on Hub

**What you'll see:**

```
┌──────────────────────────────────────────────────────────────┐
│  Create New Analysis                                    [X]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Analysis Name                                               │
│  [ Q3 2026 — Jul to Sep                               ]      │
│                                                              │
│  Date Range                                                  │
│  ┌──────────────────────┐  →  ┌──────────────────────┐      │
│  │ Jul 1, 2026          │     │ Sep 30, 2026        │      │
│  └──────────────────────┘     └──────────────────────┘      │
│                                                              │
│  Items to Include                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ☑ Mains — Afghan Classics (9 items)                   │   │
│  │ ☑ Skewers & Kebabs (3 items)                          │   │
│  │ ☑ Sides & Naan (4 items)                              │   │
│  │ ☑ Beverages (2 items)                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Note: Quantity data will be pulled from POS orders           │
│  during the selected date range.                              │
│                                                              │
│              [ Cancel ]           [ Run Analysis → ]          │
└──────────────────────────────────────────────────────────────┘
```

**What to expect:**
- Analysis name pre-filled with next quarter
- Date range pickers (DateRangePicker component)
- Category checkboxes pre-checked for all 4 groups

**Interactions:**
- Fill name → enter period name
- Select dates → sets startDate/endDate
- Click categories → toggles inclusion
- Click `Run Analysis` → POSTs to BE → creates period → redirects to `/engineering/periods/{newId}`

---

## 3. Period Detail — Overview Tab
### Route: `/engineering/periods/2` → Tab 1 (default)

**Trigger:** Click any period card on Hub

**What you'll see:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Hub            Q2 2026 — Apr to Jun                         ⚪ DRAFT │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─ KPI Strip ─────────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │    │
│  │  │ 16           │  │ 3,847         │  │ $52,340      │  │  4,287   │  │    │
│  │  │ Total Items  │  │ Total Orders  │  │ Total Revenue│  │  Total CM│  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘  │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─ Classification Breakdown ──────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │   ⭐ Stars (WINNER)       5 items   (31.3%)   ▲ CM: $14.50 avg         │   │
│  │   🧩 Puzzles (OPPORTUNITY) 5 items   (31.3%)   🧩 CM: $13.20 avg        │   │
│  │   🐴 Plow Horses (WORKHORSE) 4 items (25.0%)   🐴 CM: $5.80 avg        │   │
│  │   🐶 Dogs (LOSER)          2 items   (12.5%)   🐶 CM: $4.10 avg         │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─ Top 5 Performers ──────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  1. 🥇 Fresh Tandoori Naan         $8.20 CM  · 534 orders · 12.5% mix  │   │
│  │  2. 🥈 Dogh (Yogurt Drink)        $4.60 CM  · 456 orders · 10.7% mix  │   │
│  │  3. 🥉 Shami Kebab               $7.20 CM  · 445 orders · 10.4% mix  │   │
│  │  4.     Kabuli Pulao             $12.40 CM · 340 orders ·  8.0% mix  │   │
│  │  5.     Chicken Tikka             $10.80 CM · 335 orders ·  7.8% mix  │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  [ Finalise Analysis ]    [ View Matrix → ]    [ View Results → ]              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected (Q1 data) | Notes |
|---------|-------------------|-------|
| Period name | `Q2 2026 — Apr to Jun` | |
| Status | DRAFT (gray badge) | Q1 would be COMPLETE (green) |
| Total Items | `16` | Matches seeded items |
| Classification counts | ⭐ 5, 🧩 5, 🐴 4, 🐶 2 | Based on qty/margin classification |
| Top performers | Fresh Naan (🐴 Plow Horse, highest qty), Dogh (⭐ Star) | Sorted by CM or qty |
| Avg FC% | ~`29%` | Aggregate food cost percentage |

**Interactions:**
- Click `Finalise Analysis` → opens `FinalisePeriodModal`
- Click `View Matrix →` → switches to Matrix tab
- Click `View Results →` → switches to Results tab
- Click any top performer row → opens `ItemDrillDownSlideOver`
- Click ⭐/🧩/🐴/🐶 badge → filters the Overview to that classification

---

## 4. Period Detail — Matrix Tab
### Route: `/engineering/periods/2` → Tab 2: Matrix

**Trigger:** Click `Matrix` tab on PeriodDetailPage

**What you'll see:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Quadrant Matrix — Q2 2026                                         [Full ↗] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│           LOW MIX %                         HIGH MIX %                      │
│  40%       │                              │                                │
│            │                              │                                │
│            │   🧩 PUZZLES               │   ⭐ STARS                     │
│            │   (high CM, low visibility)│   (high CM, high visibility)   │
│            │                              │                                │
│  CM%       │   Mantu      Chopan Kebab   │   Kabuli Pulao  Lamb Karahi   │
│            │   Ashak      Borani Banjan  │   Chicken Tikka  Dogh          │
│            │   Afghan Tea Saffron        │   Kabuli Chicken               │
│            │                              │                                │
│            │                              │                                │
│  20%       │                              │                                │
│            │   🐶 DOGS                   │   🐴 PLOW HORSES              │
│            │   (low CM, low visibility)   │   (low CM, high visibility)   │
│            │                              │                                │
│            │   Bamiya     Gandana Sabzi  │   Kofta Challow  Shami Kebab  │
│            │                              │   Bolani         Fresh Naan    │
│            │                              │                                │
│            │◄──────── avg mix threshold ── ── avg CM threshold ──────────►│
│            └──────────────────────────────┴────────────────────────────────┘
│              Gandana   Kofta                        Shami    Kabuli
│              Bamiya    Challow   ←←← average ─→   Kebab   Chicken
│                                                                              │
│  Legend:  ⭐ WINNER  🧩 OPPORTUNITY  🐴 WORKHORSE  🐶 LOSER                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Quadrant | Should contain (Q2) |
|----------|---------------------|
| ⭐ Stars (top-right) | Kabuli Pulao, Lamb Karahi, Chicken Tikka, Dogh, Kabuli Chicken Palaw |
| 🧩 Puzzles (top-left) | Mantu, Ashak, Chopan Kebab, Borani Banjan, Afghan Saffron Tea |
| 🐴 Plow Horses (bottom-right) | Kofta Challow, Shami Kebab, Bolani, Fresh Tandoori Naan |
| 🐶 Dogs (bottom-left) | Bamiya, Gandana Sabzi |

**Interactions:**
- Click any dot → opens `ItemDrillDownSlideOver` for that item
- Hover dot → shows item name tooltip
- Click `Full ↗` → expands matrix to full screen (if implemented)
- Dots are color-coded by classification badge colors

**How to verify:**
- Stars (top-right) should have highest `sellPrice - itemCost` (contribution margin)
- Plow Horses (bottom-right) should have highest `quantitySold`
- Puzzles (top-left) should have high CM but low qty
- Dogs (bottom-left) should have lowest CM AND lowest qty

---

## 5. Period Detail — Results Tab
### Route: `/engineering/periods/2` → Tab 3: Results

**Trigger:** Click `Results` tab on PeriodDetailPage

**What you'll see:**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Results — Q2 2026                                                      [ What-If → ]        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Filters: [All Classifications ▼]  [All Categories ▼]    Sort: [CM Desc ▼]    [⟳] [⬇]     │
├──────┬──────────────────────────────────────┬────────┬────────┬────────┬────────┬────────────┤
│  PLU │ Item                                │ Price  │ Cost   │ CM     │ Mix %  │ Class      │
├──────┼──────────────────────────────────────┼────────┼────────┼────────┼────────┼────────────┤
│ MI-01│ 🥇 Fresh Tandoori Naan           🐴 │ $3.50  │ $1.40  │ $2.10  │ 12.5%  │ 🐴 Plow H.│
│ MI-16│ Dogh (Yogurt Drink)             ⭐ │ $5.00  │ $1.20  │ $3.80  │ 10.7%  │ ⭐ Star   │
│ MI-10│ Shami Kebab                    🐴 │ $8.50  │ $2.40  │ $6.10  │ 9.3%   │ 🐴 Plow H.│
│ MI-01│ Kabuli Pulao (Lamb)            ⭐ │ $18.50 │ $5.10  │ $13.40 │ 8.0%   │ ⭐ Star   │
│ MI-09│ Chicken Tikka (Herat Style)    ⭐ │ $15.00 │ $4.20  │ $10.80 │ 7.8%   │ ⭐ Star   │
│ MI-02│ Lamb Karahi (Family Style)     ⭐ │ $22.00 │ $6.50  │ $15.50 │ 7.3%   │ ⭐ Star   │
│ MI-14│ Bolani (Potato Stuffed)        🐴 │ $7.00  │ $2.80  │ $4.20  │ 6.8%   │ 🐴 Plow H.│
│ MI-05│ Kabuli Chicken Palaw           ⭐ │ $16.50 │ $5.00  │ $11.50 │ 6.3%   │ ⭐ Star   │
│ MI-08│ Chopan Kebab (Ribs)            🧩 │ $14.00 │ $3.80  │ $10.20 │ 4.9%   │ 🧩 Puzzle │
│ MI-03│ Mantu (Steamed Dumplings)       🧩 │ $12.00 │ $3.20  │ $8.80  │ 3.4%   │ 🧩 Puzzle │
│ MI-04│ Ashak (Leek Dumplings)          🧩 │ $11.00 │ $2.90  │ $8.10  │ 2.9%   │ 🧩 Puzzle │
│ MI-15│ Afghan Saffron Tea              🧩 │ $4.00  │ $0.90  │ $3.10  │ 5.2%   │ 🧩 Puzzle │
│ MI-11│ Borani Banjan (Eggplant)       🧩 │ $6.50  │ $1.60  │ $4.90  │ 2.3%   │ 🧩 Puzzle │
│ MI-06│ Kofta Challow (Meatballs)      🐴 │ $11.00 │ $4.40  │ $6.60  │ 8.5%   │ 🐴 Plow H.│
│ MI-07│ Bamiya (Okra Stew)             🐶 │ $10.00 │ $5.80  │ $4.20  │ 1.3%   │ 🐶 Dog   │
│ MI-12│ Gandana Sabzi (Leeks)          🐶 │ $8.00  │ $4.20  │ $3.80  │ 1.8%   │ 🐶 Dog   │
└──────┴──────────────────────────────────────┴────────┴────────┴────────┴────────┴────────────┘
                                                                                    ▲ sorted CM↓
```

**What data should appear:**

| Column | Expected | Notes |
|--------|----------|-------|
| PLU | `MI-01`, `KB-01` etc. | POS item identifiers |
| Item | Menu item names from MenuCostingSeeder | |
| Classification badge | ⭐ 🧩 🐴 🐶 color-coded | 4 classifications present |
| Mix % | Percentage of total orders | Naan highest (~12.5%), Dogs lowest |
| CM | Contribution margin = sellPrice - itemCost | Stars highest |
| FC% (if shown) | Food cost % | Dogs should show >40% |

**Filters:**
- `All Classifications` dropdown → filter by ⭐/🧩/🐴/🐶
- `All Categories` dropdown → filter by menu category
- `Sort: CM Desc` → currently sorted by contribution margin descending
- Other sorts: Mix %, Price, Qty Sold

**Interactions:**
- Click any row → opens `ItemDrillDownSlideOver`
- Click price cell on 🐴 or 🐶 row → opens `RepriceModal` inline
- Click `What-If →` → navigates to `/engineering/periods/{id}/whatif`
- Click column header → re-sorts table
- Click `⬇` export → downloads CSV/JSON

---

## 6. Item Drill-Down SlideOver
### Route: Opens on `/engineering/periods/{id}` → click any row

**Trigger:** Click any row in the Results table (or any dot in the Matrix)

**What you'll see:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Kabuli Pulao (Lamb)                                                   [X]   │
│  Mains — Afghan Classics                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ ⭐ STAR — High Profit · High Visibility                                │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐   │
│  │  $18.50   │  │   $5.10   │  │  $13.40   │  │      340              │   │
│  │  Price    │  │   Cost    │  │    CM     │  │  Qty Sold (Q2 2026)   │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────────────┘   │
│  ↗ 340 orders · 8.0% mix · ↑ High Popularity                                │
│                                                                              │
│  ── Strategic Recommendation ─────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  ⭐ RETAIN                                                           │  │
│  │                                                                     │  │
│  │  Your best-performing dish. Protect quality and consider a modest    │  │
│  │  price increase — customers who love it are least price-sensitive.  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  💡 Stars can typically handle $0.50–$1.00 increases without volume loss.   │
│     Try a +$0.75 test on this item. Potential annual impact: +$8,100        │
│     [ Test Price Increase → ]                                               │
│                                                                              │
│  ⚠️  Alert if CM drops below $11.40 (threshold: -$2.00)                   │
│                                                                              │
│  ── Historical Analysis ──────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Q1 2026 — Apr to Jun                            ⭐ 326 orders · $12.80 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ── Recommendations ──────────────────────────────────────────────────────  │
│  Recommendations (3 total)                                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🔒 Retain and Protect                          PENDING · High         │  │
│  │  projected: +$4,560/year if price maintained                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  📸 Add Photography                              PENDING · Medium     │  │
│  │  projected: +26 orders/90 days → +$481                                 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  🏷️ Price Increase Test                            IN PROGRESS · High  │  │
│  │  projected: +$1,140/period at +$1.00                                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  1 pending · 1 in progress                                                  │
│                                                                              │
│  [ View All Recommendations → ]                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Section | Expected | Notes |
|---------|----------|-------|
| Header | Item name + category + classification badge | |
| KPI grid | Price, Cost, CM, Qty Sold | From MenuEngResult |
| Mix % indicator | Mix % with ↗ arrow | High/Low/Medium |
| Strategic rec | Text specific to classification | ⭐=RETAIN, 🧩=REPLATE, 🐴=REPRICE, 🐶=RETHINK |
| CM Alert | ⚠️ for Stars if CM below threshold | Alert threshold = CM - $2 |
| Historical analysis | Q1 period data if available | Shows trend |
| Recommendations list | 1-5 recommendations per item | Filtered to this itemId |
| Recommendation status | Color-coded status badges | Pending=amber, InProgress=cyan, Completed=green |

**4 R's Recommendation Text by Classification:**

| Classification | Card text |
|---------------|-----------|
| ⭐ Star | "Retain and protect. Maximize visibility. Avoid discounting." |
| 🧩 Puzzle | "Increase visibility. Reposition to Golden Triangle. Add photos." |
| 🐴 Plow Horse | "Improve margins. Reprice (+$1-2), reduce portion, or bundle." |
| 🐶 Dog | "Consider removal or redesign. Replace with Puzzle candidates." |

**Interactions:**
- Click `Test Price Increase →` → opens `RepriceModal`
- Click `View All Recommendations →` → opens `RecommendationPanel`
- Click `Open in Recipes` → navigates to recipe module
- Close (X or click outside) → closes slideover

---

## 7. Recommendation Panel
### Route: Opens inside `ItemDrillDownSlideOver` → click "View All Recommendations"

**Trigger:** Click `View All Recommendations →` in ItemDrillDownSlideOver

**What you'll see:**

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🧩 Recommendations: Mantu (Steamed Dumplings)                                  [X]     │
│  90-day analysis · 🧩 Puzzle · CM: $8.80 (73%)                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌── 📸 Priority: HIGH ──────────────────────────────────────────────────────────┐   │
│  │                                                                                 │   │
│  │  Add Photography to Menu                                                         │   │
│  │                                                                                 │   │
│  │  Items with photos sell 30% more (Cornell, 2012). Add a high-quality photo     │   │
│  │  to the menu card. Use natural lighting, shallow depth of field. Place in      │   │
│  │  a highlighted "Chef's Specials" box on the à la carte page.                  │   │
│  │                                                                                 │   │
│  │  📍 Where:  "Chef's Specials" box, upper-right of Main Courses                 │   │
│  │  📷 Photo needed:  Yes — high quality, natural lighting                        │   │
│  │  📈 Est. impact:  +26 orders/90 days  →  +$312 revenue                         │   │
│  │                                                                                 │   │
│  │  Status: [ PENDING ▼ ]                                                         │   │
│  │                                                                                 │   │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]                          │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│  ┌── ✍️ Priority: HIGH ──────────────────────────────────────────────────────────┐   │
│  │                                                                                 │   │
│  │  Rewrite Menu Description                                                       │   │
│  │                                                                                 │   │
│  │  Current:  "Mantu (Steamed Dumplings)"                                         │   │
│  │                                                                                 │   │
│  │  Suggested:                                                                    │   │
│  │  ┌────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │ "Hand-folded Afghan dumplings, filled with spiced beef and leeks,        │  │   │
│  │  │  topped with yogurt-mint sauce and dried mint."                           │  │   │
│  │  └────────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                                 │   │
│  │  Status: [ PENDING ▼ ]                                                         │   │
│  │                                                                                 │   │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]                          │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│  ┌── 🎯 Priority: MEDIUM ───────────────────────────────────────────────────────┐   │
│  │                                                                                 │   │
│  │  Reposition to Golden Triangle                                                   │   │
│  │  Move from current section to center-right of à la carte page.                  │   │
│  │                                                                                 │   │
│  │  Status: [ IN PROGRESS ▼ ]                                                     │   │
│  │                                                                                 │   │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]                          │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│  ┌── 🏷️ Priority: LOW ──────────────────────────────────────────────────────────┐   │
│  │                                                                                 │   │
│  │  Rename Item (Optional)                                                          │   │
│  │  Consider: "Hand-Folded Mantu" or "Afghan Dumplings"                            │   │
│  │                                                                                 │   │
│  │  Status: [ DISMISSED ▼ ]                                                       │   │
│  │  ✕ Dismissed: "Keep original name — already evocative"                         │   │
│  │                                                                                 │   │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]                          │   │
│  └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected | Notes |
|---------|----------|-------|
| Item name | Matches selected item | "Mantu (Steamed Dumplings)" |
| Classification badge | 🧩 Puzzle | Same as parent slideover |
| Recommendation cards | 3-6 cards per item | Number varies by classification |
| Priority badge | HIGH / MEDIUM / LOW | Color-coded |
| Status dropdown | PENDING / IN_PROGRESS / COMPLETED / DISMISSED | Selectable |
| Action buttons | "Mark In Progress" / "Complete" / "Dismiss" | Update status on click |
| Projected impact | Revenue or CM impact | From BE `projectedImpactProfit` |
| Priority HIGH cards | Top of list | Visual ordering |

**Recommendation Count by Classification:**

| Classification | Recommendations | Types |
|---------------|----------------|-------|
| ⭐ Star | 2-3 | RETAIN, PROTECT, FEATURE |
| 🧩 Puzzle | 4-6 | INCREASE_VISIBILITY, ENHANCE_DESCRIPTION, TRAIN_STAFF, REPOSITION |
| 🐴 Plow Horse | 3-4 | REPRICE_UP, REDUCE_PORTION_COST, BUNDLE |
| 🐶 Dog | 3-4 | REMOVE, REDESIGN, REPLACE |

**Interactions:**
- Click `Mark In Progress` → PATCH status → button changes to "In Progress" state
- Click `✓ Complete` → PATCH status → card visually marked as completed
- Click `✕ Dismiss` → PATCH status → card grayed out or hidden
- Change status dropdown → PATCH `/recommendations/{uuid}/status`
- Close (X) → closes panel, returns to `ItemDrillDownSlideOver`

---

## 8. Reprice Modal (Inline)
### Route: Opens on `/engineering/periods/{id}` → tap price cell in Results table

**Trigger:** Tap price cell on any 🐴 or ⭐ row in Results table

**What you'll see (for a Plow Horse — Classic Cheeseburger scenario):**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Adjust Price — Kofta Challow (Meatballs)                              [X]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Current Price              Suggested Increase                              │
│  ┌──────────────┐         ┌──────────────┐                                 │
│  │   $11.00    │   →     │   $12.00     │  (+$1.00)                        │
│  └──────────────┘         └──────────────┘                                 │
│                                                                              │
│  ── Impact Preview ──────────────────────────────────────────────────────────  │
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐                               │
│  │ Before           │    │ After (+$1.00)   │                               │
│  │ CM:    $6.60    │    │ CM:    $7.60    │  ↑ +$1.00                     │
│  │ FC%:   40.0%   │    │ FC%:   36.7%   │  ↓ below 40%                   │
│  │ Mix:    8.5%   │    │ Mix:    ~8.3%  │  ≈ stable                      │
│  └──────────────────┘    └──────────────────┘                               │
│                                                                              │
│  Volume sensitivity: ~3-5% drop per $1 increase.                            │
│  Net annual impact: +$1,365 after volume adjustment                         │
│                                                                              │
│  ── Notes ──────────────────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Reason for change (optional, logged for audit):                          │  │
│  │ [ e.g. Food cost increase passed to guests                               ] │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│            [ Cancel ]                            [ Apply Price ]             │
└──────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected | Notes |
|---------|----------|-------|
| Current price | From MenuEngResult `sellPrice` | e.g., $11.00 |
| Suggested price | Current + $1.00 | Auto-calculated |
| Before CM | From `contributionMargin` | e.g., $6.60 |
| After CM | Current CM + $1.00 | Recalculated |
| Before FC% | `itemCost / sellPrice * 100` | e.g., 40.0% |
| After FC% | Lower than before | Target: < 40% |

**Interactions:**
- Edit new price field → impact preview updates live
- Check "Reduce portion by 10%" → additional CM improvement shown
- Click `Cancel` → modal closes, no changes
- Click `Apply Price` → POSTs to `/periods/{id}/apply-whatif` → slideover closes → results refresh

---

## 9. What-If Simulator Page
### Route: `/engineering/periods/2/whatif`

**Trigger:** Click `What-If →` in Results table toolbar, or navigate directly

**What you'll see:**

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Analysis    What-If Simulator                              LIVE 🔴      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─ Override Panel ───────────────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │  🔽 Price Overrides                                       [+ Add Item]  │    │
│  │                                                                         │    │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │    │
│  │  │ Kofta Challow    $11.00  →  [ $12.00 ]    ✕                     │  │    │
│  │  └───────────────────────────────────────────────────────────────────┘  │    │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │    │
│  │  │ Shami Kebab     $8.50  →  [ $9.50 ]      ✕                     │  │    │
│  │  └───────────────────────────────────────────────────────────────────┘  │    │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │    │
│  │  │ Fresh Naan      $3.50  →  [ $4.00 ]      ✕                     │  │    │
│  │  └───────────────────────────────────────────────────────────────────┘  │    │
│  │                                                                         │    │
│  │  [+ Add Item]    [ Reset All ]                                          │    │
│  │                                                                         │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│  ── Impact Summary ────────────────────────────────────────────────────────────     │
│                                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐    │
│  │ Before              │  │ After               │  │ Delta                  │    │
│  │ FC%:  29.1%         │  │ FC%:  27.4%         │  │ FC%:  -1.7%  ↓         │    │
│  │ CM:   $52,340       │  │ CM:   $54,820       │  │ CM:   +$2,480  ↑       │    │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────────┘    │
│                                                                                      │
│  ┌─ Classification Changes ──────────────────────────────────────────────────┐    │
│  │                                                                         │    │
│  │  🐴 → ⭐ Kofta Challow    CM: $6.60 → $7.60 (reclassified!)              │    │
│  │  🐴 → 🧩 Fresh Naan      CM: $2.10 → $3.10 (improved but mix still high) │    │
│  │                                                                         │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│        [ Cancel ]                                        [ Apply Changes → ]        │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected | Notes |
|---------|----------|-------|
| Period name | `Q2 2026` | Same as parent period |
| LIVE badge | 🔴 LIVE | Simulation is real-time |
| Override list | Items with editable price fields | From seeded data |
| Before/After FC% | Two KPI cards showing change | Delta = difference |
| Classification changes | Highlighted if item would reclassify | e.g., 🐴 → ⭐ |
| Add Item button | Opens autocomplete | To add more items |
| Reset All button | Clears all overrides | Reverts to original |

**Interactions:**
- Edit price cell → Impact Summary updates in real time (or on debounce)
- Click `+ Add Item` → opens search to add more items
- Click `✕` on row → removes that override
- Click `Reset All` → clears all overrides
- Click `Cancel` → returns to PeriodDetailPage
- Click `Apply Changes →` → opens `ApplyChangesModal` → confirms → POSTs to `/periods/{id}/apply-whatif`

---

## 10. Period Comparison Page
### Route: `/engineering/compare`

**Trigger:** Click Comparison in sidebar or from Hub

**What you'll see:**

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│  Period Comparison                                                           [Compare] │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Select Periods:                                                                        │
│                                                                                          │
│  ┌────────────────────┐            ┌────────────────────┐                             │
│  │ Q1 2026 — Jan-Mar  │     ↔     │ Q2 2026 — Apr-Jun  │                             │
│  │ [ Select ▼]        │            │ [ Select ▼]        │                             │
│  └────────────────────┘            └────────────────────┘                             │
│                                                                                          │
│  ┌─ Period Summary ────────────────────────────────────────────────────────────────┐  │
│                                                                                          │
│  │  Metric               │  Q1 2026          │  Q2 2026          │  Change          │  │
│  │  ─────────────────────┼──────────────────┼──────────────────┼──────────────────│  │
│  │  Total Revenue        │  $48,200          │  $52,340          │  +$4,140  ↑     │  │
│  │  Total CM             │  $38,560          │  $42,870          │  +$4,310  ↑     │  │
│  │  Avg FC%              │  31.2%            │  29.1%            │  -2.1%    ↓     │  │
│  │  Stars                │  4 items          │  5 items          │  +1        ↑     │  │
│  │  Puzzles              │  4 items          │  5 items          │  +1        ↑     │  │
│  │  Plow Horses          │  5 items          │  4 items          │  -1        ↓     │  │
│  │  Dogs                 │  3 items          │  2 items          │  -1        ↓     │  │
│  │                                                                                  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
│  ┌─ Item Movement ──────────────────────────────────────────────────────────────────┐  │
│                                                                                          │
│  │  Item                    │  Q1           │  Q2           │  Status              │  │
│  │  ────────────────────────┼───────────────┼───────────────┼──────────────────────│  │
│  │  🥇 Fresh Tandoori Naan  │ 🐴 Workhorse  │ 🐴 Workhorse  │  ↑ CM improved       │  │
│  │  🥈 Dogh (Yogurt Drink)  │ ⭐ Star       │ ⭐ Star       │  ✓ Stable            │  │
│  │  Mantu (Dumplings)       │ 🧩 Puzzle     │ 🧩 Puzzle     │  ↑ Mix improved      │  │
│  │  Bamiya (Okra Stew)      │ 🐶 Dog        │ 🐶 Dog        │  ↓ Near removal      │  │
│  │  Chopan Kebab            │ 🐶 Dog        │ 🧩 Puzzle     │  🟢 REPLATE worked!  │  │
│  │  Lamb Karahi             │ ⭐ Star       │ ⭐ Star       │  ✓ Stable            │  │
│  │                                                                                  │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected | Notes |
|---------|----------|-------|
| Period selectors | Q1 2026, Q2 2026 in dropdowns | Both available |
| Delta indicators | ↑ ↓ → colored arrows | Show direction of change |
| Stars count | Q1: 4, Q2: 5 | Chopan Kebab moved 🐶→🧩 |
| Puzzles count | Q1: 4, Q2: 5 | Chopan Kebab moved 🐶→🧩 |
| Plow Horses count | Q1: 5, Q2: 4 | |
| Dogs count | Q1: 3, Q2: 2 | |
| Item movement | Shows reclassifications | Mantu, Chopan Kebab moved |
| "REPLATE worked!" highlight | Green badge on Chopan Kebab | Evidence of REPLATE tactics |

**Interactions:**
- Select Q1 / Q2 from dropdowns → comparison updates
- Click any item row → opens `ItemDrillDownSlideOver` for that item
- Click `Compare` button → refreshes data
- Change date range → re-fetches periods

---

## 11. Live Sales Counter Page
### Route: `/engineering/live`

**Trigger:** Click Live in sidebar or from Hub

**What you'll see:**

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  Live Sales Counter                               🔴 LIVE    [Start] [Stop]        │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─ Today's Summary ─────────────────────────────────────────────────────────────┐  │
│  │                                                                                │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │  │
│  │  │       47        │  │       89        │  │    $1,342.50    │              │  │
│  │  │  Orders Today  │  │  Items Sold    │  │  Revenue Today │              │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │  │
│  │                                                                                │  │
│  │  Avg Order Value: $28.56  ·  Last updated: just now                         │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌─ Live Order Feed ────────────────────────────────────────────────────────────┐  │
│  │                                                                                │  │
│  │  🔵 #1047   Table 5   2 items   $34.50   12:45 PM                           │  │
│  │  🔵 #1046   Table 2   4 items   $67.20   12:38 PM                           │  │
│  │  🔵 #1045   Bar       1 item    $12.00   12:31 PM                           │  │
│  │  🔵 #1044   Table 8   3 items   $45.80   12:22 PM                           │  │
│  │  ...                                                                        │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  Note: Live data requires active POS orders. Start a service to see live feed.      │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected | Notes |
|---------|----------|-------|
| LIVE badge | 🔴 LIVE | Pulsing indicator |
| Orders Today | Count from active sessions | Updates as orders come in |
| Items Sold | Sum of items across orders | Updates in real time |
| Revenue Today | Running total | Updates as orders close |
| Avg Order Value | Revenue / Orders | Calculated |
| Live Order Feed | Recent orders | Newest at top |

**Note:** Live data requires active POS sessions. To see live data:
1. Open POS in another browser tab
2. Create orders for Table 1, Table 2, etc.
3. Watch the Live tab update in real time

---

## 12. Period History Page
### Route: `/engineering/history`

**Trigger:** Click History in sidebar or from Hub

**What you'll see:**

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  Period History                                                          [Export]   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─ All Analyses ────────────────────────────────────────────────────────────────┐  │
│  │                                                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 🟢  Q1 2026 — Jan to Mar                                     [Actions ▼]│ │  │
│  │  │     Jan 1 – Mar 31, 2026 · COMPLETED · 16 items · 90 days               │ │  │
│  │  │     Avg FC%: 31.2% · Avg CM: $8.20 · Health Score: 68                  │ │  │
│  │  │     [ View → ]  [ Compare → ]  [ Delete ]                              │ │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ ⚪  Q2 2026 — Apr to Jun                                     [Actions ▼]│ │  │
│  │  │     Apr 1 – Jun 30, 2026 · DRAFT · 16 items · 90 days                  │ │  │
│  │  │     [ View → ]  [ Finalise → ]  [ Delete ]                            │ │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**What data should appear:**

| Element | Expected | Notes |
|---------|----------|-------|
| Period cards | Q1 2026, Q2 2026 | Sorted newest first |
| Status badge | 🟢 COMPLETED / ⚪ DRAFT | Color-coded |
| Period dates | Jan–Mar and Apr–Jun 2026 | Visible on each card |
| Items count | `16` | Matches seeded items |
| Duration | `90 days` | Per period |
| Actions menu | View / Compare / Delete | Per period |

**Interactions:**
- Click `View →` → navigates to `/engineering/periods/{id}` (PeriodDetailPage)
- Click `Compare →` → opens comparison with another period
- Click `Delete` → ConfirmModal → deletes period
- Click `Finalise →` (DRAFT periods) → `FinalisePeriodModal`
- Click `Export` → downloads period data

---

## Quick Verification Checklist

Run through this checklist after seeding to confirm everything is working:

### Engineering Hub ✅
- [ ] Two period cards visible (Q1 2026 🟢 COMPLETED, Q2 2026 ⚪ DRAFT)
- [ ] "New Analysis" button visible
- [ ] Stats show "2 Analyses" and "16 Items"

### Period Detail — Overview Tab ✅
- [ ] 4 KPI cards (Items, Orders, Revenue, CM)
- [ ] Classification breakdown (⭐ 5, 🧩 5, 🐴 4, 🐶 2)
- [ ] Top performers list visible

### Period Detail — Matrix Tab ✅
- [ ] Scatter plot with 16 dots (one per item)
- [ ] Dots color-coded by classification
- [ ] Axes labeled: CM% (vertical) and Mix% (horizontal)
- [ ] Quadrant labels visible

### Period Detail — Results Tab ✅
- [ ] Table with 16 rows (one per item)
- [ ] Classification badges visible on each row (⭐ 🧩 🐴 🐶)
- [ ] Mix % column sorted descending (Naan first, Dogs last)
- [ ] "What-If →" button in top-right

### ItemDrillDownSlideOver ✅
- [ ] Opens on row click
- [ ] Shows 4 KPI cards (Price, Cost, CM, Qty)
- [ ] Shows strategic recommendation text
- [ ] Shows "View All Recommendations →" button
- [ ] For Stars: CM alert visible
- [ ] For Puzzles: research-backed tactic hints visible

### RecommendationPanel ✅
- [ ] Opens on "View All Recommendations →"
- [ ] Shows 3-6 recommendation cards
- [ ] Each card has Priority badge (HIGH/MEDIUM/LOW)
- [ ] Each card has Status dropdown
- [ ] "Mark In Progress" / "Complete" / "Dismiss" buttons on each card

### What-If Simulator ✅
- [ ] Override panel with editable price fields
- [ ] Before/After Impact Summary visible
- [ ] Classification change predictions shown
- [ ] "Apply Changes →" button functional

### Period Comparison ✅
- [ ] Two period selectors (Q1 2026, Q2 2026)
- [ ] Comparison table with delta columns
- [ ] Item movement section visible
- [ ] Delta arrows (↑↓) colored correctly

### Live Sales ✅
- [ ] LIVE badge visible
- [ ] Orders/items/revenue counters visible
- [ ] Live order feed (after creating POS orders)

---

*Document Version: 1.0*
*Last Updated: 2026-04-17*
*Sources: menu-engineer-screens.md, menu-engineer-action-screens.md, MenuEngineeringSeeder.java*
