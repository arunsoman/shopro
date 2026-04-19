---
name: restaurant-scenario-builder
description: >
  Builds a complete, production-ready restaurant data scenario from scratch — including SQL seed
  scripts, menu engineering, ingredient catalogue, supplier setup, staffing plan, and optional
  automated seeding via Spring Boot CommandLineRunner. Also performs market research: fetches
  trending dishes for the restaurant's location, analyzes nearby competitors, studies market
  trends and diner preferences, then designs recipes and menus optimized for that market.
  Triggers when the user says "build a restaurant", "create a scenario", "generate seed data",
  "onboard a new restaurant", "seed the database", "restaurant setup wizard", or asks to create
  a restaurant in a specific country or cuisine type. Two modes: WIZARD (interactive Q&A) and
  DEFAULT (runs a pre-configured scenario immediately). Both modes support an optional MARKET
  RESEARCH phase that enriches the menu with location-specific competitive intelligence.
  When the user says "do market research", "analyze market", "competitive analysis", or requests
  research-informed menus, the skill executes the market study automatically.
---

# Restaurant Scenario Builder Skill

Builds a complete, production-ready restaurant seed scenario for the Shopro POS system.
Covers: restaurant profile, cuisine/menu, ingredients, suppliers, staffing, and optional
SQL script generation. Designed to be used as a data bootstrap tool for demos, training,
testing, and onboarding.

## Phase Tracking

This skill tracks its progress in `PHASE_TRACKER.md` (in this skill directory). Each phase
is marked as `⏳ PENDING`, `🔄 IN PROGRESS`, `✅ COMPLETE`, or `❌ FAILED` with timestamps.
Read `PHASE_TRACKER.md` to see the current state of any in-progress or completed run.

---

## Modes

| Mode | Trigger | Behaviour |
|------|---------|-----------|
| **WIZARD** | `build a restaurant`, `create a scenario`, `onboard new restaurant` | Interactive Q&A that walks through each configuration step |
| **DEFAULT** | `run default`, `auto setup`, `default scenario` | Skips Q&A, runs Restaurant 3 "The Market Table" with full default configuration |

Both modes support an optional **MARKET RESEARCH** phase. When triggered (by user saying "do market research", "analyze market", "competitive analysis", or explicitly requesting research-informed menus), the skill will:
1. Fetch trending dishes and restaurant trends for the restaurant's location
2. Identify nearby competitors and analyze their strengths/weaknesses
3. Study diner preferences and market data for that city
4. Adjust menu items, pricing, and positioning based on findings
5. Present a full Market Study & Competitive Analysis report

If the user says "default with research" or "run default with market study", the DEFAULT mode will automatically execute the MARKET RESEARCH phase before generating outputs.

---

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 0 — MODE DETECTION                                        │
│  Check user intent: WIZARD or DEFAULT                          │
│  If DEFAULT → jump straight to Step 6                          │
│  If user requests market research → proceed to Step 0.5       │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 0.5 — MARKET RESEARCH (optional)                          │
│  1. Web search for trending dishes in the restaurant's city     │
│  2. Web search for nearby competitors (1-2 mile radius)         │
│  3. Web search for diner preferences & market data              │
│  4. Analyze competitive gaps and opportunities                  │
│  5. Adjust menu items, pricing, and positioning                 │
│  6. Output: Market Study & Competitive Analysis Report          │
│     Saved to: .agents/reports/<restaurant-slug>-market-study.md│
│  Then continue to Step 1 (WIZARD) or Step 6 (DEFAULT)           │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1 — RESTAURANT PROFILE                                   │
│  Country → timezone + currency + country code                  │
│  City / area name (free text)                                  │
│  Restaurant name (free text)                                    │
│  Number of tables (number, default 20)                          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2 — CUISINE & MENU TYPE                                  │
│  Choose one primary cuisine (pre-defined options)               │
│  → loads cuisine data: ingredient catalogue, recipe templates    │
│  Can add additional cuisines (optional multi-cuisine)          │
│  Can set a custom price tier (BUDGET / MID / PREMIUM)         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3 — MENU CONFIGURATION                                   │
│  Auto-generate menu groups based on cuisine                    │
│  Auto-generate 4-8 menu items per group                        │
│  Auto-assign RevenueCategory per group                          │
│  Auto-generate ingredients for all items                       │
│  User can add/remove/reorder items                             │
│  Auto-calculate plate costs from ingredient prices              │
│  Auto-calculate sell prices using desired food cost %          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4 — SUPPLIER CONFIGURATION                                │
│  User enters 1-3 suppliers (name, contact, email, category)     │
│  Map ingredients to preferred supplier                          │
│  System generates realistic purchase prices                     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5 — STAFFING PLAN                                        │
│  User enters staff count per role                               │
│  System calculates weekly labor cost                            │
│  System calculates labor % of projected weekly revenue          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6 — GENERATE OUTPUTS                                      │
│  1. Flyway SQL migration script (V*__restaurant_<name>.sql)    │
│  2. Spring Boot CommandLineRunner seeder (optional)             │
│  3. Summary report (what was built, what to verify)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 0 — Mode Detection

