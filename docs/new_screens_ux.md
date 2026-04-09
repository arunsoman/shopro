Based on my research into mobile-first design patterns and the restaurant management platform requirements, I'll create a comprehensive UX specification document focused purely on user experience, mobile-first design, and interaction patterns.

---

# **RESTAURANT MANAGEMENT PLATFORM — UX SPECIFICATION**
## Mobile-First Design System & Interaction Patterns
### Version 1.0 | March 2026

---

## **DESIGN PHILOSOPHY**

### Mobile-First Approach
This platform adopts a **mobile-first, progressive enhancement** strategy. All screens are designed for touch-first interaction on 375px–428px viewports, then scale up to tablet (768px+) and desktop (1024px+). The design prioritizes **single-handed use**—critical actions reside in the "green zone" (bottom 2/3 of screen, thumb-reachable) .

### Core UX Principles
1. **Progressive Disclosure**: Show only essential data; details in drill-downs 
2. **Card-Based Lists**: Tables transform to cards on mobile; horizontal scroll with shadow indicators for complex data 
3. **Bottom Sheets Over Modals**: Primary actions use bottom sheets (thumb-reachable); modals for confirmations only
4. **Gesture-First**: Swipe actions, pull-to-refresh, edge-swipe navigation 
5. **Touch Targets**: Minimum 44×44px (9mm) for all interactive elements 

---

## **GLOBAL DESIGN SYSTEM**

