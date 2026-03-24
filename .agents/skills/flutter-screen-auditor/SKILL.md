---
name: Flutter Screen UX Auditor (NEXGO EF60 Optimized)
description: >
  Systematically audits Flutter POS screens for data representation efficacy and redesigns 
  them for the NEXGO EF60 dual-screen terminal (1280x800 + 480x480). Generates 3-4 distinct 
  layout variations using Google Stitch, justifies the best UX choice, and implements it.
tags: >
  flutter, ux-audit, google-stitch, nexgo-ef60, dual-screen, pos, layout-optimization
---

# Flutter Screen UX Auditor Skill

This skill is designed to ensure every pixel of the NEXGO EF60 dual-screen terminal is used effectively. It transitions current Flutter screens from generic layouts to high-density, device-optimized experiences.

## Device Context: NEXGO EF60
- **Main Merchant Display**: 10.1-inch IPS, 1280 × 800 px (Landscape)
- **Customer Display**: 4.0-inch, 480 × 480 px (Square)
- **Visibility**: 280 nits brightness, optical bonding.
- **Color Constraint**: **AVOID PURE WHITE (#FFF)**. Use off-white (#f5f4f0) or dark backgrounds for high contrast in retail settings.

---

## Workflow Phases

### Phase 1: Screen Analysis & Functional Audit
1. **Identify Target Screen**: Locate the Flutter screen under review (e.g., in `lib/presentation/screens/`).
2. **Data Extraction**:
   - List all data points currently shown (e.g., order lines, totals, operator info).
   - Identify missing or underrepresented data that should be present for a POS (e.g., shift indicator, void controls).
3. **UX Question**: Ask: "Is this the best way of representing the data for a fast-paced retail environment?"
4. **Learn Functionality**: Document the screen's core actions (e.g., Tap to add, Slide to void, Payment triggers).

### Phase 2: Google Stitch Redesign Prompt
Generate a detailed prompt for Google Stitch using the following template. Inject the learned functionality and data into the placeholders.

**Stitch Prompt Template:**
```
You are designing a dual-screen POS UI for a NEXGO EF60 terminal.
Generate 3 structurally distinct layout variations across 6 labeled artboards.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEVICE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Device: NEXGO EF60 dual-screen POS terminal
Environment: Retail / F&B counter, high ambient light, fast-paced transactions
Users: Cashier (merchant screen) + Customer (customer screen)
Both screens: 280 nits brightness, optical bonding — avoid pure white (#fff)
backgrounds; use off-white (#f5f4f0) or dark backgrounds for contrast

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 1 — MERCHANT DISPLAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Canvas: 1280 × 800 px (landscape, 10.1-inch IPS touchscreen)
User: Cashier / operator
Touch targets: Minimum 44 × 44 px on all interactive elements
Font size: Minimum 14px body, 18px+ for critical data

Content to include:
[INJECT LEARNED MERCHANT CONTENT HERE]
- Active order list (item name, qty, unit price, line total)
- Order subtotal, tax, and grand total
- Product/category quick-add grid
- Payment method buttons (Cash, Card, QR)
- Discount / void / hold order controls
- Cashier name and shift indicator (top bar)
- Clock and order number (top bar)

Realistic dummy data:
[INJECT REALISTIC DUMMY DATA HERE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 2 — CUSTOMER DISPLAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Canvas: 480 × 480 px (square, 4.0-inch touchscreen)
User: Customer
Touch targets: Minimum 56 × 56 px — customer may be unfamiliar with device
Font size: Minimum 18px, totals at 32px+

Content to include:
[INJECT LEARNED CUSTOMER CONTENT HERE]
- Order total (dominant, center stage)
- Itemized order summary (compact)
- Tip selection (3 preset % buttons + custom)
- "Tap card or scan to pay" CTA
- Brand logo or store name at top

Realistic dummy data:
[INJECT REALISTIC DUMMY DATA HERE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHARED DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Font: Use ONE distinctive, non-generic font pairing
  — Display/headings: geometric or humanist (NOT Inter, Roboto, Arial)
  — Body/data: monospaced or tabular figures for prices and numbers
Colors: Deep neutral base + one strong accent (your choice — 
  commit fully, no muted palettes)
Icons: Outlined, consistent weight, min 24px
Spacing: Generous padding, no cramped UI
All 6 frames must share the same font and color system

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT VARIATIONS — Generate all 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VARIATION A — "Split Stage" (high density, dual-panel)
  Merchant: Fixed left panel (order list + totals, 420px wide) 
            + right panel (product/category grid)
            + floating bottom bar (payment actions)
  Customer: Vertically stacked — logo → itemized list → 
            total → tip row → pay CTA

VARIATION B — "Command Center" (workflow-driven, top nav)
  Merchant: Top tab bar (Orders / Products / Reports) 
            + full-width active order table center stage
            + right drawer slides out for payment
  Customer: Centered card with large total dominant, 
            tip as segmented pill selector, 
            pay button full-width at bottom

VARIATION C — "Speed Mode" (minimal, eyes-free optimized)
  Merchant: Full-width scrollable order list takes 70% of screen
            + slim right column for totals only
            + large floating action button cluster (Pay / Void / Hold)
  Customer: Giant order total fills top half (48px+),
            3 oversized tip buttons in a row,
            single full-width "PAY NOW" CTA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Produce exactly 6 artboards
- Label each: "Merchant – A", "Merchant – B", "Merchant – C",
  "Customer – A", "Customer – B", "Customer – C"
- Each variation must be STRUCTURALLY distinct — 
  different spatial layout, not just different colors
- No placeholder or Lorem Ipsum text — use the dummy data above
- No variation should reuse the same component arrangement as another
- Do not add mobile nav patterns (bottom tab bar, hamburger menu)
- Do not generate mobile phone frames — these are terminal screens
```

### Phase 3: Selection & Justification
1. **Present Options**: Show the 3 variations to the user.
2. **Recommendation**: Ask: "Which one should I pick?" and provide a detailed reason based on:
   - Pixel utilization (ensuring no wasted space).
   - Ergonomics for the merchant (hand movement optimization).
   - Clarity for the customer (square screen constraints).
3. **Wait for Approval**: Proceed only after user selects a variation.

### Phase 4: Implementation & Refactoring
1. **Layout Implementation**: Refactor the Flutter screen to match the selected variation.
2. **Device Optimization**:
   - Ensure backgrounds use `#f5f4f0` or dark themes.
   - Enforce min touch target sizes (44px merchant, 56px customer).
   - Use correct font sizes (14px+ merchant, 18px+ customer).
3. **Code Quality**: Follow standard Shopro Flutter architecture (Phase 3 of the Flutter Full-Stack skill).