Check the user's message for intent keywords.

**WIZARD keywords**: `build`, `create`, `onboard`, `setup`, `wizard`, `new restaurant`, `open a restaurant`
**DEFAULT keywords**: `default`, `auto`, `quick`, `run it`, `skip`

If DEFAULT:
- Set restaurant name to "The Market Table"
- Set cuisine to "International / Modern Casual"
- Use DEFAULT configuration (documented in Step 6 Defaults section below)
- Skip directly to SQL generation
- Print "⚡ DEFAULT MODE — running pre-configured scenario" banner

---

## Step 1 — Restaurant Profile

Ask these questions sequentially (or auto-fill from defaults):

```
Q1.1  Country:  [Afghanistan | Australia | France | India | Italy |
                  Japan | Mexico | Thailand | United Kingdom | United States]
                  → maps to IANA timezone + currency

Q1.2  City or Area:  [free text]

Q1.3  Restaurant Name:  [free text]

Q1.4  Number of Tables:  [number, default: 20]
```

**Country → timezone mapping**:

| Country | Timezone | Currency |
|---------|----------|---------|
| Afghanistan | Asia/Kabul | AFN |
| Australia | Australia/Sydney | AUD |
| France | Europe/Paris | EUR |
| India | Asia/Kolkata | INR |
| Italy | Europe/Rome | EUR |
| Japan | Asia/Tokyo | JPY |
| Mexico | America/Mexico_City | MXN |
| Thailand | Asia/Bangkok | THB |
| United Kingdom | Europe/London | GBP |
| United States | America/New_York | USD |

---

## Step 2 — Cuisine & Menu Type

Pre-defined cuisine options (each ships with a built-in ingredient catalogue):

```
A)  Afghan         — Lamb, rice dishes, tandoor, grilled meats
B)  American       — Burgers, steaks, BBQ, comfort food
C)  Chinese        — Cantonese/Wok, dim sum, stir-fry
D)  French         — Classical French, bistro, sauces
E)  Indian          — North Indian curries, tandoor, biryanis
F)  Italian         — Pasta, pizza, risotto, antipasti
G)  Japanese        — Sushi, ramen, izakaya, yakitori
H)  Mexican         — Mexican/Latin, tacos, moles, grilled
I)  Modern Casual  — International fusion, brunch, small plates
J)  Thai            — Curries, stir-fry, noodles, Thai herbs
K)  Mediterranean   — Greek, Lebanese, mezze, grilled
L)  Custom          — User defines from scratch (no template)
```

For each cuisine, the skill has pre-loaded ingredient catalogue data (see Appendix A)
and menu group templates (see Appendix B).

