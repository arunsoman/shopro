# Menu Engineering — Action Screens

> **Purpose:** Maps every user-facing action from the Menu Engineering study to the actual UI screens (existing or to-be-built), organized by classification (4 R's). Each section follows: **Entry Screen → What User Sees → Action Triggers → Action Screens (UI + Non-UI).**

**Reading this doc:** Start with §2 (Architecture) to understand where actions live, then go to your classification of interest (§5–§8). §9 is the complete Non-UI Action Reference for cross-functional teams.

---

## 1. Classification Quick Reference

| Symbol | Classification | Enum | Action | Priority |
|--------|---------------|------|--------|----------|
| ⭐ | **Star** | `WINNER` | RETAIN — protect quality, consider modest price increase | Maintain |
| 🧩 | **Puzzle** | `OPPORTUNITY` | REPLATE — increase visibility, add photos, rewrite descriptions | **High** |
| 🐴 | **Plow Horse** | `WORKHORSE` | REPRICE — raise price, reduce portions, bundle with sides | **High** |
| 🐶 | **Dog** | `LOSER` | RETHINK — remove, hide, or reinvent | **Immediate** |

---

## 2. Where Actions Live — UX Architecture

Every action falls into one of four categories:

| Pattern | When Used | Example |
|---------|-----------|---------|
| **Inline on row** | Quick single-item execution | Tap price cell → `RepriceModal` |
| **SlideOver panel** | Exploration + multi-tactic overview | Click row → `ItemDrillDownSlideOver` |
| **Full page** | Complex multi-item simulation | `WhatIfSimulatorPage` |
| **Non-UI** | Cross-functional / human work | Kitchen recipe standardization, server training |

### Action Screen Hierarchy

```
PeriodDetailPage (/engineering/periods/:periodId)
│
├── Tab 1: Overview       → PeriodOverviewPanel
│   └── Action: Top 5 Stars / Alert Items row click
│       └── → ItemDrillDownSlideOver
│
├── Tab 2: Matrix         → QuadrantMatrix
│   └── Action: Scatter dot click
│       └── → ItemDrillDownSlideOver
│
├── Tab 3: Results        → ResultsTable
│   ├── Action: Row click
│   │   └── → ItemDrillDownSlideOver → RecommendationPanel
│   ├── Action: Tap price cell (Plow Horse / Dog)
│   │   └── → RepriceModal / RethinkModal (inline)
│   └── Action: "What-If" button
│       └── → WhatIfSimulatorPage
│
└── Tab 4: Categories     → CategorySummaryTable
    └── Action: Row click → ResultsTable (pre-filtered)
```

---

## 3. Shared Components Used Across All Action Screens

| Component | Used In | Purpose |
|-----------|---------|---------|
| `ClassificationBadge` | All screens | ⭐ 🧩 🐴 🐶 color-coded badge |
| `ItemDrillDownSlideOver` | ResultsTable, Matrix, Overview | Drill into item details |
| `RecommendationPanel` | ItemDrillDownSlideOver | Full recommendation list per item |
| `StatusBadge` | All tables | DRAFT / FINALISED / PENDING / COMPLETED |
| `KpiCard` | PeriodDetailPage, WhatIfSimulator | Metric display |
| `RepriceModal` | ResultsTable (inline) | Quick price change for single item |
| `RethinkModal` | ResultsTable (inline) | Remove / rename / reinvent Dog items |
| `WhatIfSimulatorPage` | Full page | Multi-item price simulation |
| `ConfirmModal` | ApplyChanges, Finalise, Delete | Destructive action confirmation |

---

## 4. Classification → Action Screen Matrix

| Classification | Entry (where user starts) | Primary Action UI | Secondary Action UI | Non-UI Actions |
|---|---|---|---|---|
| **⭐ Star** (RETAIN) | ResultsTable → ME.10 | Monitoring badges + pricing nudge in SlideOver | — | Standardize recipe specs, ingredient cost monitoring |
| **🧩 Puzzle** (REPLATE) | ResultsTable → ME.10 | REPLATE tactic card in SlideOver | RecommendationPanel (full tactics list) | Design: photos, descriptions, Golden Triangle; Training: server scripts |
| **🐴 Plow Horse** (REPRICE) | ResultsTable row price tap | `RepriceModal` (inline) | WhatIfSimulatorPage (complex) | Kitchen: portion reduction, ingredient sub; Bundle with high-margin sides |
| **🐶 Dog** (RETHINK) | ResultsTable row → ME.10 | `RethinkModal` (inline) | — | Kitchen: recipe rework; Menu: replacement candidate |
| **All** | ResultsTable / Matrix / Overview | `ItemDrillDownSlideOver` | `RecommendationPanel` | — |

---

## 5. ⭐ Stars — RETAIN

> **Philosophy:** Stars are your best performers. The goal is protection, not heavy intervention. Monitor, protect quality, and capture incremental pricing opportunities.

### 5.1 Entry Screen

**Screen:** `PeriodDetailPage` → **Tab 3: Results** → `ResultsTable`  
**Also accessible from:** Tab 2: Matrix (scatter dot click) · Tab 1: Overview (Top 5 Stars list)

**What the user sees:**

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Filters: [All Classifications ▼] [All Categories ▼]  Sort: [CM Desc ▼]  ⟳ │
├──────┬──────────────────┬───────┬───────┬───────┬───────┬───────┬─────────────┤
│  PLU │ Item             │ Price │ Cost  │ CM    │ FC%   │ Qty   │ Mix  Class │
├──────┼──────────────────┼───────┼───────┼───────┼───────┼───────┼─────────────┤
│ DUCK │ Pan-Seared Duck  │ $26   │ $6.76  │ $19.24│ 27.8% │   87  │  5.2%  🧩  │ ← Puzzle
│ TRUF │ Truffle Burger ⭐│ $22   │ $7.04  │ $14.96│ 32.0% │  312  │ 18.7%  ⭐  │ ← Star
│ SALM │ Salmon en Papil  │ $24   │ $6.00  │ $18.00│ 25.0% │  198  │ 11.9%  ⭐  │ ← Star
│ BURG │ Classic Cheese.  │ $14   │ $8.12  │ $5.88 │ 42.0% │  445  │ 26.7%  🐴  │ ← Plow Horse
│ FISH │ Fish Tacos       │ $17   │ $5.10  │ $11.90│ 30.0% │  289  │ 17.3%  ⭐  │ ← Star
└──────┴──────────────────┴───────┴───────┴───────┴───────┴───────┴─────────────┘
```

**Identifying Stars in the table:**
- Classification badge: ⭐ (emerald)
- High CM (column sorted by CM Desc by default)
- High Qty Sold relative to others

### 5.2 What the User Sees (SlideOver)

**Trigger:** User clicks the Star row → `ItemDrillDownSlideOver` opens

```
┌──────────────────────────────────────────────────────────────────┐
│  Truffle Burger                                            [X]  │
│  SKU: TRUF-001 · Burgers                                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ⭐ STAR — High Profit · High Popularity                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │ $22.00 │  │ $7.04  │  │ $14.96 │  │ 32.0%  │                 │
│  │ Price  │  │  Cost  │  │ CM     │  │  FC%   │                 │
│  └────────┘  └────────┘  └────────┘  └────────┘                 │
│  ↗ 312 orders · 18.7% mix · ↑ High Popularity                   │
│                                                                   │
│  ── Recommendation ─────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ⭐ RETAIN                                                │ │
│  │                                                           │ │
│  │  Your best-performing dish. Protect quality and consider   │ │
│  │  a modest price increase — customers who love it are       │ │
│  │  least price-sensitive.                                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  💡 Tip: Stars can typically handle $0.50–$1.00 increases       │
│     without volume loss. Try a +$0.75 test on this item.        │
│     Potential annual impact: +$8,100                           │
│     [ Test Price Increase → ]                                    │
│                                                                   │
│  ── Monitoring ─────────────────────────────────────────────────  │
│  ⚠️  Alert if CM drops below $13.00 (threshold: -$2.00)          │
│  📎  Recipe linked: TRUF-Burger-v3 · [ Open in Recipes → ]      │
│                                                                   │
│  [ View Recommendations → ]                                      │
└──────────────────────────────────────────────────────────────────┘
```

**Key elements in the SlideOver for Stars:**
1. **⭐ RETAIN card** — brief strategic note
2. **💡 Pricing tip** — estimated annual impact of a modest price increase
3. **"Test Price Increase →"** button → opens `RepriceModal` with a suggested +$0.75 price
4. **⚠️ Monitoring alert** — CM drop threshold warning
5. **📎 Recipe link** → navigates to Recipe detail for quality control

### 5.3 Action Screens

#### Action 5A: Quick Price Increase (Inline Modal)

**Trigger:** User clicks "Test Price Increase →" in SlideOver  
**Screen:** `RepriceModal` (inline, not a full page)

```
┌──────────────────────────────────────────────────────────────────┐
│  Adjust Price — Truffle Burger                              [X]  │
├──────────────────────────────────────────────────────────────────┤
│  Current Price            Suggested Increase                     │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   $22.00     │   →     │   $22.75     │  (+$0.75)           │
│  └──────────────┘         └──────────────┘                      │
│                                                                   │
│  ── Impact Preview ────────────────────────────────────────────  │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ Before           │    │ After (+$0.75)   │                   │
│  │ CM:    $14.96   │    │ CM:    $15.71    │  ↑ +$0.75         │
│  │ FC%:   32.0%    │    │ FC%:   31.0%    │  ↓ better         │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                   │
│  Annual revenue impact (312 orders/90d × 4 = 1,248/yr)          │
│  +$936/year                                                      │
│                                                                   │
│  ⚠️  Volume sensitivity: LOW — Star items show minimal          │
│     volume drop at +$0.50–$1.00 increases.                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  New Price:                                               │  │
│  │  [ $22.75                                                  ] │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│            [ Cancel ]                    [ Apply Price ]           │
└──────────────────────────────────────────────────────────────────┘
```

**On Apply:** Calls `POST /periods/{id}/apply-whatif` → updates item price → SlideOver closes → toast: "Price updated"

**On Cancel:** Modal closes, no changes.

#### Action 5B: Open in Recipes (Navigation)

**Trigger:** User clicks "Open in Recipes →"  
**Action:** Navigates to `/recipes/batch/{recipeId}` in a new route or slide-over.

**Purpose:** Kitchen/ KM can verify recipe specs are maintained. This is a **Non-UI coordination step** — the recipe module owns this screen.

### 5.4 Non-UI Actions for Stars

These require human coordination outside the app. See §9 for full details.

| Non-UI Action | Owner | Trigger | Expected Outcome |
|---|---|---|---|
| Standardize recipe specs — exact ingredients, weights, yields | Chef / KM | Any Star with CM variance >5% | Protect CM consistency |
| Monitor ingredient costs monthly | Chef / KM | Supplier price change notification | Prevent CM erosion |
| Quality check at each service | Chef | Weekly spot-check on top 3 Stars | Maintain customer satisfaction |
| Brief FOH on never discounting Stars | FOH Manager | Before each service | Don't undercut margin |

---

## 6. 🧩 Puzzles — REPLATE

> **Philosophy:** High margin, low visibility. The product is good — the marketing is the problem. Increase visibility through photos, descriptions, positioning, and server recommendations.

### 6.1 Entry Screen

**Screen:** `PeriodDetailPage` → **Tab 3: Results** → `ResultsTable`  
**Also accessible from:** Tab 2: Matrix (upper-left quadrant dots) · Tab 1: Overview (Alert Items section)

**What the user sees:**

```
┌──────┬────────────────────────────┬───────┬───────┬────────┬────────┬──────────┐
│  PLU │ Item                       │ Price │ Cost  │ CM     │ Qty    │ Mix  Class│
├──────┼────────────────────────────┼───────┼───────┼────────┼────────┼──────────┤
│ DUCK │ Pan-Seared Duck       🧩  │ $26   │ $6.76  │ $19.24 │   87  │  5.2%  🧩 │ ← Puzzle
│ RIS0 │ Lobster Risotto       🧩  │ $34   │ $9.80  │ $24.20 │  112  │  6.7%  🧩 │ ← Puzzle
│ VEGG │ Wild Mushroom Tart     🧩  │ $19   │ $5.32  │ $13.68 │   63  │  3.8%  🧩 │ ← Puzzle
│ TRUF │ Truffle Burger         ⭐  │ $22   │ $7.04  │ $14.96 │  312  │ 18.7%  ⭐  │ ← Star
│ BURG │ Classic Cheeseburger   🐴  │ $14   │ $8.12  │  $5.88 │  445  │ 26.7%  🐴  │ ← Plow Horse
└──────┴────────────────────────────┴───────┴───────┴────────┴────────┴──────────┘
```

**Identifying Puzzles in the table:**
- Classification badge: 🧩 (amber)
- High CM relative to quantity sold
- Low Qty / low Mix %
- Located in upper-left quadrant of matrix

### 6.2 What the User Sees (SlideOver)

**Trigger:** User clicks the Puzzle row → `ItemDrillDownSlideOver` opens

```
┌──────────────────────────────────────────────────────────────────┐
│  Pan-Seared Duck                                            [X]  │
│  SKU: DUCK-001 · Main Courses                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🧩 PUZZLE — High Profit · Low Popularity                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │ $26.00 │  │ $6.76  │  │ $19.24 │  │ 27.8%  │                 │
│  │ Price  │  │  Cost  │  │ CM     │  │  FC%   │  ↑ Strong       │
│  └────────┘  └────────┘  └────────┘  └────────┘                 │
│  ↘ Only 87 orders · 5.2% mix · ↓ Low Popularity                 │
│                                                                   │
│  ── Recommendation ─────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  🧩 REPLATE                                                │ │
│  │                                                           │ │
│  │  High margin, low visibility. Product is good — marketing  │ │
│  │  is bad. Increase visibility through photos, repositioning, │ │
│  │  and server recommendations.                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  💡 Research-backed tactics:                                     │
│  │                                                           │ │
│  │  📸 Add photo  →  +30% orders (Cornell study)            │ │
│  │  ✍️  Sensory description  →  +27% orders                 │ │
│  │  🎯  Golden Triangle position  →  +20–30% visibility      │ │
│  │  🎤  Server recommendation script                         │ │
│                                                                   │
│  [ View All Recommendations → ]                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Key elements for Puzzles:**
1. **🧩 REPLATE card** — explains the problem (visibility, not product quality)
2. **Research-backed tactic hints** — with estimated impact percentages
3. **"View All Recommendations →"** → opens `RecommendationPanel` with full tactics list

### 6.3 Action Screens

#### Action 6A: Full Recommendation Panel (SlideOver expanded)

**Trigger:** User clicks "View All Recommendations →" in `ItemDrillDownSlideOver`  
**Screen:** `RecommendationPanel` (second SlideOver layer)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🧩 Recommendations: Pan-Seared Duck                                [X]      │
│  90-day analysis · 🧩 Puzzle · CM: $19.24 (74%)                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── 📸 Priority: HIGH ────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Add Photography to Menu                                              │  │
│  │                                                                       │  │
│  │  Items with photos sell 30% more (Cornell, 2012). Add a             │  │
│  │  high-quality photo to the menu card. Use natural lighting,         │  │
│  │  shallow depth of field. Place in a highlighted "Chef's             │  │
│  │  Specials" box on the à la carte page.                              │  │
│  │                                                                       │  │
│  │  ─────────────────────────────────────────────────────────────────  │  │
│  │  📍 Where:  "Chef's Specials" box, upper-right of Main Courses     │  │
│  │  📷 Photo needed:  Yes — high quality, natural lighting             │  │
│  │  📈 Est. impact:  +26 orders/90 days  →  +$500 revenue             │  │
│  │                                                                       │  │
│  │  Status: [ PENDING ▼ ]                                               │  │
│  │                                                                       │  │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌── ✍️ Priority: HIGH ────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Rewrite Menu Description                                             │  │
│  │                                                                       │  │
│  │  Current:  "Pan-Seared Duck"                                         │  │
│  │                                                                       │  │
│  │  Cornell research: descriptive labels → +27% sales.                   │  │
│  │                                                                       │  │
│  │  Suggested:                                                            │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ "Cedar-plank roasted duck breast, finished with a              │ │  │
│  │  │  blood orange gastrique, served over wild rice pilaf             │ │  │
│  │  │  with roasted root vegetables."                                  │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  Status: [ PENDING ▼ ]                                               │  │
│  │                                                                       │  │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌── 🎯 Priority: HIGH ────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Reposition to Golden Triangle                                        │  │
│  │                                                                       │  │
│  │  Move from "Poultry" section to center-right of à la carte page     │  │
│  │  (upper-right = second-highest attention zone). Add a                │  │
│  │  "Chef's Favorite" callout box with light border/shading.           │  │
│  │                                                                       │  │
│  │  Status: [ PENDING ▼ ]                                               │  │
│  │                                                                       │  │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌── 🎤 Priority: MEDIUM ─────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Add Server Recommendation Script                                     │  │
│  │                                                                       │  │
│  │  Train servers to mention this dish by name:                          │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │ "Our duck is incredible tonight — chef uses a 45-minute          │ │  │
│  │  │  blood orange reduction that makes it really special."           │ │  │
│  │  └────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  Status: [ PENDING ▼ ]                                               │  │
│  │                                                                       │  │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌── 🏷️ Priority: LOW ────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Rename Item (Optional)                                               │  │
│  │                                                                       │  │
│  │  Consider: "Seared Duck Breast" or "Orange-Glazed Duck" — more       │  │
│  │  evocative names. Test as a limited-time special at $28 before       │  │
│  │  committing to the main menu.                                        │  │
│  │                                                                       │  │
│  │  Status: [ PENDING ▼ ]                                               │  │
│  │                                                                       │  │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌── 📍 Priority: LOW ────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Test as Limited-Time Special                                         │  │
│  │                                                                       │  │
│  │  Run at $28 for 2 weeks to test price sensitivity and gauge          │  │
│  │  demand. If volume holds at $28, the item can permanently            │  │
│  │  move to $26–28 with improved positioning.                          │  │
│  │                                                                       │  │
│  │  Status: [ PENDING ▼ ]                                               │  │
│  │                                                                       │  │
│  │  [ Mark In Progress ]  [ ✓ Complete ]  [ ✕ Dismiss ]               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Recommendation Status Workflow:**

```
PENDING  →  IN PROGRESS  →  COMPLETED
                        ↘  DISMISSED
```

Each status change calls `PATCH /recommendations/{id}/status`.

#### Action 6B: Matrix Dot Click (Alternative Entry)

**Trigger:** User clicks a Puzzle dot (upper-left quadrant) in `QuadrantMatrix`  
**Screen:** Same `ItemDrillDownSlideOver` → same flow as 6.1 → 6.3A

**The matrix gives spatial context:** Puzzles cluster in the upper-left (high CM, low Mix). Users can identify clusters of underperforming high-margin items and address them together.

### 6.4 Non-UI Actions for Puzzles

These require human/cross-functional work. See §9 for full details.

| Non-UI Action | Owner | Trigger | Expected Outcome |
|---|---|---|---|
| Source and shoot professional food photography | Marketing | Recommendation "Add photo" → COMPLETED | +30% orders on photographed item |
| Rewrite menu description with sensory language | Menu Designer / Marketing | Recommendation "Rewrite description" → COMPLETED | +27% orders |
| Physically reposition item in printed/digital menu layout | Menu Designer | Recommendation "Golden Triangle" → COMPLETED | +20–30% visibility |
| Train all servers on recommendation script | FOH Manager | Recommendation "Server script" → COMPLETED | Consistent front-of-house push |
| Test item as limited-time special at adjusted price | Chef + GM | Recommendation "LTP test" → COMPLETED | Validate price sensitivity |
| Rename item on menu | Menu Designer | Recommendation "Rename" → COMPLETED | Evocative name increases curiosity |

---

## 7. 🐴 Plow Horses — REPRICE

> **Philosophy:** High volume, low margin. Customers love these items — repricing them carefully recovers margin without losing traffic. Never remove a Plow Horse outright; repricing and bundling first.

### 7.1 Entry Screen

**Screen:** `PeriodDetailPage` → **Tab 3: Results** → `ResultsTable`  
**Also accessible from:** Tab 2: Matrix (lower-right quadrant dots)

**What the user sees:**

```
┌──────┬────────────────────────┬───────┬───────┬────────┬────────┬──────────┐
│  PLU │ Item                  │ Price │ Cost  │ CM     │ Qty    │ Mix  Class│
├──────┼────────────────────────┼───────┼───────┼────────┼────────┼──────────┤
│ BURG │ Classic Cheeseburger🐴│ $14   │ $8.12  │ $5.88  │  445  │ 26.7%  🐴 │ ← Plow Horse
│ CAES │ Caesar Salad        🐴│ $12   │ $6.60  │ $5.40  │  378  │ 22.7%  🐴 │ ← Plow Horse
│ FRIE │ French Fries        🐴│ $6    │ $2.10  │ $3.90  │  620  │ 37.2%  🐴 │ ← Plow Horse
│ TRUF │ Truffle Burger     ⭐ │ $22   │ $7.04  │ $14.96 │  312  │ 18.7%  ⭐  │ ← Star
│ DUCK │ Pan-Seared Duck    🧩│ $26   │ $6.76  │ $19.24 │   87  │  5.2%  🧩 │ ← Puzzle
└──────┴────────────────────────┴───────┴───────┴────────┴────────┴──────────┘
```

**Identifying Plow Horses in the table:**
- Classification badge: 🐴 (cyan)
- High Qty / high Mix % (driving traffic)
- Low CM relative to other items

**Visual alert:** FC% cell colored red (>40%) or amber (30–40%) signals urgency.

### 7.2 What the User Sees (SlideOver)

**Trigger:** User clicks the Plow Horse row → `ItemDrillDownSlideOver` opens

```
┌──────────────────────────────────────────────────────────────────┐
│  Classic Cheeseburger                                      [X]  │
│  SKU: BURG-001 · Burgers                                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🐴 PLOW HORSE — Low Profit · High Popularity                │ │
│  └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │ $14.00 │  │ $8.12  │  │ $5.88  │  │ 42.0%  │  ⚠️ High FC% │
│  │ Price  │  │  Cost  │  │ CM     │  │  FC%   │                 │
│  └────────┘  └────────┘  └────────┘  └────────┘                 │
│  ↗ 445 orders · 26.7% mix · ↑ #1 volume item                   │
│                                                                   │
│  ── Recommendation ─────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  🐴 REPRICE                                                │ │
│  │                                                           │ │
│  │  High volume, low margin. Don't remove — customers love   │ │
│  │  it. Reprice carefully (+$1–2), reduce portion slightly,  │ │
│  │  or bundle with high-margin sides/drinks.                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  💡 Urgency: This is your #1 volume item. Even a $1 price       │
│     increase = +$445/revenue per period = +$1,780/year.         │
│                                                                   │
│  ── Quick Actions ─────────────────────────────────────────────  │
│  [ Raise Price +$1 → ]  [ Bundle with Sides → ]  [ Simulate → ] │
│                                                                   │
│  [ View Recommendations → ]                                      │
└──────────────────────────────────────────────────────────────────┘
```

**Key elements for Plow Horses:**
1. **⚠️ Alert indicator** on FC% cell — signals urgency
2. **🐴 REPRICE card** — explains the situation
3. **Revenue impact hint** — specific dollar value to motivate action
4. **Quick action buttons:**
   - "Raise Price +$1 →" → opens `RepriceModal`
   - "Bundle with Sides →" → opens `WhatIfSimulatorPage` with bundle suggestion
   - "Simulate →" → opens `WhatIfSimulatorPage`

### 7.3 Action Screens

#### Action 7A: Quick Price Increase (Inline Modal)

**Trigger:** User clicks "Raise Price +$1 →" in SlideOver, OR taps the price cell directly in `ResultsTable`  
**Screen:** `RepriceModal` (inline)

```
┌──────────────────────────────────────────────────────────────────┐
│  Adjust Price — Classic Cheeseburger                         [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Current Price            Suggested Increase                      │
│  ┌──────────────┐         ┌──────────────┐                       │
│  │   $14.00     │   →     │   $15.00     │  (+$1.00)            │
│  └──────────────┘         └──────────────┘                       │
│                                                                   │
│  ── Impact Preview ────────────────────────────────────────────  │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │ Before           │    │ After (+$1.00)   │                   │
│  │ CM:    $5.88    │    │ CM:    $6.88    │  ↑ +$1.00         │
│  │ FC%:   42.0%    │    │ FC%:   39.1%    │  ↓ below 40%     │
│  │ Mix:    26.7%   │    │ Mix:    ~26.5%  │  ≈ stable         │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                   │
│  Volume sensitivity analysis:                                      │
│  Plow Horses show ~3–5% volume drop per $1 price increase.       │
│  Expected order change: -13 to -22 orders/period                │
│  Net annual impact: +$1,445 after volume adjustment             │
│                                                                   │
│  ── Advanced Options ───────────────────────────────────────────  │
│                                                                   │
│  □ Also reduce portion by 10% (from 200g → 180g patty)         │
│    Additional CM improvement: +$0.61 per order                   │
│                                                                   │
│  ── Notes ─────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Reason for change (optional, logged for audit):           │   │
│  │ [ e.g. Food cost increase passed to guests                 ] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│            [ Cancel ]                    [ Apply Price ]           │
└──────────────────────────────────────────────────────────────────┘
```

**On Apply:** Calls `POST /periods/{id}/apply-whatif` → updates item price → refetches results → table refreshes with new values.

**"Also reduce portion" checkbox:** Checking this adds a second override in the what-if payload. Useful for gradual repricing + portion control.

#### Action 7B: Multi-Item Simulation (Full Page)

**Trigger:** User clicks "Simulate →" in SlideOver, or "What-If" button in ResultsTable toolbar  
**Screen:** `WhatIfSimulatorPage` (`/engineering/periods/:periodId/whatif`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Analysis    What-If Simulator                              LIVE 🔴│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Override Panel (left sidebar)                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  🔽 Price Overrides                            [+ Add Item] [Reset All] │ │
│  │                                                                         │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ Classic Cheeseburger   $14.00  →  [ $15.00 ]    ✕               │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ Caesar Salad          $12.00  →  [ $13.50 ]    ✕               │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ French Fries           $6.00  →  [ $ 7.00 ]    ✕               │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ── Impact Summary ──────────────────────────────────────────────────────   │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐  │
│  │ Before              │  │ After               │  │ Delta              │  │
│  │ FC%:  38.2%         │  │ FC%:  35.4%         │  │ FC%:  -2.8%  ↓     │  │
│  └─────────────────────┘  └─────────────────────┘  └────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ Classification Changes:                                               │  │
│  │  🐴 → ⭐ Classic Cheeseburger  (CM: $5.88 → $6.88)                  │  │
│  │  🐴 → 🧩 French Fries          (CM: $3.90 → $4.90)                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ⚠️  Note: Classification changes are estimates based on current    │  │
│  │     analysis thresholds. Run a new analysis after applying changes   │  │
│  │     to confirm new classifications.                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│         [ Cancel ]                                    [ Apply Changes → ]    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**WhatIfSimulator behavior:**
- **Left panel:** List of all items with editable price cells (InlineEdit component)
- **"Add Item" button:** Opens Autocomplete to add any item to the override list
- **"Reset All":** Clears all overrides, results revert to original
- **Impact Summary:** Shows Before/After FC% + delta + classification change predictions
- **"Apply Changes →":** Opens `ApplyChangesModal` for confirmation, then calls `POST /periods/{id}/apply-whatif`

#### Action 7C: Bundle Strategy (Inline Tip)

**Trigger:** User clicks "Bundle with Sides →" in SlideOver  
**Screen:** Same `WhatIfSimulatorPage` pre-loaded with the Plow Horse + high-margin side suggestions

**Logic:** System auto-suggests bundling the Plow Horse with top 2 highest-margin sides.

```
Bundle: Classic Cheeseburger + Truffle Fries + Soft Drink

┌──────────────────────────────────────────────────────────────────────┐
│  Bundle Preview: Classic Cheeseburger Combo                          │
├──────────────────────────────────────────────────────────────────────┤
│  Cheeseburger          $15.00   CM: $6.88                            │
│  Truffle Fries    (+)   $8.00   CM: $6.20   ← high margin side     │
│  Soft Drink       (+)   $4.00   CM: $3.60   ← high margin beverage  │
│  ─────────────────────────────────────                              │
│  Combo Price            $27.00   Combined CM: $16.68                 │
│                                                                   │
│  vs. à la carte total: $29.00   CM: $14.48                          │
│                                                                   │
│  ✅ Customer saves $2.00  ·  ✅ Margin protected (+$2.20)         │
│                                                                   │
│  [ Add to What-If Simulation ]    [ Apply Bundle as-is ]            │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.4 Non-UI Actions for Plow Horses

| Non-UI Action | Owner | Trigger | Expected Outcome |
|---|---|---|---|
| Reduce portion size by 10% (test first) | Chef / KM | Recommendation "portion reduction" → COMPLETED | Reclaim ~$0.60/unit margin without noticed difference |
| Substitute cheaper ingredients (quality impact test) | Chef / KM | Price increase + volume drop concern | Reclaim margin while keeping price stable |
| Create combo bundles (Plow Horse + high-margin side/drink) | Menu Designer + Chef | Bundle recommendation | Raise effective margin, increase ticket size |
| Brief servers on upselling premium sides | FOH Manager | Bundle strategy launched | Increase attachment rate on combos |
| Communicate price increase to staff | FOH Manager + GM | Price change applied | Staff can explain quality changes confidently |

---

## 8. 🐶 Dogs — RETHINK

> **Philosophy:** Low margin, low volume. These items drain kitchen complexity and inventory without contributing meaningfully to revenue. Remove, hide, or reinvent — don't let them persist.

### 8.1 Entry Screen

**Screen:** `PeriodDetailPage` → **Tab 3: Results** → `ResultsTable`  
**Also accessible from:** Tab 2: Matrix (lower-left quadrant dots) · Tab 1: Overview (Alert Items section — Dog items with >40% FC%)

**What the user sees:**

```
┌──────┬────────────────────────┬───────┬───────┬────────┬────────┬──────────┐
│  PLU │ Item                  │ Price │ Cost  │ CM     │ Qty    │ Mix  Class│
├──────┼────────────────────────┼───────┼───────┼────────┼────────┼──────────┤
│ VEGG │ Veggie Wrap        🐶 │ $11   │ $6.82  │ $4.18  │   54  │  3.2%  🐶 │ ← Dog
│ GREE │ Greek Salad       🐶  │ $10   │ $6.20  │ $3.80  │   67  │  4.0%  🐶 │ ← Dog
│ TRUF │ Truffle Burger    ⭐  │ $22   │ $7.04  │ $14.96 │  312  │ 18.7%  ⭐ │ ← Star
│ DUCK │ Pan-Seared Duck   🧩  │ $26   │ $6.76  │ $19.24 │   87  │  5.2%  🧩 │ ← Puzzle
│ BURG │ Classic Cheese.   🐴  │ $14   │ $8.12  │ $5.88  │  445  │ 26.7%  🐴 │ ← Plow Horse
└──────┴────────────────────────┴───────┴───────┴────────┴────────┴──────────┘
```

**Identifying Dogs in the table:**
- Classification badge: 🐶 (rose)
- Low CM AND low Qty / Mix %

**Visual alert:** Both FC% and Mix% cells colored to signal double weakness.

### 8.2 What the User Sees (SlideOver)

**Trigger:** User clicks the Dog row → `ItemDrillDownSlideOver` opens

```
┌──────────────────────────────────────────────────────────────────┐
│  Veggie Wrap                                                [X]  │
│  SKU: VEGG-001 · Vegetarian                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🐶 DOG — Low Profit · Low Popularity                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │ $11.00 │  │ $6.82  │  │ $4.18  │  │ 42.0%  │  ⚠️ High FC% │
│  │ Price  │  │  Cost  │  │ CM     │  │  FC%   │                 │
│  └────────┘  └────────┘  └────────┘  └────────┘                 │
│  ↘ Only 54 orders · 3.2% mix · ↓ Low Popularity                │
│                                                                   │
│  ── Recommendation ─────────────────────────────────────────────  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  🐶 RETHINK                                               │ │
│  │                                                           │ │
│  │  Neither profitable nor popular. Three options:             │ │
│  │  1. Remove from menu (if no strategic purpose)             │ │
│  │  2. Reinvent — new recipe, reprice to achieve >55% CM      │ │
│  │  3. Reposition — check if acting as price anchor          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ── Quick Actions ─────────────────────────────────────────────  │
│  [ 🚫 Remove Item → ]  [ 🔄 Reinvent → ]  [ ℹ️ Check Anchors ]  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Key elements for Dogs:**
1. **🐶 RETHINK card** — three clear options
2. **Quick action buttons:** Remove · Reinvent · Check Anchors

### 8.3 Action Screens

#### Action 8A: Remove Item (Confirm Modal)

**Trigger:** User clicks "🚫 Remove Item →" in SlideOver  
**Screen:** `ConfirmModal` (danger variant)

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚠️  Remove Veggie Wrap from Menu?                          [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  This item will be hidden from the menu.                          │
│                                                                   │
│  ── Impact ─────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  CM lost per period:    $225.72  (54 orders × $4.18)      │  │
│  │  Mix % reduction:      -3.2%                               │  │
│  │  Kitchen complexity:    Eliminated                          │  │
│  │  Inventory freed:      4 ingredients                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ⚠️  Check before removing:                                     │
│  □ Dietary requirement item? (vegetarian/vegan option)          │
│  □ Acting as price anchor? ($11 below $14 cheeseburger)         │
│  □ Required for any combo/loyalty offer?                        │
│                                                                   │
│  [ Cancel ]                               [ Remove from Menu ]   │
│                                           (danger)               │
└──────────────────────────────────────────────────────────────────┘
```

**On Remove:** Calls `POST /periods/{id}/apply-whatif` with `isActive: false` on the item → item hidden from future menus.

**Pre-flight checklist:** The modal surfaces key questions before removal (dietary, anchor, combo). This prevents costly mistakes.

#### Action 8B: Reinvent Item (Inline + Navigation)

**Trigger:** User clicks "🔄 Reinvent →" in SlideOver  
**Screen:** Navigation to Recipe Editor + inline `RethinkModal` with reinvention prompts

```
┌──────────────────────────────────────────────────────────────────┐
│  🔄 Reinvent — Veggie Wrap                                  [X]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Target: CM ≥ $7.00 (current: $4.18)                            │
│                                                                   │
│  Option A: Reprice                                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Current price:     $11.00                                 │  │
│  │  New price:         [ $15.00         ]                     │  │
│  │  New CM:            $8.18  (54% margin) ✅                 │  │
│  │  Risk:  May lose vegetarian customers at $15              │  │
│  │  [ Apply New Price ]                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Option B: Recipe Reinvention                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Cheaper ingredients to reduce plate cost from $6.82:       │  │
│  │                                                               │  │
│  │  • Replace halloumi → paneer ($1.20 cheaper)                │  │
│  │  • Replace mixed greens → iceberg lettuce (40¢ cheaper)     │  │
│  │  • Remove sun-dried tomatoes (out of season, $0.60)        │  │
│  │  ───────────────────────────────────────────────────────    │  │
│  │  Total plate cost reduction: $2.20 → new plate cost: $4.62  │  │
│  │  New CM at $11.00: $6.38 (58% margin) ✅                   │  │
│  │                                                               │  │
│  │  [ Open Recipe Editor → ]                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Option C: Replace with New Candidate                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Remove Veggie Wrap and replace with a new Puzzle candidate:│  │
│  │                                                               │  │
│  │  Suggested: Mediterranean Bowl ($16, 65% CM, trending)     │  │
│  │  Matches vegetarian demand without high-cost ingredients.   │  │
│  │                                                               │  │
│  │  [ Replace with Mediterranean Bowl → ]                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│            [ Cancel ]                                              │
└──────────────────────────────────────────────────────────────────┘
```

#### Action 8C: Check Anchors (Inline Tip)

**Trigger:** User clicks "ℹ️ Check Anchors" in SlideOver  
**Screen:** Inline panel expansion (no modal navigation)

```
┌──────────────────────────────────────────────────────────────────┐
│  ℹ️  Price Anchor Analysis                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Veggie Wrap at $11.00 sits below:                                │
│                                                                   │
│  • Caesar Salad         $12.00   → $1 below                      │
│  • Classic Cheeseburger $14.00   → $3 below                       │
│  • Pan-Seared Duck     $26.00   → $15 below                      │
│                                                                   │
│  Assessment: ⚠️  This item may act as a LOW-PRICE ANCHOR.       │
│                                                                   │
│  Anchoring effect: Customers compare other items to $11 and       │
│  feel the $14 burger or $26 duck "isn't too bad."                │
│                                                                   │
│  Recommendation:  Keep at $11 OR reprice to $11.50–$12.50       │
│  if removing. Do NOT remove without understanding the            │
│  psychological pricing impact.                                    │
│                                                                   │
│  [ Keep as Anchor → ]    [ Reprice → ]    [ Remove Anyway → ]   │
└──────────────────────────────────────────────────────────────────┘
```

### 8.4 Non-UI Actions for Dogs

| Non-UI Action | Owner | Trigger | Expected Outcome |
|---|---|---|---|
| Test new recipe with cheaper ingredients | Chef / KM | "Reinvent" option selected | Reduce plate cost to achieve >55% CM |
| Brief menu designer on replacement candidate | Menu Designer | "Replace" option selected | New item enters as potential Puzzle |
| Communicate removal to kitchen team | Chef | "Remove" confirmed | Eliminate prep complexity |
| Update POS system to hide removed item | Manager | "Remove" confirmed | Staff don't offer deleted items |
| Update online/delivery menus | Marketing / Ops | "Remove" confirmed | No customer confusion |

---

## 9. Non-UI Action Reference

> Complete list of all cross-functional actions from the Menu Engineering study that require human work outside the app. Assign these to team members as tasks.

### 9.1 Kitchen & Food Preparation

| Action | Owner | Frequency | Details |
|--------|-------|-----------|---------|
| Standardize Star recipe specs (exact ingredients, weights, cooking times) | Chef / KM | When CM drops >5% on a Star | Recipe cards must be enforced; no improvisation on Stars |
| Monitor ingredient costs monthly | Chef / KM | Monthly | Trigger recalc when supplier prices change |
| Substitute cheaper ingredients on Plow Horses | Chef / KM | Per recommendation | Test with small batches; monitor customer feedback |
| Reduce portion sizes 10% on Plow Horses | Chef / KM | Per recommendation | Often goes unnoticed; check with staff feedback first |
| Test new recipe for Dog reinvention | Chef | Per recommendation | Target CM ≥ $7.00 or 55%+ margin |
| Update recipe in POS/inventory system | KM / IT | When any recipe changes | Synced with recipe module |
| Eliminate prep complexity from removed Dogs | Chef | Per "Remove" action | Free up kitchen time and reduce waste |

### 9.2 Front-of-House & Service

| Action | Owner | Frequency | Details |
|--------|-------|-----------|---------|
| Train servers on Puzzle recommendation scripts | FOH Manager | When "Server script" recommendation → COMPLETED | Specific scripts per item; practice in role-play |
| Brief servers on never discounting Stars | FOH Manager | Before each service | Stars should never be discounted — protect margin |
| Brief servers on combo upsell for Plow Horses | FOH Manager | When bundle launched | "Would you like the combo with truffle fries?" |
| Create incentive program for high-margin item sales | GM | Quarterly | Contest: server with highest margin sales mix wins prize |
| Communicate price increases confidently | FOH Manager + GM | When reprice applied | Staff know WHY price changed (quality/sourcing) |
| Remove deleted items from server tablets | FOH Manager | When Dog removed | No confusion at table |

### 9.3 Menu Design & Marketing

| Action | Owner | Frequency | Details |
|--------|-------|-----------|---------|
| Add photography to Puzzle menu cards | Marketing / Graphic Designer | When "Add photo" recommendation → COMPLETED | 1 photo per page; natural lighting; reserve for Puzzles only |
| Rewrite menu descriptions with sensory language | Menu Designer / Marketing | When "Rewrite description" → COMPLETED | Use: texture, cooking method, origin/quality words |
| Physically reposition items in Golden Triangle | Menu Designer | When "Golden Triangle" → COMPLETED | Upper-left, center, upper-right of each section |
| Add box/highlight callout to Stars and Puzzles | Menu Designer | When repositioning | "Chef's Favorite", "Most Popular", "House Special" |
| Design new menu for Dog replacement | Menu Designer | When "Replace" → COMPLETED | Enter new item as Puzzle candidate at optimal price |
| Sync digital/online menu with printed menu changes | Marketing / Ops | Whenever menu changes | 42% of orders start on mobile — keep in sync |
| Update QR code / tablet menus | Ops | Whenever reprice or remove | Real-time sync prevents margin leakage |

### 9.4 Purchasing & Suppliers

| Action | Owner | Frequency | Details |
|--------|-------|-----------|---------|
| Negotiate bulk pricing on Star ingredients | Procurement | Annually | Protect margin on highest-volume items |
| Buy seasonal ingredients in bulk (freeze) | Chef / Procurement | Seasonal | Lower plate costs = higher CM |
| Find alternative suppliers for expensive Dog ingredients | Procurement | Per "Reinvent" action | Substitute without quality loss |
| Monitor commodity price changes | Procurement | Monthly | Alert Chef/KM when costs shift |

### 9.5 Management & Strategy

| Action | Owner | Frequency | Details |
|--------|-------|-----------|---------|
| Review matrix and adjust thresholds | GM / KM | Quarterly | Costs and preferences shift — thresholds must update |
| Run 90-day re-analysis | KM | Every 90 days | Compare against baseline; track improvement |
| Communicate pricing strategy to staff meeting | GM | When reprice applied | Everyone understands the business rationale |
| Review non-UI action completion weekly | GM | Weekly | Track: photos taken, scripts trained, descriptions updated |
| Assess dietary/variety need before removing Dogs | GM + Chef | Per "Remove" action | Don't remove the only vegetarian option without replacement |
| Test price increases on Stars (A/B test) | GM | When "Test Price Increase" → COMPLETED | Start with +$0.50; monitor volume for 4 weeks |

---

## 10. Action → Screen → Outcome Flow Summary

### REPLATE (Puzzles) — Full Flow

```
User in ResultsTable
    │
    ▼ clicks Puzzle row
ItemDrillDownSlideOver opens
    │  REPLATE card visible
    │  Research hints shown (📸 +30%, ✍️ +27%, 🎯 +20–30%)
    │
    ▼ clicks "View All Recommendations →"
RecommendationPanel opens
    │
    ├─► Completes "Add Photography"  ──────────────────────► Marketing shoots photo
    ├─► Completes "Rewrite Description" ────────────────────► Menu Designer updates text
    ├─► Completes "Golden Triangle"  ────────────────────────► Menu Designer repositions
    ├─► Completes "Server Script"   ────────────────────────► FOH Manager trains staff
    │
    ▼ 90 days later — re-analyze
Result: Puzzle moved to Star, orders ↑40%, CM maintained
```

### REPRICE (Plow Horses) — Full Flow

```
User in ResultsTable
    │
    ▼ taps price cell on Plow Horse row
RepriceModal opens
    │  Current: $14.00 → Suggested: $15.00
    │  Impact preview: CM: $5.88 → $6.88, FC%: 42% → 39%
    │
    ├─► [Apply Price]  ──► POST apply-whatif ──► Price updated, results refresh
    │                              │
    │                              ▼
    │                     Toast: "Price updated to $15.00"
    │
    ▼ OR clicks "Simulate →"
WhatIfSimulatorPage opens
    │  Multiple items in override list
    │  Before/After FC% comparison
    │  Classification change predictions
    │
    ▼ clicks "Apply Changes →"
ApplyChangesModal confirms
    │
    ▼ POST apply-whatif → results refresh
Toast: "12 items updated"
Result: Plow Horse repriced; may reclassify to Star
```

### RETHINK (Dogs) — Full Flow

```
User in ResultsTable
    │
    ▼ clicks Dog row
ItemDrillDownSlideOver opens
    │  RETHINK card: 3 options
    │
    ├─► [🚫 Remove]  ──► ConfirmModal ──► Checklist (anchor, dietary, combo)
    │                              │
    │                              ├─► Confirm: item hidden, kitchen complexity ↓
    │                              └─► OR: Cancel (keep as anchor)
    │
    ├─► [🔄 Reinvent]  ──► RethinkModal
    │                     ├─► Option A: Reprice to $15.00
    │                     └─► Option B: Recipe reinvention → Recipe Editor
    │
    └─► [ℹ️ Check Anchors] ──► Inline panel
                            └─► "Keep as Anchor" or "Reprice" or "Remove Anyway"
```

### RETAIN (Stars) — Monitoring Flow

```
User in ResultsTable
    │
    ▼ clicks Star row
ItemDrillDownSlideOver opens
    │  RETAIN card + pricing tip
    │  ⚠️ CM drop alert if threshold breached
    │
    ▼ clicks "Test Price Increase →"
RepriceModal opens
    │  Suggested: $22.00 → $22.75 (+$0.75)
    │  Annual impact: +$936
    │
    ▼ clicks [Apply Price]
POST apply-whatif → price updated
Result: +$0.75 on Star, volume stable, annual margin ↑$936
```

---

*Document Version: 1.0*
*Last Updated: 2026-04-17*
*Sources: Menu Engineering Study (April 2026), menu-engineer-screens.md, menu-engineering-actions.md*

---

## 11. Screen → API Contract Reference

> Every screen's actions are mapped to their exact HTTP call(s). Inputs and outputs are typed from `menuEngineering.types.ts` (FE) and `EngineeringController.java` (BE). **Green rows = implemented in both FE and BE. Red rows = gap requiring work.**

### How to Read This Section

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented — FE types + BE endpoint both exist |
| ⚠️ | Partial mismatch — FE and BE shapes differ (see notes) |
| 🚫 | Gap — BE endpoint missing OR FE import broken |
| 📝 | No BE endpoint needed — purely client-side computation |

### 11.1 ENUM MISMATCH ALERT — Must Fix First

> Before any screen work, fix these two enums. The BE sends values the FE doesn't recognise, causing silent classification loss.

#### RecommendationType

**FE currently defines only:**

```typescript
// src/types/enums.types.ts
type RecommendationType =
  | "RETAIN" | "REPOSITION" | "REPRICE" | "REPLATE"
  | "RETHINK" | "REMOVE" | "NO_ACTION";
```

**BE actually sends (MenuEngineeringRecommendation.RecommendationType enum):**

```java
// STAR/WINNER
RETAIN, PROTECT, FEATURE, HIGHLIGHT
// PUZZLE/OPPORTUNITY
INCREASE_VISIBILITY, REPOSITION, ENHANCE_DESCRIPTION, PROMOTE, TRAIN_STAFF
// PLOW HORSE/WORKHORSE
REPRICE_UP, REFORMULATE, REDUCE_PORTION_COST, BUNDLE
// DOG/LOSER
REMOVE, REDESIGN, REPLACE, SEASONAL_ONLY, CONVERT_TO_SPECIAL
// General
MONITOR, INVESTIGATE, ANALYZE
```

**Fix required — update `enums.types.ts`:**

```typescript
export type RecommendationType =
  | "RETAIN" | "PROTECT" | "FEATURE" | "HIGHLIGHT"           // WINNER
  | "INCREASE_VISIBILITY" | "REPOSITION" | "ENHANCE_DESCRIPTION" | "PROMOTE" | "TRAIN_STAFF"  // OPPORTUNITY
  | "REPRICE_UP" | "REFORMULATE" | "REDUCE_PORTION_COST" | "BUNDLE"  // WORKHORSE
  | "REMOVE" | "REDESIGN" | "REPLACE" | "SEASONAL_ONLY" | "CONVERT_TO_SPECIAL"  // LOSER
  | "MONITOR" | "INVESTIGATE" | "ANALYZE"                    // General
  | "RETAIN" | "REPRICE" | "REPLATE" | "RETHINK"              // Legacy aliases (for existing data)
  | "NO_ACTION";
```

**Also fix `menuEngineering.types.ts` — `Recommendation` type:**

```typescript
export interface Recommendation {
  // ... existing fields ...
  recommendationType: RecommendationType;   // ✅ aligns with BE
  projectedImpactRevenue?: number;              // ⚠️ BE field: projectedImpactRevenue (BigDecimal) — add this
  projectedImpactMargin?: number;               // ⚠️ BE field: projectedImpactMargin (BigDecimal) — add this
  estimatedImplementationCost?: number;        // ⚠️ BE field: estimatedImplementationCost — add this
  comment?: string;                             // ⚠️ BE field: comment (renamed from actionPlan)
  dismissedReason?: string;                    // ⚠️ BE field: dismissedReason — add this
  approvedBy?: string;                         // ⚠️ BE field: approvedBy — add this
  approvedAt?: string;                         // ⚠️ BE field: approvedAt (LocalDateTime) — add this
  approvalComment?: string;                    // ⚠️ BE field: approvalComment — add this
  completedAt?: string;                        // ⚠️ BE field: completedAt (LocalDateTime) — add this
  projectedImpactProfit?: number;              // ✅ already present (BE alias for projectedImpact)
  actionPlan?: string;                         // ⚠️ keep for backward compat
}
```

#### RecommendationStatus

**FE currently defines:**

```typescript
type RecommendationStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DISMISSED";
```

**BE actually sends:**

```java
PENDING, IN_PROGRESS, COMPLETED, DISMISSED, DEFERRED,
PENDING_APPROVAL, APPROVED, REJECTED
```

**Fix required:**

```typescript
export type RecommendationStatus =
  | "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DISMISSED" | "DEFERRED"
  | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
```

#### RecommendationPriority

**FE currently defines:**

```typescript
type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW";
```

**BE actually sends:**

```java
LOW, MEDIUM, HIGH, CRITICAL
```

**Fix required:**

```typescript
export type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
```

---

### 11.2 RepriceModal — Quick Price Change

**Used by:** ⭐ Stars (Action 5A) · 🐴 Plow Horses (Action 7A)

#### API Call

```
POST /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/apply-whatif
```

#### Input

```typescript
// menuEngineering.api.ts → applyWhatIf()
WhatIfOverride[]  // = { overrides: WhatIfOverride[] } in body

interface WhatIfOverride {
  itemId:       number;    // menu item ID (NOT menuItemId)
  newSellPrice: number;    // new price in dollars
}

// Example: raise Classic Cheeseburger from $14 → $15
{
  "overrides": [
    { "itemId": 42, "newSellPrice": 15.00 }
  ]
}
```

#### Output

```typescript
// BE returns: Map<String, Object> — currently void in FE type
// ⚠️ FIX REQUIRED: update applyWhatIf() return type from void to the actual BE response
interface ApplyWhatIfResult {
  periodId:    number;
  updatedItems: number;
  message:      string;
}
// BE currently returns { success: true } or throws on failure
```

#### Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| FE API function | ✅ `applyWhatIf(restaurantId, periodId, overrides)` | Returns `void` — type mismatch |
| FE hook | ✅ `useApplyWhatIf()` | Calls API, invalidates results + summary |
| BE endpoint | ✅ `POST /periods/{periodId}/apply-whatif` | Accepts `{ overrides }` body |
| Return type | ⚠️ | FE says `void`; BE returns `Map<String,Object>` |

#### What-If Simulation (Read-Only Preview)

Before committing via `apply-whatif`, users can preview:

```
POST /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/whatif
```

```typescript
// Input: same WhatIfOverride[] as above
// Output:
WhatIfResultMap {
  periodId:       number;
  results:        MenuEngResult[];   // reclassified with new prices
  totalRevenue:   number;
  avgFoodCostPct: number;
}
```

#### Backward-Compatibility Note

The BE has **two sets of paths**: the legacy `/analyses/{periodId}/...` paths and the new `/periods/{periodId}/...` paths. The FE uses only the new paths, which is correct. The old paths should be considered deprecated.

---

### 11.3 ItemDrillDownSlideOver — Drill into Single Item

**Used by:** All classifications (⭐ 🧩 🐴 🐶)

#### API Calls (3 separate endpoints)

**A. Get results for the period (list)**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/results
```

```typescript
// Output: MenuEngResult[]
interface MenuEngResult {
  itemId:             number;
  itemName:           string;
  categoryName?:      string;
  quantitySold:       number;
  sellPrice:          number;      // note: this is actually revenue = price × qty in BE
  itemCost:           number;      // foodCost
  grossProfit:        number;      // sellPrice − itemCost
  contributionMargin: number;     // revenue − variable costs
  salesMixPct:        number;      // quantitySold / totalQuantitySold
  classification:     MenuEngClassification;  // WINNER | WORKHORSE | OPPORTUNITY | LOSER
}
```

**B. Get item-level metrics (detail)**

```
GET /restaurants/{restaurantId}/menu-engineering/items/{itemId}/metrics
```

```typescript
// Output: ItemMetricsMap
interface ItemMetricsMap {
  itemId:                 number;
  itemName:               string;
  category:               string;
  sellPrice:              number;
  itemCost:               number;
  contributionMargin:     number;
  foodCostPct:             number;        // foodCostPercentage (note: field name mismatch in FE)
  quantitySold:           number;
  salesMixPct:             number;
  classification:          string;        // ⚠️ BE returns string, not MenuEngClassification
  historicalAnalysis:      HistoricalAnalysisEntry[];
  recommendations:         Recommendation[];  // ⚠️ may return raw BE entity, not typed
  recommendationCount:     number;
}

interface HistoricalAnalysisEntry {
  periodId:          number;
  periodName:        string;
  quantitySold:      number;
  revenue:           number;
  classification:    string;
  contributionMargin: number;
  foodCostPct:       number;
}
```

**C. Get recommendations for a period (filtered by item)**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/recommendations?menuItemId={itemId}
```

```typescript
// Output: Recommendation[]
// Note: recommendationId is UUID string, NOT number
interface Recommendation {
  id:                 string;       // UUID
  periodId:           number;
  menuItemId:         number;
  itemName:           string;       // ⚠️ FE type missing — add this
  classification:     MenuEngClassification;
  recommendationType: RecommendationType;
  title:              string;
  description:         string;
  priority:           RecommendationPriority;
  status:             RecommendationStatus;
  actionPlan?:        string;       // ⚠️ FE type missing — add this
  projectedImpactProfit?: number;   // ⚠️ BE field is projectedImpactProfit (BigDecimal)
  projectedImpactRevenue?: number;  // ⚠️ FE type missing — add this
  projectedImpactMargin?: number;   // ⚠️ FE type missing — add this
  estimatedImplementationCost?: number;  // ⚠️ FE type missing — add this
  assignedTo?:        string;
  dueDate?:           string;
  comment?:          string;        // ⚠️ FE type missing — add this
  dismissedReason?:  string;       // ⚠️ FE type missing — add this
  approvedBy?:       string;        // ⚠️ FE type missing — add this
  approvedAt?:       string;        // ⚠️ FE type missing — add this
  approvalComment?:  string;        // ⚠️ FE type missing — add this
  completedAt?:      string;        // ⚠️ FE type missing — add this
  createdAt:         string;
  updatedAt:         string;
}
```

#### Implementation Status

| API Call | Status | Notes |
|----------|--------|-------|
| `getPeriodResults()` | ✅ | Returns `MenuEngResult[]`, used by `useResults()` hook |
| `getItemMetrics()` | ⚠️ | BE field `foodCostPercentage` vs FE type `foodCostPct` |
| `getRecommendations()` + `menuItemId` param | ✅ | Implemented, returns `Recommendation[]` |

---

### 11.4 RecommendationPanel — Full Tactics List

**Used by:** 🧩 Puzzles (Action 6A)

#### API Calls (4 endpoints)

**A. Get all recommendations for a period**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/recommendations
```

```typescript
// Output: Recommendation[] (see §11.3C for full type)
```

**B. Update recommendation status (mark In Progress / Complete / Dismiss)**

```
PATCH /restaurants/{restaurantId}/menu-engineering/recommendations/{uuid}/status
```

```typescript
// Input body:
{ "status": "IN_PROGRESS" | "COMPLETED" | "DISMISSED" | "DEFERRED" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" }

// Output: Recommendation (updated entity)
```

**C. Assign recommendation to team member**

```
PATCH /restaurants/{restaurantId}/menu-engineering/recommendations/{uuid}/assign
```

```typescript
// Input body:
{ "assignedTo": "string" }
// Output: Recommendation
```

**D. Set due date**

```
PATCH /restaurants/{restaurantId}/menu-engineering/recommendations/{uuid}/due-date
```

```typescript
// Input body:
{ "dueDate": "yyyy-MM-ddTHH:mm:ss" }  // ISO LocalDateTime string
// Output: Recommendation
```

#### Implementation Status

| API Call | Status | Notes |
|----------|--------|-------|
| `getRecommendations()` | ✅ | Returns `Recommendation[]` |
| `updateRecommendationStatus()` | ✅ | Hook: `useUpdateRecommendationStatus()` |
| `assignRecommendation()` | ✅ | BE: `@PatchMapping("/recommendations/{uuid}/assign")` |
| `setRecommendationDueDate()` | ✅ | BE: `@PatchMapping("/recommendations/{uuid}/due-date")` |
| `addRecommendationComment()` | ✅ | BE: `@PatchMapping("/recommendations/{uuid}/comment")` — FE type missing |

#### Missing from FE types (add to `menuEngineering.types.ts`)

```typescript
// Missing Recommendation fields needed by RecommendationPanel:
export interface RecommendationCommentPayload {
  comment: string;
}
// For the comment PATCH endpoint
```

---

### 11.5 WhatIfSimulatorPage — Multi-Item Simulation

**Used by:** 🐴 Plow Horses (Action 7B) · 🐶 Dogs (Action 8B)

#### API Calls (2 endpoints)

**A. Run simulation (preview — no persistence)**

```
POST /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/whatif
```

```typescript
// Input: WhatIfOverride[]
// Output: WhatIfResultMap
interface WhatIfResultMap {
  periodId:       number;
  results:        MenuEngResult[];   // reclassified results with overrides applied
  totalRevenue:   number;
  avgFoodCostPct: number;
}
```

**B. Apply simulation (persist changes)**

```
POST /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/apply-whatif
```

```typescript
// Input: WhatIfOverride[]
// Output: void (BE returns Map<String,Object>) — see §11.2 notes
```

#### Bundle Strategy API (Future — not yet implemented)

**Recommended endpoint:**

```
POST /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/analysis/market-basket
```

```typescript
// BE already exists: GET /periods/{periodId}/analysis/market-basket
// Output: MarketBasketMap
interface MarketBasketMap {
  totalOrders:        number;
  uniqueItems:        number;
  topItemPairs:       ItemPair[];           // items that co-occur
  bundleRecommendations: BundleRecommendation[];  // suggested bundles
}

interface BundleRecommendation {
  bundleName:          string;
  items:               string[];
  expectedLift:        number;
  potentialRevenue:    number;
}
// ✅ FE type MarketBasketMap already defined in menuEngineering.api.ts
```

#### Implementation Status

| API Call | Status | Notes |
|----------|--------|-------|
| `runWhatIf()` | ✅ | Hook: `useWhatIf()` |
| `applyWhatIf()` | ⚠️ | Returns `void`, BE returns `Map` |
| Market basket → bundle strategy | ✅ BE + ✅ FE type | Hook: `useQuery({ queryKey: ['me', 'market-basket', ...] })` — **NOT YET wired in frontend** |

---

### 11.6 RethinkModal — Remove / Reinvent / Replace

**Used by:** 🐶 Dogs (Action 8A, 8B)

#### Remove Item — API Call

Uses same `applyWhatIf` as reprice — but sends `isActive: false`:

```
POST /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/apply-whatif
```

```typescript
// ⚠️ Gap: BE whatif endpoint currently only accepts { itemId, newSellPrice }
// There is NO existing BE endpoint for { itemId, isActive: false }
// 
// Workaround: Reprice Dog to $0.00 (edge case, not clean)
// OR: Create new BE endpoint: POST /periods/{periodId}/items/{itemId}/deactivate
//
// Required BE endpoint (DOES NOT EXIST — gap):
interface DeactivateItemRequest {
  itemId:   number;
  reason:   string;
}
// Required BE endpoint:
// POST /periods/{periodId}/items/{itemId}/deactivate
// Body: { reason: "Dog classification — low volume and margin" }
// Output: { success: boolean, itemId: number, hiddenAt: string }
```

#### Check Anchors — API Call

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/report/top-performers
```

```typescript
// Output: TopPerformerMap[]
interface TopPerformerMap {
  menuItemId:    number;
  itemName:      string;
  categoryName:  string;
  revenue:       number;
  profit:        number;
  marginPct:     number;
  quantitySold:  number;
  salesMixPct:   number;
  classification: MenuEngClassification;
}
// ✅ FE type already defined
```

#### Recipe Reinvention — Navigation

No dedicated ME API. Delegates to Recipe module:

```
GET /recipe/{itemId}/ingredients
GET /recipe/{itemId}/cost-breakdown
GET /recipe/alternatives/{ingredientId}
```

```typescript
// Integration endpoints exist in BE stub:
// GET /integrations/recipe-status
// Returns: { module, status, availableEndpoints[] }
// ✅ BE returns integration status
// 🚫 FE has no hook or API function for recipe integration status
```

#### Implementation Status

| API Call | Status | Notes |
|----------|--------|-------|
| Remove item | 🚫 | No BE endpoint for deactivating items — **GAP** |
| Check anchors (top performers) | ✅ | `getTopPerformers()` hook exists |
| Recipe integration status | ⚠️ | BE stub exists; FE has no hook |

---

### 11.7 PeriodDetailPage — Summary & KPIs

**Used by:** All classifications (entry point)

#### API Calls (5 endpoints)

**A. Period summary (Tab 1: Overview)**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/summary
```

```typescript
// Output: PeriodDetailMap
interface PeriodDetailMap {
  periodId:             number;
  periodName:           string;
  startDate:            string;
  endDate:              string;
  totalItems:           number;
  totalSold:            number;
  totalRevenue:         number;
  totalCost:            number;
  totalProfit:          number;
  avgFoodCostPct:       number;
  avgMargin:            number;
  winnerCount:          number;
  workhorseCount:       number;
  opportunityCount:    number;
  loserCount:           number;
  classificationBreakdown: Record<MenuEngClassification, number>;
  runAt:                string;
}
// ✅ FE type already defined
```

**B. Executive summary (Tab 1: KPIs)**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/summary/executive
```

```typescript
// Output: ExecutiveSummaryMap
interface ExecutiveSummaryMap {
  menuHealthScore:        number;
  kpis: {
    avgFoodCostPct:       number;
    avgContributionMargin: number;
    avgSalesMixPct:       number;
    totalItems:           number;
    totalSold:            number;
    totalRevenue:         number;
    totalCost:            number;
    totalProfit:          number;
  };
  classificationBreakdown: Record<MenuEngClassification, number>;
  topStars?:        MenuEngResult[];     // ⚠️ optional — BE may not always return
  topOpportunities?: MenuEngResult[];   // ⚠️ optional — BE may not always return
  periodName?:      string;              // ⚠️ optional
}
// ✅ FE type already defined
```

**C. Matrix visualization (Tab 2: Quadrant Matrix)**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/visualization/matrix
```

```typescript
// Output: MatrixVisualizationMap
interface MatrixVisualizationMap {
  quadrantDistribution: Record<MenuEngClassification, number>;
  avgFoodCostPct:         number;
  avgContributionMargin:  number;
  avgSalesMixPct:         number;
  menuHealthScore:        number;
}
// ✅ FE type already defined
```

**D. Results (Tab 3: Results Table)**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/results
```

```typescript
// Output: MenuEngResult[]
// ✅ See §11.3A for full type
```

**E. Category distribution (Tab 4: Categories)**

```
GET /restaurants/{restaurantId}/menu-engineering/periods/{periodId}/report/category-distribution
```

```typescript
// Output: CategoryDistributionMap[]
interface CategoryDistributionMap {
  id:            number;   // derived from index — ⚠️ NOT from BE
  category:      string;
  itemCount:    number;
  totalRevenue: number;
  totalProfit:  number;
  avgMargin:    number;
  classification: Record<MenuEngClassification, number>;
}
// ⚠️ BE returns id as derived index; FE type has it as required field
```


#### Implementation Status

| API Call | Status | Notes |
|----------|--------|-------|
| `getPeriodSummary()` | ✅ | Hook: `usePeriodDetail()` |
| `getExecutiveSummary()` | ✅ | Hook: `useExecutiveSummary()` |
| `getMatrixVisualization()` | ✅ | Hook: `useMatrixVisualization()` |
| `getPeriodResults()` | ✅ | Hook: `useResults()` |
| `getCategoryDistribution()` | ⚠️ | `id` field mismatch (BE index vs FE required number) |

---

### 11.8 PeriodComparisonPage — Compare Two Periods

**Used by:** All classifications (cross-period view)

#### API Call

```
GET /restaurants/{restaurantId}/menu-engineering/comparison?period1={id1}&period2={id2}
```

```typescript
// ⚠️ Note: FE API function comparePeriods() takes (restaurantId, periodId1, periodId2)
// but calls: /comparison?period1=X&period2=Y
// while BE endpoint is: @GetMapping("/comparison") with @RequestParam Long period1, Long period2
// ✅ Path and params match

// Output: ComparisonDto
interface ComparisonDto {
  periodName1:   string;
  periodName2:   string;
  periodDetail1: PeriodDetailMap;
  periodDetail2: PeriodDetailMap;
  rows: ComparisonItemRow[];
  totalRevenueP1: number;
  totalRevenueP2: number;
  revenueDelta:  number;
  moversCount:   number;
}

interface ComparisonItemRow {
  id:                  number;           // menuItemId — used as key
  menuItemId:          number;
  itemName:           string;
  classificationPeriod1: MenuEngClassification;
  classificationPeriod2: MenuEngClassification;
  grossProfitP1:      number;
  grossProfitP2:      number;
  salesMixPctP1:      number;
  salesMixPctP2:      number;
  changed:             boolean;
  grossProfitDelta?:  number;
  salesMixDelta?:     number;
  pluNumber?:         string;
}
// ✅ FE type already defined
```

#### Implementation Status

| API Call | Status | Notes |
|----------|--------|-------|
| `comparePeriods()` | ✅ | Hook: `useComparison()` |
| BE comparison endpoint | ✅ | Returns `periodDetail1` + `periodDetail2` + `rows` + deltas |

---

### 11.9 EngineeringHubPage — Dashboard

**Used by:** Entry point for all users

#### API Calls (3 endpoints)

**A. Dashboard (quick overview)**

```
GET /restaurants/{restaurantId}/menu-engineering/dashboard
```

```typescript
// Output: DashboardMap
interface DashboardMap {
  totalAnalyses:      number;
  lastAnalysisDate:   string;
  lastAnalysisPeriod: string;
  avgHealthScore:    number;
  totalItemsAnalyzed: number;
  avgFoodCostPct:    number;
}
// ✅ FE type already defined
```

**B. Quick matrix (4-quadrant summary)**

```
GET /restaurants/{restaurantId}/menu-engineering/matrix
```

```typescript
// Output: MatrixVisualizationMap (same as §11.7C)
// ✅ FE type already defined
```

**C. Workflow stats (recommendation pipeline)**

```
GET /restaurants/{restaurantId}/menu-engineering/recommendations/workflow/stats
```

```typescript
// Output: WorkflowStatsMap
interface WorkflowStatsMap {
  total:      number;
  pending:    number;
  inProgress: number;
  completed:  number;
  dismissed:  number;
  byType:     Record<RecommendationType, number>;
  byPriority: Record<RecommendationPriority, number>;
}
// ✅ FE type already defined
```

#### Implementation Status

| API Call | Status | Notes |
|----------|--------|-------|
| `getDashboard()` | ✅ | Hook: `useDashboard()` |
| `getQuickMatrix()` | ✅ | Returns latest period's matrix |
| `getWorkflowStats()` | ✅ | Hook: `useWorkflowStats()` |

---

### 11.10 Advanced Analytics Endpoints (Not Yet Wired in UI)

> These BE endpoints exist but have no FE hooks or UI screens. They are the building blocks for Phase 7+ features.

| Endpoint | BE Path | FE Hook | UI Screen | Priority |
|----------|---------|---------|-----------|----------|
| Food Cost Comparison | `GET /periods/{id}/analysis/food-cost-comparison` | 🚫 Missing | Future | Medium |
| Price Elasticity | `GET /periods/{id}/analysis/price-elasticity` | 🚫 Missing | Future | Medium |
| Market Basket Analysis | `GET /periods/{id}/analysis/market-basket` | ⚠️ Type exists, not wired | Bundle strategy | High |
| Server Performance | `GET /periods/{id}/analysis/server-performance` | 🚫 Missing | Future | Low |
| Demand Forecasting | `GET /periods/{id}/analysis/demand-forecast` | 🚫 Missing | Future | Medium |
| Quarterly Reviews | `GET /reviews/quarterly` | 🚫 Missing | Future | Low |
| Overdue Recommendations | `GET /recommendations/overdue` | ⚠️ API exists, not used in UI | Future | Medium |
| All Recommendations (filtered) | `GET /recommendations/all` | ⚠️ API exists, not used in UI | Future | High |

---

### 11.11 Summary: Gap Tracker

| Gap | Severity | Owner | Fix |
|-----|----------|-------|-----|
| RecommendationType enum missing BE values | 🔴 High | FE Dev | Update `enums.types.ts` — add 20+ missing values |
| RecommendationStatus missing DEFERRED/APPROVAL states | 🔴 High | FE Dev | Update `enums.types.ts` |
| RecommendationPriority missing CRITICAL | 🟡 Medium | FE Dev | Update `enums.types.ts` |
| `Recommendation` type missing 10+ BE fields | 🔴 High | FE Dev | Update `menuEngineering.types.ts` |
| `applyWhatIf` returns `void`, BE returns `Map` | 🟡 Medium | FE Dev | Update return type + handle BE response |
| Remove item — no BE endpoint | 🔴 High | BE Dev | New: `POST /periods/{id}/items/{itemId}/deactivate` |
| Recipe integration — no FE hook | 🟡 Medium | FE Dev | Wire `getRecipeIntegrationStatus()` |
| `CategoryDistributionMap.id` — BE index mismatch | 🟡 Medium | FE Dev | Make `id` optional in FE type |
| `ItemMetricsMap.foodCostPct` vs BE `foodCostPercentage` | 🟡 Medium | FE Dev | Rename FE field to match BE |
| Market basket → bundle strategy not wired | 🟡 Medium | FE Dev | Wire `getMarketBasketAnalysis()` into WhatIfSimulator |
| Approval workflow (submit/approve/reject) — no UI | 🟡 Medium | FE Dev | RecommendationPanel + new modals |
| Quarterly reviews — no UI | 🟡 Medium | FE Dev | New page |
| Server performance — no UI | 🟢 Low | Future | Future page |
| Demand forecasting — no UI | 🟢 Low | Future | Future page |

---

### 11.12 Minimal Viable Fix Sequence

To make the app functional with current data:

**Step 1 — Enum fix (30 min)**
```bash
# Update src/types/enums.types.ts:
# RecommendationType: add all 20+ BE values
# RecommendationStatus: add DEFERRED/PENDING_APPROVAL/APPROVED/REJECTED
# RecommendationPriority: add CRITICAL
```

**Step 2 — Recommendation type fix (20 min)**
```bash
# Update src/types/menuEngineering.types.ts — Recommendation interface:
# Add: itemName, actionPlan, projectedImpactRevenue, projectedImpactMargin,
#      estimatedImplementationCost, comment, dismissedReason,
#      approvedBy, approvedAt, approvalComment, completedAt
```

**Step 3 — applyWhatIf return type (10 min)**
```bash
# Update src/api/menuEngineering.api.ts:
# export function applyWhatIf(...) → return apiPost<ApplyWhatIfResult>(...)
# Add ApplyWhatIfResult interface
```

**Step 4 — Remove item BE endpoint (45 min)**
```java
// In EngineeringController.java:
@PostMapping("/periods/{periodId}/items/{itemId}/deactivate")
public ResponseEntity<Map<String, Object>> deactivateMenuItem(
        @PathVariable Long restaurantId,
        @PathVariable Long periodId,
        @PathVariable Long itemId,
        @RequestBody Map<String, String> body) {
    return ResponseEntity.ok(periodService.deactivateMenuItem(
            restaurantId, periodId, itemId, body.get("reason")));
}
```

**Step 5 — ItemDrillDownSlideOver wiring (1 hr)**
```bash
# Wire useItemMetrics(restaurantId, itemId) into ItemDrillDownSlideOver
# Wire useRecommendations(restaurantId, periodId) → filter by selected itemId
```

After these 5 steps: all 4 classification action screens will be functional with real data.