### Color & Visual Hierarchy
- **Primary Action**: Emerald 600 (#059669) — high contrast on light/dark
- **Danger/Alert**: Rose 500 (#f43f5e)
- **Warning**: Amber 500 (#f59e0b)
- **Success**: Green 500 (#22c55e)
- **Neutral Surface**: Slate 50 (#f8fafc) to Slate 900 (#0f172a)
- **Status Indicators**: 
  - Available: Green dot pulse
  - Warning: Amber dot
  - Critical: Red dot + haptic vibration (mobile)

### Typography Scale (Mobile)
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 28px | 700 | Dashboard KPIs |
| H1 | 24px | 700 | Screen titles |
| H2 | 20px | 600 | Section headers |
| H3 | 16px | 600 | Card titles |
| Body | 14px | 400 | Primary text |
| Caption | 12px | 500 | Metadata, labels |
| Micro | 10px | 600 | Badges, timestamps |

### Spacing System
- **Base unit**: 8px
- **Screen padding**: 16px (mobile), 24px (tablet+)
- **Card padding**: 12px internal
- **Section gaps**: 16px between groups
- **Touch spacing**: 8px minimum between interactive elements

### Component Primitives

**Buttons (Mobile-Optimized)**
- **Primary**: Full-width on mobile (min 48px height), rounded-lg (8px), emerald bg
- **Secondary**: Outlined, same dimensions
- **Floating Action Button (FAB)**: 56×56px, bottom-right with 16px margin, elevated shadow
- **Icon Button**: 44×44px touch target, 24×24px icon centered

**Inputs**
- **Height**: 48px minimum (thumb-friendly)
- **Border radius**: 8px
- **Focus state**: 2px emerald ring + subtle elevation
- **Number inputs**: Large +/- buttons beside field (not just spinners)

**Cards**
- **Border radius**: 12px
- **Shadow**: `0 1px 3px rgba(0,0,0,0.1)` (resting), `0 4px 6px` (elevated)
- **Padding**: 12px–16px
- **Press state**: Scale 0.98 + shadow reduction

---

## **NAVIGATION PATTERNS**

### Global Navigation (Mobile)
**Bottom Tab Bar** (primary navigation)
- 5 tabs max: Dashboard | Inventory | Floor | Recipes | More
- Height: 64px (including safe area)
- Active state: Filled icon + label, emerald color
- Inactive: Outline icon, slate-400
- **Haptic feedback** on tab switch

**"More" Drawer** (overflow navigation)
- Slides up as bottom sheet (not side drawer on mobile)
- Groups: Purchasing | Menu Engineering | Reports | Settings
- Each group collapsible with chevron

### Secondary Navigation
**Slide-Over Drawers** (480px max-width) 
- **Left drawer**: Global menu (hamburger), persistent on tablet+
- **Right drawer**: Notifications, Search, Filters
- **Behavior**: Overlay with scrim (rgba black 50%), swipe to dismiss
- **Animation**: 300ms ease-out cubic-bezier(0.4, 0, 0.2, 1)

**Breadcrumbs** (Tablet+ only)
- Hidden on mobile; visible ≥768px as horizontal scroll if needed

---

## **SCREEN-BY-SCREEN UX SPECIFICATIONS**

---

### **SS0.2 — DASHBOARD (Main Hub)**

**Layout Strategy**
- **Mobile**: Vertical stack, 2-column grid for KPI cards (min 160px each)
- **Tablet**: 4-column grid
- **Desktop**: 4-column + side panel for notifications

**KPI Cards**
```
┌─────────────────────────┐
│  💰 Gross Sales         │  ← Icon 24px, top-left
│     $12,450             │  ← Display typography (28px)
│     ↑ 12% vs yesterday  │  ← Caption, green/red indicator
└─────────────────────────┘
```
- **Touch**: Tap anywhere to drill down (not just chevron)
- **Live indicator**: Pulsing green dot in top-right corner
- **Auto-refresh**: Pull-to-refresh gesture + 60s silent refresh

**Alert Badges (Low Stock / Pending Invoices)**
- **Position**: Below KPI grid, as dismissible banner cards
- **Swipe right**: Mark as read (with haptic)
- **Tap**: Navigate to respective screen
- **Urgency styling**: Red left border (4px) for critical

**Sparkline Chart**
- **Height**: 80px
- **Interaction**: Tap to expand full-screen trend view (modal)
- **No legend on mobile**: Color-coded lines with tooltips on tap

---

### **SS0.3 — GLOBAL SEARCH (Slide-Over)**

**Trigger**: Magnifying glass in top-right of header (always visible)

**Mobile UX**
- **Entry**: Slide-over from right, 100% width on mobile (not 480px)
- **Header**: Sticky search input with cancel button
- **Input**: Auto-focus, large clear button (X) inside field
- **Results**: Grouped by category with sticky headers
  - Ingredients (with thumbnail)
  - Menu Items (with price)
  - Suppliers
  - Batch Recipes

**Result Card**
```
┌─────────────────────────┐
│ [IMG] Ingredient Name   │
│     SKU-123 • $45.00    │
│     In stock: 24 units  │
└─────────────────────────┘
```
- **Thumbnail**: 48×48px, rounded
- **Tap**: Immediate navigation (no preview)
- **Swipe left**: Quick actions (Add to count, View details)

**Empty State**: 
- Icon (search magnifying glass, 64px, slate-300)
- "Start typing to search across inventory, menu, and suppliers"
- Recent searches below (tap to re-run)

---

### **SS1.1 — INGREDIENT MASTER LIST**

**Mobile Layout: Card List (Not Table)** 

Instead of horizontal table scrolling, use vertical cards with progressive disclosure:

```
┌─────────────────────────┐
│ Item Code: F-V-001      │  ← Caption, mono font
│ Fresh Tomatoes          │  ← H3, bold
│ Vegetables • $2.50/lb   │  ← Category • Price
│ ─────────────────────── │
│ Status: ACTIVE  [→]       │  ← Right chevron indicates drill-down
└─────────────────────────┘
```

**Tablet+ Layout**: Traditional table with horizontal scroll and sticky first column 
- First column (Item Code + Description) sticky
- Remaining columns scroll with shadow indicators
- Sortable headers with arrow indicators

**Filter & Sort**
- **Mobile**: Filter button opens bottom sheet (not dropdown)
  - Inventory Type: Segmented control (Food | Bar | All)
  - Category: Scrollable chip list (multi-select)
  - Status: Toggle switch
- **Tablet+**: Inline filter bar above table

**Actions**
- **FAB**: "+" (New Ingredient) — opens SS1.3 as bottom sheet
- **Swipe item left**: Quick actions (Edit, Deactivate)
- **Long press**: Multi-select mode (batch actions appear)

---

### **SS1.2 — INGREDIENT DETAIL**

**Mobile Layout: Accordion Sections** 

Screen divided into collapsible sections (all collapsed by default except header):

```
┌─────────────────────────┐
│ ← Fresh Tomatoes    [Edit]
│ F-V-001 • Vegetables   │
│ [IMAGE - 200px height] │
├─────────────────────────┤
│ ▼ Purchase Unit        │  ← Tap to expand
│   Case: $45.00        │
│   Pack size: 25 lb    │
├─────────────────────────┤
│ ▶ Recipe Unit          │  ← Collapsed
├─────────────────────────┤
│ ▶ Inventory Unit       │
├─────────────────────────┤
│ ▶ Par Level Settings   │
├─────────────────────────┤
│ ▶ Used In Recipes (3)  │
└─────────────────────────┘
```

**Image Handling**
- **Hero image**: 200px height, object-fit cover
- **Upload**: Tap image area → native file picker or camera (on mobile)
- **Placeholder**: Illustrated ingredient icon (category-based)

**"Used In" Section**
- **Collapsed**: Shows count only ("Used in 3 recipes")
- **Expanded**: Scrollable list of recipe cards (mini)
- **Tap recipe**: Navigate to SS3.2

**Edit Mode**
- **Toggle**: Top-right "Edit" becomes "Save" / "Cancel"
- **Fields**: Transform to inputs inline (not separate screen)
- **Validation**: Real-time with inline error messages
- **Keyboard handling**: Next/Prev buttons on numeric keypad

---

### **SS1.3 — NEW INGREDIENT FORM (Slide-Over/Bottom Sheet)**

**Mobile**: Bottom sheet (not slide-over) for thumb reachability
- **Height**: 90% viewport (can be dragged down to dismiss)
- **Handle bar**: At top (visual affordance for dragging)

**Form Layout**
- **Step indicator**: Progress dots if multi-step, or single long form with sections
- **Field grouping**: Related fields in cards with subtle background
- **Live preview**: Sticky bottom card showing computed costs (updates as you type)

```
┌─────────────────────────┐
│ ─────── (drag handle)   │
│ New Ingredient          │
├─────────────────────────┤
│ Description *           │
│ [________________]      │
├─────────────────────────┤
│ Category      Inventory │
│ [Dropdown ▼]  [Food ●]  │
├─────────────────────────┤
│ ... more fields ...     │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 💡 Live Preview     │ │  ← Sticky bottom
│ │ RU Cost: $1.80      │ │
│ │ IU Cost: $1.92      │ │
│ └─────────────────────┘ │
│ [    SAVE INGREDIENT   ]│  ← Full-width, 56px height
└─────────────────────────┘
```

**Input Specifics**
- **Dropdowns**: Native select on mobile (better UX), custom searchable on tablet+
- **Numeric fields**: Large touch targets, +/- buttons for small adjustments
- **Toggle switches**: For binary choices (Food/Bar, Packed By)

---

### **SS1.4 — INVENTORY COUNT ENTRY**

**Critical Mobile UX Challenge**: Editable table with many rows 

**Mobile Solution**: Card-per-item with inline editing

```
┌─────────────────────────┐
│ F-V-001                 │
│ Fresh Tomatoes          │
│ Category: Vegetables    │
│ ─────────────────────── │
│ Par: 20    Current: 12  │
│                         │
│ [ - ]  [    12    ]  [ + ]  ← Large touch targets (56px)
│         Count (IU)      │
│ ─────────────────────── │
│ Extension: $23.04       │
└─────────────────────────┘
```

**Navigation Between Items**
- **Vertical scroll**: Standard
- **Quick jump**: Floating alphabetical index (right edge, like contacts app)
- **Search**: Sticky header search to filter items

**Category Grouping**
- **Sticky headers**: Category name sticks to top while scrolling its items
- **Subtotal bar**: Below each category, collapsible

**Actions**
- **"Save All"**: FAB at bottom-right (floating above content)
- **"Finalize"**: Top-right button (requires confirmation modal)
- **Batch edit**: Long press enters multi-select mode

**Tablet+ Layout**: Traditional table with:
- Sticky first column (Item name)
- Horizontal scroll with shadow indicators 
- Inline count inputs (no card wrapper)

---

### **SS1.8 — LOW STOCK ALERTS**

**Mobile Layout**: Priority-sorted cards with urgency indicators

```
┌─────────────────────────┐
│ 🔴 CRITICAL             │  ← Red left border, bold header
│ Fresh Tomatoes          │
│ Current: 2  |  Par: 20  │
│ Shortage: 18 units      │
│ [Update Par] [Order Now]│  ← Stacked buttons on narrow screens
└─────────────────────────┘
```

**Visual Coding**
- **Critical** (≤10% of par): Red border + pulsing dot + haptic on open
- **Warning** (≤25% of par): Amber border
- **Info** (≤50% of par): Blue border

**Actions**
- **Tap card**: Expand to show last 3 periods of usage (sparkline)
- **"Update Par"**: Inline edit (becomes input field)
- **"Order Now"**: Pre-fills purchase order with this item

---

### **SS2.1 — INVOICE LOG**

**Mobile: Card List with Status Color Coding**

```
┌─────────────────────────┐
│ INV-2024-001            │
│ Supplier Name           │
│ Mar 15, 2024 • $1,250   │
│ ─────────────────────── │
│ [DRAFT]    Proof: ✓ $0  │  ← Status badge + proof indicator
└─────────────────────────┘
```

**Status Badges**
- **DRAFT**: Amber pill badge
- **POSTED**: Green pill badge  
- **VOID**: Gray strikethrough text

**Proof Indicator**
- **Green check**: Proof = $0 (balanced)
- **Red text**: "✗ $45.00" (shows variance amount)
- **Pulsing**: If variance > $10 (attention needed)

**Filter Bottom Sheet**
- Date range: Calendar picker (native on mobile)
- Supplier: Searchable dropdown
- Status: Chip group (multi-select)

---

### **SS2.2 — INVOICE ENTRY**

**Mobile Layout: Vertical Stack (Not Side-by-Side)**

```
┌─────────────────────────┐
│ ← New Invoice       [Save]
├─────────────────────────┤
│ Supplier *              │
│ [Search...          ▼]  │  ← Autocomplete with recent suppliers
├─────────────────────────┤
│ Invoice #     Date      │
│ [________]  [03/30 ▼]   │
├─────────────────────────┤
│ Total Amount            │
│ [    $1,250.00    ]     │  ← Large numeric input
├─────────────────────────┤
│ CATEGORY BREAKDOWN      │
│ ┌─────────────────────┐ │
│ │ Food          [800.00]│ │  ← Inline editable
│ │ Beverage      [300.00]│ │
│ │ Other    [+ Add Line] │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 📊 PROOF            │ │  ← Sticky summary card
│ │ Invoice: $1,250     │ │
│ │ Lines:   $1,100     │ │
│ │ ─────────────────── │ │
│ │ Variance: $150.00 🔴│ │  ← Red if non-zero
│ └─────────────────────┘ │
├─────────────────────────┤
│ [      POST INVOICE     ]│  ← Disabled if proof ≠ 0
└─────────────────────────┘
```

**Proof Visualization**
- **Green**: "Balanced ✓" with checkmark animation
- **Red**: Pulsing red background + amount + "Fix to Post"
- **Interaction**: Tap proof card to auto-scroll to problematic line

**Category Line Editing**
- **Tap amount**: Becomes inline input with numeric keypad
- **Swipe left**: Delete line with confirmation
- **"+ Add Line"**: Expands to show category dropdown + amount field

---

### **SS3.1 — BATCH RECIPE LIST**

**Mobile: Card Grid (2 columns on narrow, 1 on very narrow)**

```
┌──────────┐ ┌──────────┐
│[IMG]     │ │[IMG]     │
│Recipe    │ │Recipe    │
│Name      │ │Name      │
│Station   │ │Station   │
│$2.50/yld │ │$3.20/yld │
│[View]    │ │[View]    │
└──────────┘ └──────────┘
```

**Card Elements**
- **Image**: Square, 80px, category-colored placeholder if no image
- **Title**: 2 lines max, ellipsis overflow
- **Metadata**: Station tag + cost per yield unit
- **Action**: Full card tap to view; no separate button needed

**Filter & Sort**
- **Station filter**: Horizontal scrollable chips (Kitchen | Bar | Prep)
- **Sort**: Bottom sheet (Name | Cost | Recently Updated)

**FAB**: "+" for new recipe (opens SS3.3)

---

### **SS3.3 — BATCH RECIPE EDITOR (Wizard)**

**Mobile: Stepper with Swipe Navigation**

```
┌─────────────────────────┐
│ ← Recipe Editor     [Exit]
│ ●──○──○──○            │  ← Step indicator (4 steps)
│ Step 1: Details         │
├─────────────────────────┤
│ [Form content           │
│  scrolls here]          │
│                         │
│                         │
├─────────────────────────┤
│ [   NEXT: INGREDIENTS   ]│  ← Sticky bottom, full-width
└─────────────────────────┘
```

**Step Navigation**
- **Swipe left/right**: Navigate between steps (with confirmation if dirty)
- **Stepper dots**: Tap to jump (with save prompt if unsaved changes)
- **Progress saving**: Auto-save draft on each step change

**Step 2: Ingredients (Complex Mobile UX)**

```
┌─────────────────────────┐
│ Line 1                  │
│ ┌─────────────────────┐ │
│ │ [Search Ingredient▼]│ │  ← Autocomplete
│ │ Qty: [    2    ] RU │ │  ← Numeric with unit label
│ │ Cost: $3.60         │ │  ← Auto-calculated, gray
│ │ [Remove]            │ │  ← Text button, red
│ └─────────────────────┘ │
│ [ + Add Ingredient ]    │  ← Secondary button
├─────────────────────────┤
│ Running Total: $45.00   │  ← Sticky summary
└─────────────────────────┘
```

**Ingredient Line Interaction**
- **Drag handle**: Left side of card (reordering)
- **Swipe left**: Quick remove (with undo toast)
- **Autocomplete**: Shows ingredient image + name + current cost

---

### **SS3.6 — MENU ITEM COST CARD**

**Mobile Layout: Collapsible Sections**

**Header (Always Visible)**
```
┌─────────────────────────┐
│ ← Chicken Parmesan  [Edit]
│ PLU: MP-001             │
│ [IMAGE - 180px]         │
│ Menu Price: $24.00      │
│ ─────────────────────── │
│ Plate Cost: $8.40       │
│ Food Cost %: 35% 🔴       │  ← Color-coded (green <28, amber 28-35, red >35)
│ GP: $15.60              │
└─────────────────────────┘
```

**Ingredient Lines Section**
- **Collapsed**: "3 ingredients • $8.40 total"
- **Expanded**: List of lines (similar to recipe editor)
- **Reorder**: Drag handles on each line

**Target Price Calculator**
- **Position**: Bottom sticky card
- **Input**: "Target FC %" slider (20%–50%)
- **Output**: "Suggested Price: $28.00" (real-time calculation)

---

### **SS4.2 — MENU ENGINEERING RESULTS**

**Mobile: Card List with Classification Badges**

```
┌─────────────────────────┐
│ 🏆 WINNER               │  ← Classification badge (color-coded)
│ Chicken Parmesan        │
│ PLU: MP-001             │
│ ─────────────────────── │
│ Sold: 145    Mix: 12%   │
│ GP: $15.60   FC: 35%    │
│ [View Details →]          │
└─────────────────────────┘
```

**Classification Visuals**
- **WINNER**: Green trophy icon + green left border
- **WORKHORSE**: Blue gear icon + blue border  
- **OPPORTUNITY**: Amber lightbulb + amber border
- **LOSER**: Red flag + red border (subtle, not punitive)

**Filter Chips** (Sticky top, horizontal scroll)
- "All" | "Winners" | "Workhorses" | "Opportunities" | "Losers"

**Sort Bottom Sheet**
- By Sales (high/low)
- By GP $ (high/low)
- By Food Cost % (high/low)
- By Mix % (high/low)

---

### **SS4.4 — QUADRANT MATRIX (Scatter Plot)**

**Mobile Challenge**: Complex visualization on small screen

**Solution: Interactive Canvas with Gestures**

```
┌─────────────────────────┐
│ Quadrant Matrix     [?] │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │    ●                │ │  ← Scatter plot (zoomable/pannable)
│ │         ●           │ │
│ │    ═══════════      │ │  ← Crosshair lines (avg GP, threshold)
│ │         ●           │ │
│ │                     │ │
│ └─────────────────────┘ │
│ Pinch to zoom • Tap dot │
├─────────────────────┬───┤
│ Legend:             │Fil│
│ 🟢Win 🟡Opp         │ter│
│ 🔵Work 🔴Lose       │   │
└─────────────────────┴───┘
```

**Interactions**
- **Pinch**: Zoom into dense areas
- **Pan**: Move around plot (two-finger)
- **Tap dot**: Opens SS4.3 as bottom sheet with item details
- **Double-tap**: Reset zoom

**Tablet+**: Side panel shows item list synchronized with plot selection

---

### **SS5.0 — FLOOR MAP (Live)**

**Mobile Layout: Scrollable Grid (Not Fixed)**

```
┌─────────────────────────┐
│ Floor Map           [Refresh]
│ ┌───┬───┬───┬───┐     │
│ │ 1 │ 2 │ 3 │ 4 │     │  ← Table numbers
│ │ 🟢│ 🟢│ 🔴│ 🟡│     │  ← Status colors
│ │   │   │4hr│30m│     │  ← Duration (if occupied)
│ ├───┼───┼───┼───┤     │
│ │ 5 │ 6 │ 7 │ 8 │     │
│ │ 🟢│ ⬜│ 🟢│ 🟢│     │  ⬜ = Inactive table
│ └───┴───┴───┴───┘     │
├─────────────────────────┤
│ Legend: 🟢Avail 🟡<1hr │
│         🔴>1hr  ⬜Inactive│
└─────────────────────────┘
```

**Table Cell Design**
- **Size**: Min 72×72px (touch target)
- **Status**: Background color (not just border)
- **Info**: Table number centered, duration below (if occupied)
- **Guest count**: Small badge top-right (if occupied)

**Interactions**
- **Tap available**: Opens SS5.1 (Open Session modal)
- **Tap occupied**: Opens SS5.2 (Session Detail)
- **Long press**: Table info popup (capacity, section, last session)

**Live Updates**
- **WebSocket**: Real-time status changes
- **Animation**: Smooth color transitions (300ms)
- **Sound**: Subtle chime on new session (optional, setting)

---

### **SS5.1 — OPEN SESSION (Modal)**

**Mobile: Centered Modal (Not Full Screen)**

```
┌─────────────────────────┐
│                         │
│    ┌─────────────┐      │
│    │  Open Table │      │  ← Modal card, 90% width
│    │     #12     │      │
│    ├─────────────┤      │
│    │ Guest Count │      │
│    │ [ - ][ 4 ][ + ]    │  ← Large stepper
│    ├─────────────┤      │
│    │ [  CANCEL  ]│      │
│    │ [OPEN TABLE]│      │  ← Primary action, full-width
│    └─────────────┘      │
│                         │
└─────────────────────────┘
```

**UX Details**
- **Backdrop**: Dark scrim, tap to cancel
- **Animation**: Scale up from table position (if possible) or fade in
- **Guest count**: Large touch targets (56px) for +/- 
- **Default**: Pre-filled with 2 guests (editable in settings)

---

### **SS5.2 — SESSION DETAIL / ORDER SCREEN**

**Mobile: Tabbed Interface with Floating Cart**

```
┌─────────────────────────┐
│ ← Table 12         $156 │
│ 4 guests • 45 min • [Edit]│
├─────────────────────────┤
│ [Appetizers][Entrees][..]│  ← Scrollable category tabs
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🍕 Pizza       $14  │ │  ← Menu item card
│ │ [ - ]  [ 2 ]  [ + ] │ │  ← Quantity stepper
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🥗 Salad       $12  │ │
│ │ [ - ]  [ 1 ]  [ + ] │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ ┌─────────────────────┐ │  ← Floating summary card
│ │ Current Order: $86  │ │
│ │ [  FIRE  ] [ CLOSE ]│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Category Tabs**
- **Horizontal scroll**: If more than 4 categories
- **Active**: Underline indicator + bold text
- **Badge**: Shows count of items in that category (if ordered)

**Item Card**
- **Image**: Left side, 60×60px
- **Info**: Name, price, description (2 lines max)
- **Stepper**: +/- with quantity (0 hides "-", shows "Add" instead)

**Order Actions**
- **"Fire"**: Sends to kitchen (confirmation if first fire)
- **"Close Order"**: Requires confirmation, checks for unsent items
- **"Close Session"**: Final settlement (prominent, emerald)

---

## **DIALOG & MODAL PATTERNS**

### Confirmation Modal
```
┌─────────────────────────┐
│                         │
│    ┌─────────────┐      │
│    │  ⚠️ Confirm │      │
│    │             │      │
│    │ Are you sure│      │
│    │ you want to │      │
│    │ finalize?   │      │
│    │             │      │
│    │ [ CANCEL ]  │      │
│    │ [ CONFIRM ] │      │
│    └─────────────┘      │
│                         │
└─────────────────────────┘
```
- **Icon**: Contextual (warning, info, danger)
- **Primary action**: Right side, filled button
- **Destructive actions**: Red background or outline

### Bottom Sheet (For Selections)
```
┌─────────────────────────┐
│ ─────── (handle)        │
│ Select Supplier         │
│ [Search...            ] │
│ ┌─────────────────────┐ │
│ │ Supplier A          │ │
│ │ Supplier B          │ │
│ │ Supplier C          │ │
│ └─────────────────────┘ │
│ [  + New Supplier  ]      │
└─────────────────────────┘
```
- **Height**: 70% viewport (expandable to 90%)
- **Drag down**: Dismiss
- **Selection**: Immediate close + apply

---

## **RESPONSIVE BREAKPOINTS**

| Breakpoint | Layout Changes | Navigation |
|------------|---------------|------------|
| **< 640px** (Mobile) | Single column, cards not tables, bottom sheets | Bottom tab bar |
| **640–768px** (Large Mobile) | 2-column grids where applicable | Bottom tab bar |
| **768–1024px** (Tablet) | Side-by-side panels, horizontal tables | Side drawer + bottom tabs |
| **> 1024px** (Desktop) | Full tables, 3+ columns, persistent sidebars | Persistent left nav |

---

## **ANIMATION & MICRO-INTERACTIONS**

### Standard Durations
- **Quick feedback**: 150ms (button press, toggle)
- **Standard transition**: 300ms (screen changes, modals)
- **Complex animation**: 500ms (drawers, page transitions)

### Easing Functions
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard)
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)` (decelerate)
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` (accelerate)

### Micro-interactions
- **Button press**: Scale 0.96 + shadow reduction
- **Card press**: Scale 0.98 + background darken
- **Success**: Checkmark draw animation + haptic
- **Error**: Shake animation (translate-x ±8px, 3 cycles)
- **Pull-to-refresh**: Elastic resistance + spinner rotation

---

## **ACCESSIBILITY CONSIDERATIONS**

- **Touch targets**: Minimum 44×44px (Apple HIG) / 48×48dp (Material)
- **Color contrast**: 4.5:1 minimum for text, 3:1 for UI components
- **Screen readers**: All icons have aria-labels, dynamic content announces changes
- **Focus management**: Modal traps focus, returns to trigger on close
- **Reduce motion**: Respect `prefers-reduced-motion` media query
- **Haptic feedback**: Used sparingly for success/error (not for every tap)

---

## **PERFORMANCE GUIDELINES**

- **Image optimization**: WebP format, lazy loading below fold
- **List virtualization**: Use react-window or similar for lists >50 items
- **Skeleton screens**: Show while loading (not spinners)
- **Debounced inputs**: 300ms delay for search/filter
- **Optimistic UI**: Update interface before API confirms (for actions like count entry)

---