**Price tier** (ask after cuisine selection):
```
Price Tier:  [BUDGET]  Food Cost % target: 22-26%
             [MID]     Food Cost % target: 28-32%
             [PREMIUM] Food Cost % target: 30-35%
```

---

## Step 3 — Menu Configuration

### Auto-generation rules

For the selected cuisine, the system auto-generates:

1. **Menu Cost Groups** — typically 4-6 groups per cuisine
2. **Menu Items** — 4-8 items per group
3. **Ingredients** — 8-15 core ingredients per cuisine
4. **Revenue Category mapping** — automatic based on group type

### Revenue Category per group type (automatic):

| Group type | RevenueCategory |
|------------|----------------|
| Mains, Starters, Soups, Salads, Desserts | FOOD |
| Soft Drinks, Fresh Juices, Mocktails, Coffee | SOFT_BEV |
| Cocktails, Spirits, Liqueurs | LIQUOR |
| Beer (draft + bottled) | BEER |
| Wine (glass + bottle) | WINE |
| Merchandise, Gift Cards | MERCH |

### Food cost pricing formula:

```
ingredient_cost = sum(quantity_ru × ru_cost_per_unit)
plate_cost = ingredient_cost + garnish_cost (flat $0.50)
target_fc_pct = user's selected price tier target
sell_price = plate_cost / target_fc_pct
final_price = round(sell_price × (1 + tax_rate_for_country), 2)
```

**Default tax rates per country**:

| Country | Tax % |
|---------|-------|
| Afghanistan | 10% |
| Australia | 10% |
| France | 10% |
| India | 18% |
| Italy | 10% |
| Japan | 10% |
| Mexico | 16% |
| Thailand | 7% |
| United Kingdom | 20% |
| United States | varies (use 10% default) |

### User edit options after generation:

- `add <item>` — add a custom menu item
- `remove <item>` — remove an auto-generated item
- `price <item> <new_price>` — override calculated price
- `done` — accept and proceed

---

## Step 4 — Supplier Configuration

Ask:
```
Q4.1  Supplier Name:        [free text, e.g. "Fresh Valley Produce"]
Q4.2  Contact Person:       [free text, e.g. "John Smith"]
Q4.3  Phone:                [phone number]
Q4.4  Email:                [email]
Q4.5  Account Number:       [optional, from existing vendor relationship]
Q4.6  Payment Mode:         [NET_15 | NET_30 | NET_60 | COD | WIRE | CARD]
Q4.7  Payment Terms:        [free text, e.g. "2% 10 Net 30" — discount/payment policy]
Q4.8  Lead Time (days):     [number, default: 2 business days]
Q4.9  Minimum Order Value:  [$ amount, default: $0 (no minimum)]
Q4.10 Category Coverage:   [PRODUCE | MEAT_SEAFOOD | DAIRY | DRY_GOODS | BEVERAGES]
Q4.11 Shelf Life (default days):
      [number — max days between delivery and expiry, default by category:
       PRODUCE=5, MEAT=5, SEAFOOD=2, DAIRY=7, DRY=NULL (none)]
Q4.12 Add another supplier? [Y/N]
      (repeat Q4.1-Q4.11 up to 3 suppliers)
```

### Expiry / Shelf Life — Three Levels

| Level | Column | What it tracks |
|-------|--------|----------------|
| **Ingredient** | `ingredient.shelf_life_days` | Default days from receipt → expiry for this item |
| **Supplier** | `supplier.default_shelf_life_days` | Vendor-level default when ingredient is null |
| **PO Line** | `purchase_order_line.expiry_date` | Expiry date of THIS bulk delivery (per line, per order) |

**Auto-calculation rule**:
```
expiry_date = required_by_date + shelf_life_days
```
The `required_by_date` is the promised delivery date on the `purchase_order`.
When stock arrives (GRN), the system creates an `InventoryActiveLot` with the calculated `expiry_date`.
The lot is automatically deactivated when `available_qty ≤ 0`.

