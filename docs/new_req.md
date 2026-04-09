# Restaurant Management System — Detailed Requirements

> Derived exclusively from the uploaded files:
> - `Inventory_Count_Sheet.xlsx`
> - `Hourly_Guest_Count_Tracking_Template.xlsx`
> - `Inventory_sheet_tamplate.xlsx`
> - `accounting_checklist.docx`
> - `Recipe_chart.xlsx`
> - `Menu___Recipe_costing_tamplates.xlsm`
> - `weekly_prime_cost_sheet.xlsx`

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Restaurant Profile](#2-restaurant-profile)
3. [Ingredient & Inventory Master](#3-ingredient--inventory-master)
4. [Inventory Counting](#4-inventory-counting)
5. [Recipe Management](#5-recipe-management)
6. [Menu Costing](#6-menu-costing)
7. [Menu Engineering](#7-menu-engineering)
8. [Recipe Build Charts](#8-recipe-build-charts)
9. [Purchase & Invoice Tracking](#9-purchase--invoice-tracking)
10. [Labor Hours & Cost Tracking](#10-labor-hours--cost-tracking)
11. [Prime Cost Worksheet](#11-prime-cost-worksheet)
12. [Weekly Budget](#12-weekly-budget)
13. [Prime Cost Report](#13-prime-cost-report)
14. [Trend Analysis](#14-trend-analysis)
15. [Hourly Guest Count Tracking](#15-hourly-guest-count-tracking)
16. [Accounting Period Checklist](#16-accounting-period-checklist)
17. [Data Relationships & Constraints](#17-data-relationships--constraints)
18. [Calculations & Business Rules](#18-calculations--business-rules)
19. [Non-Functional Requirements](#19-non-functional-requirements)

---

## 1. System Overview

The system is a comprehensive restaurant back-office management platform covering four operational domains:

- **Inventory & Purchasing** — ingredient master, weekly purchase invoices, food and bar inventory counts, and cost-of-sales calculation.
- **Recipe & Menu Costing** — batch recipe library, menu item costing, unit conversion, and recipe build cards for kitchen stations.
- **Weekly Financial Reporting** — prime cost calculation, actual vs. budget comparison, and multi-week trend analysis.
- **Guest Intelligence** — 30-minute interval guest counts tracked over rolling 3-week periods.

All financial figures are in a single currency. All dates follow the ISO 8601 standard (`YYYY-MM-DD`). A **week** always runs Monday through Sunday (7 days).

---

## 2. Restaurant Profile

### 2.1 Data Fields
| Field | Type | Notes |
|---|---|---|
| Restaurant name | String | Displayed on all reports |
| Week start date | Date | User-configurable; drives all week-period records |
| Taxes & benefits rate | Decimal (0–1) | Default 0.22 (22%); applied to gross payroll |

### 2.2 Rules
- The restaurant name must propagate to every sheet/report header automatically.
- Changing the week start date must recalculate all derived week-end dates.

---

## 3. Ingredient & Inventory Master

### 3.1 Purpose
Central catalogue of all purchasable ingredients. Maximum **500 ingredients** and **150 sub-recipes** (batch recipes treated as ingredients).

### 3.2 Data Fields per Ingredient
| Field | Type | Constraints |
|---|---|---|
| Item Code | String | Zero-padded 3-digit, e.g. "001"–"500"; unique |
| Item Description | String | Required |
| Case Pack / Size | String | e.g. "6/10 can", "50 lb. sack", "4/1 gal. jug", "12/750 ml bottle", "1000 ct. box", "6/5-lb. tin", "4/2.5-lb. box" |
| Purchase Unit (PU) | String | e.g. Case, Each, LB, Bottle, Bag, Carton, Box, Can, Roll, Jar |
| Current Price (per PU) | Decimal | ≥ 0 |
| Recipe Cost Unit (RU) | String | e.g. oz, lb, cup, EA, tspn, tbsp, pint, quart, gallon |
| # RU per PU | Decimal | > 0; conversion factor |
| Yield % | Decimal | 0–1; accounts for trim/waste |
| RU Cost | Decimal (computed) | `= Current Price / (# RU per PU) / Yield %` |
| Inventory Unit (IU) | String | Unit used when counting stock |
| IU Cost | Decimal (computed) | `= Current Price / (# IU per PU)` |
| Category | Enum | Meat, Poultry, Produce, Seafood, Soft Beverage, Paper, add-new |

### 3.3 Lookup Key
The system must support VLOOKUP-style retrieval by the first 3 characters of a user-entered code (e.g. "001_LB" looks up item "001").

### 3.4 Auto-Computed Code-Description Concat
The system must store and expose a concatenated identifier in the format `{ItemCode}_{PurchaseUnit}` for display in dropdown selectors.

### 3.5 Reference Lists (from the Lists sheet)
The following are fixed lookup lists used throughout the system:

**Units of Measure:** Case, Each, LB, Bottle, Bag, Carton, Box, Can, Roll, Jar

**Recipe Measure Types:** Weight (oz-wt), Volume (fl-oz), Piece (EA)

**Volume Conversions (to fluid oz):**
- tspn = 1/6 fl oz
- tbsp = 0.5 fl oz
- cup = 8 fl oz
- pint = 16 fl oz
- quart = 32 fl oz
- gallon = 128 fl oz
- oz = 1 fl oz
- lb = 16 oz-weight

**Ingredient Categories:** Meat, Poultry, Produce, Seafood, Soft Beverage, Paper

**Shelf-Life Options:** 1 day, 2 days, 3 days, 4 days, 5 days, 6 days, 7 days, 8 days, 9 days, 10 days, 1 shift

---

## 4. Inventory Counting

### 4.1 Purpose
Capture physical stock counts at the end of each accounting period and compute the total value of on-hand food and bar inventory.

### 4.2 Inventory Types
- **FOOD inventory** — categories: Meat, Seafood, Poultry, Produce, Dairy, Bakery, Grocery/Dry Goods, Drinks
- **BAR inventory** — categories: Liquor, Bottle Beer, Draft Beer, Wine, Bar Consumables

### 4.3 Period Header
| Field | Notes |
|---|---|
| Restaurant name | Pulled from restaurant profile |
| Period-ending date | User-entered |
| Inventory type | FOOD or BAR |

### 4.4 Line Item Fields (per ingredient row)
| Field | Type | Notes |
|---|---|---|
| Item Description | String | From ingredient master |
| Order Unit | String | e.g. lb, bottle, 12pk |
| Order Unit Price | Decimal | Current price |
| Order-to-Inventory ratio | Decimal | Conversion factor |
| Inventory Unit | String | e.g. lb, Each, Bottle |
| Inventory Unit Price | Decimal (computed) | `= Order Price / Order-to-Inv ratio` |
| Count | Decimal | Physical count entered by user |
| Extension | Decimal (computed) | `= Inventory Unit Price × Count` |

### 4.5 Category Subtotals
Each category (Meat, Seafood, Poultry, Produce, Dairy, Bakery, Grocery/Dry Goods, Drinks, Liquor, Bottle Beer, Draft Beer, Wine, and Bar Consumables) must display a subtotal of all extensions within it.

### 4.6 Summary Valuation Section
At the bottom of each FOOD inventory, the system must display a summary table listing each category name alongside its subtotal, with a **Total Food Inventory** grand total.

For BAR inventory, separate subtotals for:
- Total Liquor Inventory
- Total Alcoholic Beverage Inventory
- Total Bar Inventory

### 4.7 Multiple Period Support
The system must store multiple period snapshots (e.g. "FOOD (2)" for the following week) so that beginning and ending inventory values can be retrieved for COGS calculations.

---

## 5. Recipe Management

### 5.1 Batch Recipe Library
The system supports up to **15 batch recipes** (sub-recipes), each stored as a named recipe that can itself be used as an ingredient in menu items.

### 5.2 Batch Recipe Header Fields
| Field | Notes |
|---|---|
| Recipe name | Free text; also stored in Inventory Master rows 505+ |
| Kitchen station | From station reference list |
| Tools & equipment | Free text |
| Position / prep notes | Free text |
| Total batch cost | Computed: sum of all ingredient line extensions |

### 5.3 Batch Recipe Ingredient Lines (up to 20 per recipe)
| Field | Type | Notes |
|---|---|---|
| Select Item / Recipe | Lookup | References Inventory Master by 3-char code |
| Ingredients | String (computed) | Resolved ingredient description |
| Measure (RU) | String (computed) | Pulled from Inventory Master |
| # of RU | Decimal | User-entered quantity |
| RU Cost | Decimal (computed) | Pulled from Inventory Master |
| Cost (Extension) | Decimal (computed) | `= # of RU × RU Cost` |
| Procedure note | String | Optional free-text step |

### 5.4 Recipe Yield Section
Each recipe must capture at least one yield row with:
- Yield label (e.g. "Batch", "12Prep")
- Number of RU yielded
- Number of IU yielded
- Batch multiplier (default 1)

### 5.5 Recipe Manual (Docx-Derived)
Recipes are also documented in a structured manual format with:
- Section grouping (e.g. Section 1: Group 1, Section 2: Group 2 … up to Section N)
- Up to 10 recipes per section
- Per recipe: Station, Tools/Equipment, Position(s), ingredient table (QTY | MEASURE | INGREDIENT), and up to 14 numbered procedure steps

### 5.6 Volume-to-Weight Conversion Calculator
The system must provide a standalone calculator allowing users to convert between volume and weight for any ingredient:
- Inputs: Purchase Unit type, whether packed by Weight or Volume, Purchase Unit Price, total oz per purchase unit, oz-weight per cup
- Outputs: Cost per fluid oz, Cost per oz-weight

---

## 6. Menu Costing

### 6.1 Menu Cost Groups
Menu items are organized into up to **15 Menu Cost Groups**. Each group holds up to **10 menu items**.

### 6.2 Menu Item Fields
| Field | Type | Notes |
|---|---|---|
| Menu Item name | String | Required |
| Item Description | String | Optional |
| Plate cost (Q-cost) | Decimal | Fixed overhead cost per plate; default quantity = 1 EA |
| Total Cost | Decimal (computed) | Sum of all ingredient extensions + plate cost |
| Menu Price | Decimal | User-entered selling price |
| Gross Profit | Decimal (computed) | `= Menu Price − Total Cost` |
| Food Cost % | Decimal (computed) | `= Total Cost / Menu Price` |

### 6.3 Menu Item Ingredient Lines (up to 15 per item + 1 plate cost row)
| Field | Type | Notes |
|---|---|---|
| Select Item / Recipe | Lookup | May reference an ingredient OR a batch recipe |
| Recipe Unit | String (computed) | From Inventory Master |
| Quantity | Decimal | User-entered |
| Ingredient name | String (computed) | Resolved from master |
| Unit Cost | Decimal (computed) | RU cost from master |
| Extension | Decimal (computed) | `= Quantity × Unit Cost` |

### 6.4 Validation
If an ingredient is not properly configured in the Inventory Master, the system must flag the line with a visible warning: "This ingredient has not been set-up properly!"

### 6.5 Menu Item List
The system must maintain a flat list of all menu items across all groups, identifying which group each belongs to, for use in engineering worksheets.

---

## 7. Menu Engineering

### 7.1 Purpose
Classify every menu item as a **Winner, Workhorse, Opportunity, or Loser** based on its gross profit and sales volume over a given period.

### 7.2 Period Header
| Field | Notes |
|---|---|
| Restaurant name | From profile |
| Category name | e.g. "Blue Plates", "Appetizers" |
| Period begin date | User-entered |
| Period end date | User-entered |

### 7.3 Per-Item Data
| Field | Type | Notes |
|---|---|---|
| PLU # | Integer | Point-of-sale lookup code |
| Item Name | String | |
| # Sold | Integer | Units sold during the period |
| Sell Price | Decimal | |
| Item Cost | Decimal | From menu costing |
| Item Gross Profit | Decimal (computed) | `= Sell Price − Item Cost` |
| Sales Mix % | Decimal (computed) | `= # Sold / Total Sold` |
| Total Cost | Decimal (computed) | `= # Sold × Item Cost` |
| Total Revenue | Decimal (computed) | `= # Sold × Sell Price` |
| Total Profit | Decimal (computed) | `= Total Revenue − Total Cost` |

### 7.4 Classification Logic
**Step 1 — Popularity threshold:** `= (Total Sold / Item Count) × 0.80`

**Step 2 — Sales Mix Category:**
- HIGH if `Sales Mix % ≥ popularity threshold`
- LOW otherwise

**Step 3 — Gross Profit Category:**
- HIGH if `Item Gross Profit ≥ weighted average gross profit`
- LOW otherwise

**Step 4 — Final Classification:**
| GP Category | Mix Category | Classification |
|---|---|---|
| HIGH | HIGH | **Winner** |
| LOW | HIGH | **Workhorse** |
| HIGH | LOW | **Opportunity** |
| LOW | LOW | **Loser** |

### 7.5 Category Worksheets
Up to **10 category-level worksheets** exist alongside a single **Summary sheet** that aggregates all categories. The summary derives per-category metrics (avg sell price, avg cost, total revenue, total profit) from each category sheet.

### 7.6 Period Totals
The system must calculate and display:
- Total items sold across all menu items
- Total cost, total revenue, total profit for the period
- Overall food cost % (`= Total Cost / Total Revenue`)
- Weighted average gross profit

---

## 8. Recipe Build Charts

### 8.1 Purpose
Station-level build cards showing kitchen staff exactly how to plate and assemble each menu item.

### 8.2 Header Fields
| Field | Notes |
|---|---|
| Station name | e.g. "Fry station", "Grill station" |
| Menu Item name | |
| Plating specification | e.g. "12\" platter", "Large salad bowl" |

### 8.3 Ingredient Line Fields
| Field | Notes |
|---|---|
| Ingredient description | Free text or from master |
| Portion | e.g. "1", "6 oz.", "2 fl. oz." |
| Serving utensil | e.g. "n/a", "#32 scoop", "2 oz. ramekin", "8 oz. bowl" |
| Cross-station note | Optional; e.g. "Grill station" |

### 8.4 Layout
- Each page holds **2 menu items** per station.
- Up to **10 ingredient lines** per menu item on a build card.
- The system supports multiple station sheets (Fry, Grill, Sauté, Pantry, Prep, Salad, and Dessert) plus a Master sheet.

---

## 9. Purchase & Invoice Tracking

### 9.1 Purpose
Log all supplier invoices received during a week, categorize each by purchase type, and calculate weekly totals used in COGS.

### 9.2 Invoice Log Fields
| Field | Type | Notes |
|---|---|---|
| Supplier name | String | |
| Invoice date | Date | Within the week period |
| Invoice (CM) Amount | Decimal | Total invoice value |
| Food | Decimal | Portion of invoice allocated to food |
| Soft Beverage | Decimal | |
| Liquor | Decimal | |
| Bottle Beer | Decimal | |
| Draft Beer | Decimal | |
| Wine | Decimal | |
| Merchandise | Decimal | |
| Supplies | Decimal | |
| Proof | Decimal (computed) | `= Invoice Amount − Sum(all categories)`; must equal 0 |

### 9.3 Weekly Totals
The system must sum each category column and calculate:
- **Total Food Purchases** = Food + Soft Beverage
- **Total Beverage Purchases** = Liquor + Bottle Beer + Draft Beer + Wine
- **Total Other Purchases** = Merchandise + Supplies
- **% of Total** for each sub-category against its parent total

### 9.4 Capacity
Up to **42 invoice lines** per week.

---

## 10. Labor Hours & Cost Tracking

### 10.1 Employee Labor Record

Each week, the system records daily hours and computed costs for up to **25 employees**.

#### Labor Hours Fields
| Field | Notes |
|---|---|
| Employee Name | From employee master |
| Mon–Sun hours | Decimal; user-entered per day |
| Total hours | Computed: sum Mon–Sun |

#### Labor Cost Fields
| Field | Notes |
|---|---|
| Hourly Rate | Decimal; from employee master |
| Mon–Sun cost | Computed: see overtime rule below |
| Total weekly cost | Sum of daily costs |

### 10.2 Overtime Rule
Daily costs are computed cumulatively. Once cumulative weekly hours exceed **40**, any additional daily hours are charged at **1.5× the hourly rate**:

```
if cumulative_hours_before_this_day + today_hours > 40:
    regular_portion = max(0, 40 - cumulative_hours_before_this_day)
    overtime_portion = today_hours - regular_portion
    daily_cost = (regular_portion × rate) + (overtime_portion × rate × 1.5)
else:
    daily_cost = today_hours × rate
```

### 10.3 Daily Labor Aggregates
The system must compute and store per day:
- **Total Labor Hours** (all employees summed)
- **Total Hourly Labor Cost** (all employees summed)
- **Total Daily Sales** (pulled from Prime Cost Worksheet)
- **Sales Per Labor Hour** = `Total Daily Sales / Total Labor Hours` (0 if hours = 0)
- **Hourly Labor Cost %** = `Total Hourly Labor Cost / Total Daily Sales` (0 if sales = 0)

### 10.4 Employee Types
- **Hourly Personnel** — paid per hour; subject to overtime
- **Management** — salaried; entered as a lump weekly amount directly in the Prime Cost Worksheet

---

## 11. Prime Cost Worksheet

### 11.1 Purpose
The central weekly financial statement consolidating sales, cost of sales, and labor to derive Prime Cost and Gross Margin.

### 11.2 Daily Sales Section
For each of Monday–Sunday, the user enters sales by category:

| Category | Notes |
|---|---|
| Food | |
| Soft Beverage | |
| Liquor | |
| Bottle Beer | |
| Draft Beer | |
| Wine | |
| Merchandise & Other | |
| Gross Sales | Computed: sum of above |
| Less Comps & Discounts | Entered as positive; subtracted |
| Net Sales | Computed: `Gross Sales − Comps & Discounts` |

Weekly totals and **% of Gross Sales** are computed for every line.

### 11.3 Guest Metrics
| Field | Notes |
|---|---|
| # of Guests / Transactions | User-entered per day |
| Check Average | Computed: `Gross Sales / Guest Count` per day and for the week |

### 11.4 Cost of Sales Section

COGS is computed using the **purchases + beginning inventory − ending inventory** formula per category:

`COGS = Purchases (from Purchases sheet) + Beginning Inventory − Ending Inventory`

| Sub-section | Categories |
|---|---|
| Food | Food, Soft Beverage → **Total Food Cost** |
| Beverage | Liquor, Bottle Beer, Draft Beer, Wine → **Total Beverage Cost** |
| Other | Merchandise & Other |

Each category also shows **cost %**:
- Food cost % = `Food COGS / Food Sales`
- Beverage cost % = `Total Bev COGS / Total Bev Sales`
- Merchandise cost % = `Merch COGS / Gross Sales`

**Total Cost of Sales** = Total Food + Total Beverage + Merchandise

### 11.5 Labor Section
| Line | Notes |
|---|---|
| Management | User-entered weekly lump sum |
| Hourly Personnel | Pulled from Labor Cost sheet total |
| Payroll Taxes & Benefits | Computed: `(Management + Hourly) × Taxes & Benefits Rate` |
| **Total Labor** | Sum of above three |
| Total Labor % | `Total Labor / Gross Sales` |

### 11.6 Prime Cost & Margin
| Line | Formula |
|---|---|
| **Prime Cost (Gross Sales)** | `Total Labor + Total Cost of Sales` |
| Prime Cost % (Gross) | `Prime Cost / Gross Sales` |
| **Prime Cost (Net Sales)** | `Total Labor + Total Cost of Sales` |
| Prime Cost % (Net) | `Prime Cost / Net Sales` |
| **Gross Margin** | `Net Sales − Prime Cost (Net)` |
| Gross Margin % | `Gross Margin / Net Sales` |

---

## 12. Weekly Budget

### 12.1 Purpose
Set forecasted targets for the week against which actuals will be compared.

### 12.2 Sales Forecast
| Field | Notes |
|---|---|
| Total Sales Forecast | User-entered dollar amount |
| % per category | User-entered; Food default 80%, Soft Bev 3%, Liquor 6%, Btl Beer 3%, Dft Beer 3%, Wine 4%, Merchandise 1% |
| Comps & Discounts % | Default 1% |

Budgeted dollar amounts per category = `Total Sales Forecast × Category %`

### 12.3 Cost of Sales Budget
| Category | Default Cost % Target |
|---|---|
| Food | 25% |
| Soft Beverage | 15% |
| Liquor | 18% |
| Bottle Beer | 26% |
| Draft Beer | 23% |
| Wine | 35% |
| Merchandise & Other | 50% |

Budgeted cost = `Budgeted Sales × Cost % Target`

### 12.4 Labor Budget
| Line | Notes |
|---|---|
| Management | User-entered dollar amount |
| Hourly Personnel | User-entered dollar amount or % target |
| Benefits | Computed: `(Management + Hourly) × Benefits Rate` |
| Total Labor Budget | Sum |

### 12.5 Computed Budget Totals
- Total Cost of Sales Budget
- Total Labor Budget
- Prime Cost Budget (Gross and Net)
- Gross Margin Budget

---

## 13. Prime Cost Report

### 13.1 Purpose
Side-by-side comparison of actuals (from Prime Cost Worksheet) against budget (from Weekly Budget), with variances.

### 13.2 Variance Convention
All variances are expressed as **Favorable / (Unfavorable)**:
- For sales lines: `Actual − Budget` (positive = favorable)
- For cost lines: `Budget − Actual` (positive = favorable; spent less than planned)

### 13.3 Report Structure
For every line in the P&L:

| Column | Notes |
|---|---|
| Description | Line name |
| Actual $ | From Prime Cost Worksheet |
| Actual % | As % of Gross Sales (or relevant sub-total) |
| Budget $ | From Weekly Budget |
| Budget % | Budget's own % target |
| Variance $ | Actual − Budget (sign-adjusted per convention) |

### 13.4 Sections
1. SALES (all categories, Gross Sales, Comps, Net Sales)
2. COST OF SALES (Food/Soft Bev, Alcoholic Beverage, Merchandise, Total)
3. PAYROLL (Management, Hourly, Total Wages, Benefits, Total Payroll)
4. PRIME COST — Gross and Net
5. GROSS MARGIN

---

## 14. Trend Analysis

### 14.1 Purpose
Display up to **8 consecutive weeks** of key financial metrics side by side to reveal trends.

### 14.2 Data Source
Each column is populated from the Prime Cost Report of a prior week. The most recent week is always column 1; older weeks fill columns 2–8.

### 14.3 Three Metric Views
The trend report presents three parallel views for the same set of line items:

**Dollar Amounts view** — absolute dollar values:
- All sales categories, Gross Sales, Comps, Net Sales
- All COGS sub-categories and totals
- Payroll breakdown and totals
- Prime Cost and Gross Margin

**Percentages view** — each metric as % of Gross Sales (or its relevant base):
- Food cost % uses Food Sales as base
- Beverage cost % uses Beverage Sales as base
- Payroll % uses Gross Sales
- Prime Cost % uses Gross Sales
- Gross Margin % uses Gross Sales

**Per-Guest view** — dollar value divided by guest count:
- Food sales per guest
- Each beverage category per guest
- Total sales per guest
- Prime Cost per guest
- Gross Margin per guest

### 14.4 Guest Count Row
The trend sheet must display the weekly guest count as a reference row for the per-guest calculations.

---

## 15. Hourly Guest Count Tracking

### 15.1 Purpose
Track customer arrivals in **30-minute time slots** across a 7-day week to understand traffic patterns and support staffing decisions.

### 15.2 Time Slot Grid
| Field | Notes |
|---|---|
| Time slot | LocalTime in 30-minute increments; range configurable per sheet |
| Slot label | Optional text label (e.g. "Frokost", "Buttik", "Online") |
| Mon–Sun counts | Integer; user-entered per slot per day |
| TTL (weekly total) | Computed: sum of Mon–Sun for that slot |
| AVG (weekly average) | Computed: `TTL / count of days with non-zero entries` |

### 15.3 Time Slot Range
- **Week1** starts at 11:30 and ends at ~21:00 (lunch/dinner service pattern)
- **Week2 & Week3** start at 06:00 and end at 23:30 (all-day pattern)
- The system must support up to **37 time-slot rows** per week sheet

### 15.4 Column Totals (TTL row)
For each day of the week:
- `TTL = Sum of all slot counts for that day`
- `AVG = Average of slot counts across active slots (AVERAGEA)`

### 15.5 Active Slot Count
For each day column, the system must track how many time slots had a count > 0. This is used for computing meaningful averages (`= Total / Active Slots`).

### 15.6 Three-Week Rolling Average
A separate **3-Week Average sheet** is computed automatically from the three weekly sheets. For each time slot and each day:

`3-Week Avg = (Week1 count + Week2 count + Week3 count) / 3`

Only computed when the sum of the 3 weeks' values for that slot/day is > 0; otherwise displayed as blank.

The 3-week average sheet must also show:
- Daily totals (sum of all slot averages per day)
- Overall weekly average per slot
- Column-level TTL and AVG summary rows

### 15.7 Sample / Reference Data
The system must support a read-only **Sample** sheet populated with example data that users can reference when learning the system.

---

## 16. Accounting Period Checklist

### 16.1 Purpose
Track the completion of every task required to close an accounting period.

### 16.2 Period Header
| Field | Notes |
|---|---|
| Period ending date | User-entered |

### 16.3 Checklist Sections and Tasks

**Source Documents** (items to collect from the restaurant):
- Daily Sales Reports
- Invoices — unpaid
- Manual Check Copies / Check Stubs (paid invoices)
- Inventory Worksheets
- Payroll Worksheets / Registers

**Source Documents** (external / bank):
- Bank Statement — Operating Account
- Bank Statement — Payroll Account
- Credit Card Statement — MC/Visa
- Credit Card Statement — AMEX
- Credit Card Statement — Discover
- Credit Card Statement — Diners

**Data Entry:**
- Daily Sales
- Invoices (unpaid)
- Manual Checks

**Reconciliations:**
- Bank Statement — Operating Account
- Bank Statement — Payroll Account
- Credit Card Statement — MC/Visa
- Credit Card Statement — AMEX
- Credit Card Statement — Discover
- Credit Card Statement — Diners
- Intercompany Accounts
- Petty Cash

**Journal Entries:**
- Payroll
- Payroll Accrual
- Beginning Inventory (reverse last period ending)
- Ending Inventory
- Depreciation & Amortization
- Bank Rec Entries / Adjustments
- Discounts & Comps
- Intercompany Transactions
- Prepaid Write-Downs (insurance)
- Petty Cash Transactions
- Accrual — Percentage Rent
- Accrual — Property Taxes
- Accrual — Interest
- Accrual — Workman's Compensation
- Accrual — Missing Utility / Other Recurring Bills

### 16.4 Per-Task Fields
| Field | Notes |
|---|---|
| Task name | From list above; not editable |
| Done | Boolean checkbox |
| Notes / Comments | Free text |

---

## 17. Data Relationships & Constraints

### 17.1 Key Relationships
```
Restaurant
├── WeekPeriod (1 per week)
│   ├── PurchaseInvoice (up to 42)
│   ├── PurchaseWeekSummary (1)
│   ├── EmployeeLaborRecord (up to 25)
│   ├── LaborWeekSummary (1)
│   ├── DailySalesEntry (7, one per day)
│   ├── InventorySnapshot (2: BEGINNING, ENDING)
│   ├── PrimeCostWorksheet (1)
│   ├── WeeklyBudget (1)
│   ├── PrimeCostReport (1)
│   └── TrendAnalysisSnapshot (1, referencing up to 8 past weeks)
│
├── InventoryPeriod (many; each is a FOOD or BAR count snapshot)
│   └── InventoryLineItem (many)
│
├── AccountingPeriod (many)
│   └── AccountingChecklistItem (35 fixed tasks per period)
│
└── GuestCountWeek (3 per tracking cycle)
    └── GuestCountEntry (up to 37 per week)
        → GuestCountThreeWeekAverage (1 per cycle)
            └── GuestCountAvgEntry (up to 37)

Ingredient (up to 500)
├── RecipeIngredientLine (used in BatchRecipe)
└── MenuItemIngredientLine (used in MenuItem)

BatchRecipe (up to 15)
├── RecipeIngredientLine (up to 20)
├── RecipeYield (1+)
├── RecipeManualEntry (1 docx page per recipe)
│   ├── RecipeProcedureStep (up to 14)
│   └── RecipeManualIngredientLine (many)
└── MenuItemIngredientLine (can be used as sub-recipe in a MenuItem)

MenuCostGroup (up to 15)
└── MenuItem (up to 10 per group)
    ├── MenuItemIngredientLine (up to 15 + 1 plate cost)
    ├── RecipeBuildChart (1 per station)
    │   └── BuildChartLine (up to 10)
    └── MenuEngineeringResult (1 per engineering period)

MenuEngineeringPeriod (many)
└── MenuEngineeringResult (many; one per menu item per period)
```

### 17.2 Cascade Rules
- Deleting a `WeekPeriod` must cascade-delete all child records (invoices, labor, sales, inventory snapshots, worksheets, reports).
- Deleting an `Ingredient` must be blocked if it is referenced in any `RecipeIngredientLine` or `MenuItemIngredientLine`.
- Deleting a `BatchRecipe` must be blocked if it is referenced in any `MenuItemIngredientLine`.

### 17.3 Uniqueness Constraints
- Ingredient `itemCode` must be unique system-wide.
- One `PrimeCostWorksheet` per `WeekPeriod`.
- One `WeeklyBudget` per `WeekPeriod`.
- One `PrimeCostReport` per `WeekPeriod`.
- `GuestCountEntry` must be unique per `(guestCountWeek, timeSlot)`.

---

## 18. Calculations & Business Rules

### 18.1 Ingredient Costing
```
RU Cost = Current Price / (# RU per PU) / Yield %
IU Cost = Current Price / (# IU per PU)
```

### 18.2 Recipe & Menu Item Extension
```
Line Extension = Quantity (# of RU) × RU Cost
Total Recipe Cost = Sum of all line extensions
Total Menu Item Cost = Sum of all ingredient line extensions + Plate Cost
Gross Profit = Menu Price − Total Menu Item Cost
Food Cost % = Total Menu Item Cost / Menu Price
```

### 18.3 Inventory COGS
```
COGS (per category) = Purchases + Beginning Inventory − Ending Inventory
Food Cost % = Food COGS / Food Sales
Beverage Cost % = Total Beverage COGS / Total Beverage Sales
```

### 18.4 Labor Cost with Overtime
```
cumulative_hours = sum of Mon–(current day - 1) hours
regular_this_day = min(today_hours, max(0, 40 − cumulative_hours))
overtime_this_day = today_hours − regular_this_day
daily_cost = (regular_this_day × rate) + (overtime_this_day × rate × 1.5)
```

### 18.5 Prime Cost
```
Total Labor = Management + Hourly Labor + (Management + Hourly) × Tax Rate
Total COS = Food COS + Beverage COS + Merchandise COS
Prime Cost = Total Labor + Total COS
Gross Margin = Net Sales − Prime Cost
```

### 18.6 Menu Engineering Classification
```
Popularity Threshold = (Total Units Sold / Item Count) × 0.80
Item is High Mix   if Sales Mix % ≥ Popularity Threshold
Item is High GP    if Item Gross Profit ≥ Weighted Average GP

Winner      = High GP + High Mix
Workhorse   = Low GP  + High Mix
Opportunity = High GP + Low Mix
Loser       = Low GP  + Low Mix
```

### 18.7 Guest Count Averages
```
Weekly Slot Average = Slot TTL / AVERAGEA(Mon..Sun)  [only days entered]
3-Week Slot Average = (W1 count + W2 count + W3 count) / 3  [if sum > 0]
Daily Active Slots  = COUNTIF(day column, "> 0")
Per-Active-Slot Avg = Day Total / Active Slots
```

### 18.8 Sales Per Labor Hour
```
Sales Per Labor Hour (day) = Daily Gross Sales / Total Daily Labor Hours
                             [0 if hours = 0]
Hourly Labor Cost % (day)  = Daily Hourly Labor Cost / Daily Gross Sales
                             [0 if sales = 0]
```

---

## 19. Non-Functional Requirements

### 19.1 Data Integrity
- All computed fields must be recalculated automatically when any input changes.
- The **Proof** field on every purchase invoice must equal zero; the system must warn the user if it does not.
- Ingredient codes must be validated against the master list when entered in recipe or menu costing screens.

### 19.2 Capacity Limits (from source files)
| Entity | Limit |
|---|---|
| Ingredients in master | 500 |
| Sub-recipes (batch) in master | 150 |
| Menu Items in master | 150 |
| Batch recipes | 15 |
| Menu Cost Groups | 15 |
| Menu items per group | 10 |
| Ingredient lines per recipe | 20 |
| Ingredient lines per menu item | 15 + 1 plate cost |
| Invoice lines per week | 42 |
| Employees tracked per week | 25 |
| Trend weeks displayed | 8 |
| Guest count time slots per week | 37 |
| Procedure steps per recipe (manual) | 14 |
| Build chart lines per menu item | 10 |
| Accounting checklist tasks | 35 (fixed) |

### 19.3 Reporting
- All report headers must display the restaurant name and the relevant period (week start/end dates or period-ending date).
- Percentages must be displayed with sufficient decimal precision (at least 1 decimal place, e.g. "32.4%").
- Variances must clearly indicate Favorable or Unfavorable (not just positive/negative numbers).

### 19.4 Date Handling
- A week always starts on Monday and ends on Sunday.
- Changing the week start date must automatically update all derived dates (week end, individual day columns Mon–Sun).
- The system must support multiple simultaneous week periods (i.e. historical data must be stored and not overwritten).

### 19.5 Reference Data
- Unit of measure lists, station lists, shelf-life options, and ingredient category lists must be maintained as editable reference tables, not hard-coded.
- The system must prevent deletion of any reference item currently in use.

### 19.6 User Workflow Guidance
- The system should enforce a logical 3-step workflow for recipe costing:
  1. Add ingredients to the Inventory Master
  2. Build batch recipes from those ingredients
  3. Build menu items from ingredients and/or batch recipes
- The accounting checklist tasks are **fixed** (not user-editable); only the Done flag and Notes field may be changed per period.