**FEFO (First Expired First Out)**:
- Staff are alerted when approaching expiry (`available_qty > 0 AND expiry_date ≤ 3 days away`)
- FIFO inventory logic should consume lots in order: earliest `expiry_date` first

**Category defaults**:
- `PRODUCE` → 5 days (fresh herbs: 3, hardy produce: 7)
- `MEAT / POULTRY` → 4-5 days
- `SEAFOOD` → 2 days (most perishable)
- `DAIRY` → 7-14 days
- `DRY_GOODS` → NULL (shelf-stable, no expiry concern)
- `GROCERY` → NULL (shelf-stable)

**Example**: Atlantic Salmon (ING09) has `shelf_life_days = 2`. 
If PO required_by_date = March 5, expiry_date = March 7. 
Lot `available_qty` auto-deactivates at 0. Alert fires when expiry ≤ March 2.

### Payment Modes

| Mode | Meaning | Best For |
|------|---------|----------|
| `NET_15` | Pay within 15 days | Premium meat & seafood vendors |
| `NET_30` | Pay within 30 days | Standard produce, dry goods |
| `NET_60` | Pay within 60 days | Low-volume or specialty items |
| `COD` | Cash on Delivery | Dairy, daily deliveries, local farmers |
| `WIRE` | Wire transfer in advance | Specialty importers, specialty goods |
| `CARD` | Credit card on file | Emergency orders, minor consumables |

### Preferred Supplier (ingredient back-link)

Each ingredient can have one **preferred supplier** (`preferred_supplier_id → supplier.id`).

**Auto-mapping rule**: category coverage determines the preferred supplier:
- `PRODUCE` → the produce supplier
- `MEAT / POULTRY` → the meat supplier
- `SEAFOOD` → the seafood supplier
- `DAIRY` → the dairy supplier
- `DRY_GOODS / GROCERY_DRY_GOODS` → the dry goods supplier
- `BEVERAGES` → the beverages supplier

If multiple suppliers cover the same category (e.g. two produce vendors for price competition),
the user picks one as **preferred** and the others become **alternates**.

**Auto-generate purchase prices**:
Use cuisine-specific base prices (see Appendix C). These are realistic wholesale prices.
User can override per ingredient with `price <ingredient> <cost>`.

---

## Step 5 — Staffing Plan

**Auto-calculate base staffing** from number of tables:

```
tables ≤ 10  → small restaurant
tables 11-25 → medium restaurant
tables > 25  → large restaurant
```

Ask per role (pre-filled with auto-calculated defaults):

```
Staffing Plan:
  Executive Chef         : [0-2,  default: 1 if premium, else 0]
  Sous Chef              : [0-2,  default: 1 if large, else 0]
  Line Cook              : [2-8,  default: floor(tables / 4)]
  Prep Cook              : [1-4,  default: floor(tables / 10)]
  Kitchen Manager        : [0-1,  default: 1]
  FB/Restaurant Manager  : [0-1,  default: 1]
  Host                   : [0-2,  default: floor(tables / 15)]
  Server                 : [2-10, default: floor(tables / 3)]
  Bartender              : [0-2,  default: 1 if has bar, else 0]
  Busser                 : [0-4,  default: floor(tables / 10)]
  Dishwasher             : [1-3,  default: floor(tables / 12)]
```

**Weekly labor cost calculation**:

```
hourly_rate_by_role × hours_per_week (40) × headcount = weekly_cost
total_weekly_labor = sum of all roles
projected_daily_revenue = average_check × covers_per_day
projected_weekly_revenue = projected_daily_revenue × 7
labor_cost_pct = total_weekly_labor / projected_weekly_revenue
```

Show the user the calculated labor % and warn if > 35%.

---

## Step 6 — Generate Outputs

### Output 1: Flyway SQL Migration Script

Write to `shopro-res/src/main/resources/db/migration/V*__restaurant_<slug>.sql`

The SQL script must INSERT in dependency order (respecting FK constraints):

```sql
-- Order of INSERTs:
-- 1. restaurant
-- 2. dining_table  (n rows)
-- 3. supplier  (1-3 rows)
-- 4. ingredient  (n rows, map to supplier_id)
-- 5. menu_cost_group  (n rows)
-- 6. menu_item  (n rows, map to group_id)
-- 7. recipe  (n rows, map to menu_item_id)
-- 8. recipe_ingredient_line  (n rows, map to recipe_id + ingredient_id)
-- 9. staff  (n rows, map to restaurant_id)
-- 10. weekly_budget  (1 row)
-- 11. table_session  (n rows)
-- 12. restaurant_order  (n rows)
-- 13. order_line  (n rows)
-- 14. inventory_ledger  (initial stock entries)
```

Use `gen_random_uuid()` for UUID PKs where applicable.
Use `nextval('restaurant_id_seq')` or hardcode IDs for identity columns.
All IDs must be deterministic (no random values that would differ between runs).

**Important**: Use `ON CONFLICT DO NOTHING` for all INSERTs so the script is idempotent.

### Output 2: Spring Boot CommandLineRunner (optional)

If user says "make it run automatically" or "add seeder":
- Create `RestaurantScenarioSeeder.java` in `src/main/java/mls/sho/dms/application/seeder/`
- Implement `CommandLineRunner` interface
- Inject all required repositories
- Use the same entity-building pattern as `DashboardDataSeeder.java`
- Register via `@Component` — Spring auto-discovers it
- Add `@ConditionalOnProperty(name = "seed.scenario.enabled", havingValue = "true")`
  so it only runs when `seed.scenario.enabled=true` is set in `application.yml`

### Output 3: Summary Report

Print a formatted ASCII report:

```
═══════════════════════════════════════════════════════════════
  RESTAURANT SCENARIO REPORT
═══════════════════════════════════════════════════════════════
  Name        : <Restaurant Name>
  Country     : <Country>
  Timezone    : <IANA timezone>
  Tables      : <n>
  Cuisine     : <selected cuisine>
  Price Tier  : <BUDGET|MID|PREMIUM>

  MENU
  ─────────────────────────────────────────────────────────────
  Groups      : <n>  (menu_cost_group rows)
  Items       : <n>  (menu_item rows)
  Recipes     : <n>  (recipe rows)
  Ingredients : <n>  (ingredient rows)

  SUPPLIERS
  ─────────────────────────────────────────────────────────────
  <Supplier Name>  — <Category>
  <Supplier Name>  — <Category>

  STAFF
  ─────────────────────────────────────────────────────────────
  <Role>: <count>  @ <hourly_rate>/hr
  Total weekly labor cost : $<amount>
  Labor % of weekly revenue: <pct>

  PRICING
  ─────────────────────────────────────────────────────────────
  Avg food cost target   : <pct>%
  Avg sell price (mains) : $<amount>
  Tax rate               : <pct>%

  OUTPUT FILES
  ─────────────────────────────────────────────────────────────
  SQL Script  : db/migration/V*__restaurant_<slug>.sql
  Seeder      : application/seeder/RestaurantScenarioSeeder.java

  NEXT STEPS
  ─────────────────────────────────────────────────────────────
  1. Copy the SQL migration into db/migration/
  2. Set `seed.scenario.enabled=true` in application.yml
  3. Run: ./gradlew bootRun --args='--seed.scenario.enabled=true'
  4. Verify Prime Cost Hub shows live data
  5. Run traffic simulator for 90 days of history
═══════════════════════════════════════════════════════════════
```

---

## DEFAULT Mode Configuration

Runs "The Market Table" — a premium casual restaurant in New York.

```
Country         : United States
Timezone        : America/New_York
Currency        : USD
Tax Rate        : 10%
Restaurant Name : The Market Table
City            : New York, NY
Tables          : 24
Cuisine         : Modern Casual (American fusion, brunch, small plates)
Price Tier      : MID  (target food cost: 30%)
```

### Default Menu Groups:

| Group | RevenueCategory | Items |
|-------|----------------|-------|
| Breakfast & Brunch | FOOD | Avocado Toast, Buttermilk Pancakes, Eggs Benedict, Açaí Bowl |
| Small Plates | FOOD | Tuna Tartare, Burrata, Duck Confit Crostini, Tuna Poke Bowl |
| Mains | FOOD | NY Strip Steak, Pan-Roasted Salmon, Wild Mushroom Risotto, Grilled Lamb Rack |
| Soups & Salads | FOOD | Roasted Beet Salad, French Onion Soup, Caesar Salad |
| Desserts | FOOD | NY Cheesecake, Crème Brûlée, Dark Chocolate Tart |
| Coffee & Tea | SOFT_BEV | Espresso, Flat White, Matcha Latte, Fresh OJ |
| Wine by Glass | WINE | Sauvignon Blanc, Cabernet, Rosé, Chardonnay |
| Craft Beer | BEER | House IPA, Belgian Witbier, Pilsner |

### Default Suppliers:

| Supplier | Category | Coverage |
|----------|----------|---------|
| Hudson Valley Purveyors | PRODUCE | All produce |
| Prime Meats NYC | MEAT_SEAFOOD | Beef, lamb, duck |
| Fresh Catch Seafood | MEAT_SEAFOOD | Salmon, tuna, seafood |
| Gotham Dairy Supply | DAIRY | Cream, cheese, butter |
| Empire Dry Goods | DRY_GOODS | Flour, sugar, spices, oil |

### Default Staffing (24 tables):

| Role | Count | Hourly Rate | Weekly Cost |
|------|-------|-------------|-------------|
| Executive Chef | 1 | $38 | $1,520 |
| Sous Chef | 1 | $28 | $1,120 |
| Line Cook | 6 | $20 | $4,800 |
| Prep Cook | 2 | $18 | $1,440 |
| Kitchen Manager | 1 | $30 | $1,200 |
| Restaurant Manager | 1 | $32 | $1,280 |
| Host | 2 | $16 | $1,280 |
| Server | 8 | $16 | $5,120 |
| Bartender | 2 | $18 | $1,440 |
| Busser | 2 | $14 | $1,120 |
| Dishwasher | 2 | $16 | $1,280 |
| **TOTAL** | **28** | | **$21,600/week** |

Projected weekly revenue: ~$45,000 → Labor %: **48%** ← warn user, this is high for casual dining; suggest reducing servers to 6.

---

## Key Data Constraints (verify before generating SQL)

- `restaurant.id` must be unique — use `SELECT COALESCE(MAX(id), 0) + 1 FROM restaurant`
- `menu_item.pos_id` must be unique within restaurant
- `ingredient.item_code` must be unique within restaurant (use prefix + sequence: `ING01`, `ING02`)
- `menu_item.pos_id` format: 3-letter group prefix + 2-digit number (e.g. `BRK01`, `SAL01`)
- All FK IDs must exist before referenced (INSERT order matters)
- `staff.staff_id` uses UUID — generate with `gen_random_uuid()`
- `staff.pin_hash` — use `encode(sha256(random()::text), 'hex')` in raw SQL
- Timestamps use `NOW()` or `'2026-01-01'` for reproducible dates
- Use `ON CONFLICT (restaurant_id, item_code) DO NOTHING` for ingredients
- Use `ON CONFLICT (restaurant_id, pos_id) DO NOTHING` for menu items

---

## Appendix A — Cuisine Ingredient Catalogues

### Afghan

Core ingredients: Basmati Rice, Lamb Shoulder, Onions, Tomatoes, Garlic, Ginger, Cumin, Coriander, Turmeric, Garam Masala, Yogurt, Lentils, Chickpeas, Eggplant, Spinach, Naan Flour, Ghee, Cardamom, Cloves.

Groups: Mains — Afghan Classics | Skewers & Kebabs | Sides & Naan | Beverages

### American

Core ingredients: Beef Chuck, Pork Belly, Chicken Breast, Shrimp, Salmon, Cheddar, Lettuce, Tomatoes, Onions, Pickles, Breadcrumbs, Flour, Butter, Cream, Bacon, Maple Syrup.

Groups: Burgers & Sandwiches | Steaks & Grills | BBQ | Comfort Sides | Breakfast | Desserts | Beverages

### Chinese

Core ingredients: Jasmine Rice, Soy Sauce, Oyster Sauce, Sesame Oil, Rice Vinegar, Tofu, Bok Choy, Shiitake, Chicken Thigh, Shrimp, Pork, Garlic, Ginger, Scallions, Sichuan Peppercorns, Star Anise, Five Spice.

Groups: Dim Sum & Small Plates | Wok & Stir-Fry | Noodles | Rice Dishes | Soups | Desserts

### French

Core ingredients: Butter, Cream, Flour, Eggs, Gruyère, Shallots, Dijon Mustard, White Wine, Cognac, Thyme, Bay Leaf, Tarragon, Duck, Beef Tenderloin, Chicken Breast, Salmon.

Groups: Classics & Brasserie | Pasta & Risotto | Grill & Roasts | Soups & Salades | Desserts | Fromage & Charcuterie

### Indian

Core ingredients: Basmati Rice, Onions, Tomatoes, Garlic, Ginger, Green Chilies, Ghee, Mustard Oil, Cumin, Coriander, Turmeric, Garam Masala, Kashmiri Chili, Yogurt, Paneer, Lentils (Dal), Chickpeas, Spinach, Fenugreek, Cardamom, Cloves.

Groups: Tandoor & Breads | Curries & Gravies | Biryani & Rice | Starters | Desserts | Beverages

### Italian

Core ingredients: San Marzano Tomatoes, Pasta (various), Olive Oil, Garlic, Basil, Oregano, Parmesan, Mozzarella, Ricotta, Flour, Wine, Chicken Breast, Beef, Seafood, Gelato.

Groups: Antipasti & Insalate | Pasta Fresca | Pizza | Secondi (Mains) | Contorni (Sides) | Dolci (Desserts)

### Japanese

Core ingredients: Sushi Rice, Nori, Soy Sauce, Mirin, Sake, Kombu, Wasabi, Tuna, Salmon, Yellowtail, Tamago, Cucumber, Avocado, Ramen Noodles, Miso, Tofu, Pork Belly, Chicken, Shiitake.

Groups: Sushi & Sashimi | Ramen & Noodles | Izakaya | Yakitori | Rice Bowls | Desserts

### Mexican

Core ingredients: Corn Tortillas, Flour Tortillas, Black Beans, Pinto Beans, Rice, Onions, Garlic, Jalapeños, Tomatillos, Avocado, Limes, Cilantro, Chipotle, Cumin, Oregano, Sour Cream, Cheese (Oaxaca, Cotija), Chorizo, Chicken, Beef.

Groups: Antojitos (Small Plates) | Tacos & Tortas | Moles & Enchiladas | Rice & Beans | Postres (Desserts)

### Modern Casual

Core ingredients: Avocado, Arugula, Salmon, Tuna, Beef Tenderloin, Duck Breast, Free-Range Chicken, Burrata, Heritage Pork, Seasonal Vegetables, Fresh Herbs, Tahini, Labneh, Polenta, Risotto Rice.

Groups: Brunch | Small Plates | Mains | Salads & Soups | Desserts | Coffee & Tea | Wine | Beer

### Thai

Core ingredients: Jasmine Rice, Rice Noodles, Coconut Milk, Fish Sauce, Palm Sugar, Lime, Lemongrass, Galangal, Thai Basil, Kaffir Lime, Red Curry Paste, Green Curry Paste, Shrimp Paste, Tofu, Chicken, Beef, Shrimp, Bean Sprouts.

Groups: Curries | Stir-Fries & Noodles | Soups | Rice Dishes | Starters | Desserts

### Mediterranean

Core ingredients: Olive Oil, Lemons, Garlic, Oregano, Parsley, Chickpeas, Hummus, Labneh, Falafel, Lamb, Beef, Grilled Vegetables, Couscous, Pita, Feta, Olives, Tahini.

Groups: Mezze & Small Plates | Grilled Mains | Rice & Grains | Salads | Desserts

---

## Appendix B — Menu Group Templates per Cuisine

Each template defines:
- `groupName`: name of the menu cost group
- `displayOrder`: sort order
- `revenueCategory`: RevenueCategory enum value
- `items`: array of `{ name, posIdPrefix, targetFcPct, ingredientCodes[] }`

For each cuisine, the skill generates items automatically using:
1. The cuisine's item list from the template
2. Ingredient catalogue for costing
3. User's selected price tier for sell price calculation

---

## Appendix C — Base Purchase Prices (USD)

Used when generating purchase prices for ingredients.

| Ingredient | Unit | Price |
|-----------|------|-------|
| Beef (Chuck) | LB | $5.99 |
| Lamb (Shoulder) | LB | $8.99 |
| Salmon (Fillets) | LB | $12.99 |
| Shrimp (16/20) | LB | $9.99 |
| Chicken Breast | LB | $4.49 |
| Pork Belly | LB | $6.99 |
| Tuna (Sushi Grade) | LB | $22.99 |
| Eggs | DOZEN | $4.99 |
| Butter | LB | $4.50 |
| Heavy Cream | GALLON | $8.99 |
| Milk | GALLON | $4.49 |
| Cheddar | LB | $7.99 |
| Mozzarella | LB | $8.99 |
| Parmesan | LB | $16.99 |
| Flour (All-Purpose) | 50 LB | $28.00 |
| Basmati Rice | 20 LB | $32.00 |
| Jasmine Rice | 20 LB | $28.00 |
| Olive Oil (Extra Virgin) | LITER | $12.99 |
| Soy Sauce | GALLON | $8.99 |
| Onions | LB | $1.29 |
| Tomatoes | LB | $2.49 |
| Garlic | LB | $6.99 |
| Potatoes | LB | $1.19 |
| Lettuce | EACH | $1.99 |
| Avocados | EACH | $1.79 |
| Lemons | EACH | $0.49 |
| Fresh Herbs (Mixed) | BUNCH | $2.99 |
| Fish Sauce | LITER | $7.99 |
| Coconut Milk | EACH (400ml) | $2.49 |

---

## Implementation Notes

### SQL UUID generation
```sql
-- PostgreSQL:
gen_random_uuid() → UUID
encode(sha256(random()::text), 'hex') → pin_hash (64-char hex)

-- Insert order is CRITICAL — FK dependencies must be satisfied
```

### Ingredient unit mapping

| PurchaseUnit | RecipeUnit | InventoryUnit |
|------------|-----------|--------------|
| LB | LB | LB |
| OZ | OZ_WEIGHT | OZ |
| EACH | EACH | EACH |
| CASE | varies | CASE |
| BOTTLE | OZ_FLUID | BOTTLE |
| KEG | OZ_FLUID | KEG |
| GALLON | GALLON | GALLON |

### Ingredient RU/PU/Yield defaults

For consistency, use:
- `ru_per_pu = 1` (one recipe unit per purchase unit) for countables
- `ru_per_pu = 1` for weight-based items where 1 LB purchased = 1 LB used
- `yield_pct = 1.0000` (100%) for processed/pre-portioned items
- `yield_pct = 0.85` for raw meat (15% trim loss)
- `yield_pct = 0.90` for whole fish (10% trim)
- `yield_pct = 0.95` for most produce

### Plate cost vs. ingredient cost

`plate_cost = sum(ingredient_cost_per_item) + garnish_cost`

Garnish cost: $0.50 flat per plate (herb sprigs, sauce drizzle, etc.)
