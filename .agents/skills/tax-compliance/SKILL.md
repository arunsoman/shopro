# SKILL: Shopro POS — Taxes & Compliance Module

## Meta

| Field | Value |
|-------|-------|
| **Skill ID** | `shopro-taxes-compliance` |
| **Version** | 1.0.0 |
| **Stack** | React 18 + TypeScript · Spring Boot 3 · PostgreSQL 15 |
| **PRD Reference** | `SHOPRO_TAX_MODULE_REQUIREMENTS.md` |
| **Scope** | Full-stack: DB migrations → Spring services → REST API → React UI → Tests |

---

## 0. HOW TO USE THIS SKILL

Read every section **in full before writing a single line of code**. This skill is prescriptive — it tells you exactly what to create, where to put it, what patterns to follow, and how to verify. Deviation from these instructions will produce a module that is inconsistent with the existing Shopro codebase.

### Execution order

```
1. AUDIT existing codebase (Section 1)
2. DATABASE migrations (Section 2)
3. BACKEND — entities, repos, services, engine, controller (Section 3)
4. FRONTEND — feature directory, pages, components (Section 4)
5. TESTS — unit, integration, frontend (Section 5)
6. SELF-CHECK against the verification matrix (Section 6)
```

Never skip to a later section. Each section depends on knowledge from the one before it.

---

## 1. CODEBASE AUDIT — DO THIS FIRST

Before writing anything, run the following discovery steps and record what you find. All code you write must be consistent with what you discover here.

### 1.1 Theme & Design Token Audit

```bash
# Find the global CSS / theme file
find src -name "*.css" -o -name "*.scss" | grep -i "global\|theme\|variable\|index" | head -20
find src -name "tailwind.config*"

# Capture all CSS custom properties in use
grep -r "var(--" src --include="*.tsx" --include="*.css" | \
  grep -oP "var\(--[a-z-]+\)" | sort -u

# Find what colour palette names are in use
grep -r "bg-\|text-\|border-\|ring-" src --include="*.tsx" | \
  grep -oP "(bg|text|border|ring)-[a-z]+-[0-9]+" | sort | uniq -c | sort -rn | head -40
```

**Record:** The primary brand colour (likely an amber/orange or slate family for a POS product), the neutral palette, and any semantic token names like `primary`, `accent`, `destructive`, `muted`.

```bash
# Find the design system / component library in use
cat package.json | grep -E "shadcn|radix|headless|chakra|mantine|antd|mui"

# Find where shared UI primitives live
find src -type d -name "ui" | head -5
ls src/components/ui/ 2>/dev/null | head -30
```

**Record:** Whether the project uses shadcn/ui, a custom component library, or raw Tailwind. Note exact component names (e.g. `Button`, `Card`, `Badge`, `Dialog`, `Drawer`, `Table`, `Tabs`, `Select`, `Input`, `Tooltip`, `Toast`).

### 1.2 Layout & Navigation Audit

```bash
# Find the main layout shell
find src -name "Layout*" -o -name "Shell*" -o -name "Sidebar*" | grep -v node_modules

# Find the dashboard page and NAV_CARDS array
grep -rn "NAV_CARDS\|navCards\|DashboardPage" src --include="*.tsx" | head -20

# Understand the routing pattern
cat src/App.tsx 2>/dev/null || cat src/main.tsx 2>/dev/null

# Find how protected routes are defined
grep -rn "ProtectedRoute\|RequireAuth\|ADMIN_ROLES\|withAuth" src --include="*.tsx" | head -10
```

**Record:** The exact names and import paths of: the layout wrapper component, the route-protection HOC, and the role constant used for admin access.

### 1.3 Feature Directory Pattern Audit

```bash
# Understand the feature module structure
find src/features -type d | head -30
# If features/ doesn't exist, check alternative structures:
find src -type d -name "pages" | head -10
find src -type d -name "modules" | head -10

# Pick one existing feature and study it fully
ls src/features/$(ls src/features/ | head -1)/
```

**Record:** The exact folder structure used for an existing feature (e.g. `api/`, `components/`, `pages/`, `hooks/`, `types/`). The new taxes feature MUST follow the identical structure.

### 1.4 API Client Audit

```bash
# Find the HTTP client / API base setup
find src -name "api*" -o -name "client*" -o -name "axios*" | grep -v node_modules | head -10
grep -rn "axios\|fetch\|ky\|swr\|react-query\|tanstack" src/package.json 2>/dev/null || \
  grep -rn "axios\|useQuery\|useMutation" src --include="*.tsx" | head -10
```

**Record:** Whether the project uses Axios, fetch, React Query / TanStack Query, SWR, or a custom hook pattern. Note the base URL setup and how auth headers are attached.

### 1.5 Toast / Notification Audit

```bash
grep -rn "toast\|notification\|snackbar\|Toaster" src --include="*.tsx" | head -10
```

**Record:** The exact toast function signature used (e.g. `toast.success('...')`, `addToast(...)`, `useToast()`).

### 1.6 Form Validation Audit

```bash
grep -rn "react-hook-form\|formik\|zod\|yup" src --include="*.tsx" | head -10
```

**Record:** The form library and validation schema library in use.

### 1.7 Existing Spring Boot Patterns Audit

```bash
# Find the existing controller for reference
find src/main/java -name "*Controller.java" | head -5
cat $(find src/main/java -name "*Controller.java" | head -1)

# Find how JWT auth is handled
find src/main/java -name "*Security*" -o -name "*JwtFilter*" | head -5

# Find the Flyway migration directory and naming convention
ls src/main/resources/db/migration/ | tail -5

# Find the existing entity/repo pattern
find src/main/java -name "*Entity.java" | head -3
find src/main/java -name "*Repository.java" | head -3
find src/main/java -name "*Service.java" | head -3
```

**Record:** The Java package root (e.g. `com.shopro`), the naming convention for Flyway files (e.g. `V3__description.sql`), the `@Entity` base class if any (e.g. `BaseEntity` with `createdAt`/`updatedAt`), and how `@PreAuthorize` roles are named.

---

## 2. DATABASE MIGRATIONS

### 2.1 File naming

Follow the **exact** Flyway version numbering found in your audit. If the last migration is `V5__add_discounts.sql`, your first migration must be `V6__create_tax_tables.sql`.

### 2.2 Migration 1 — Create tables

**Filename:** `V{N}__create_tax_tables.sql`

Create the following tables in this exact order (respects FK dependencies):

```sql
-- 1. countries
CREATE TABLE countries (
    id              SERIAL PRIMARY KEY,
    iso_code        CHAR(2)      NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    currency_code   CHAR(3)      NOT NULL,
    currency_symbol VARCHAR(5)   NOT NULL,
    tax_model       VARCHAR(30)  NOT NULL
        CHECK (tax_model IN ('VAT_INCLUSIVE','TAX_EXCLUSIVE','GST')),
    tax_included    BOOLEAN      NOT NULL DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. tax_rules
CREATE TABLE tax_rules (
    id                   SERIAL PRIMARY KEY,
    country_id           INT          NOT NULL REFERENCES countries(id),
    rule_code            VARCHAR(50)  NOT NULL,
    rule_name            VARCHAR(150) NOT NULL,
    tax_type             VARCHAR(50)  NOT NULL
        CHECK (tax_type IN ('VAT','GST','SALES_TAX','STATE_EXCISE','EXCISE','LEVY','SERVICE_CHARGE')),
    default_rate         NUMERIC(6,4) NOT NULL,
    min_allowed_rate     NUMERIC(6,4) NOT NULL,
    max_allowed_rate     NUMERIC(6,4) NOT NULL,
    applies_to_dine_in   BOOLEAN      NOT NULL DEFAULT TRUE,
    applies_to_takeaway  BOOLEAN      NOT NULL DEFAULT TRUE,
    applies_to_hot       BOOLEAN,
    applies_to_cold      BOOLEAN,
    applies_to_alcohol   BOOLEAN      NOT NULL DEFAULT FALSE,
    item_category        VARCHAR(50),
    price_threshold_min  NUMERIC(12,2),
    price_threshold_max  NUMERIC(12,2),
    is_cascading         BOOLEAN      NOT NULL DEFAULT FALSE,
    cascade_on_rule_id   INT          REFERENCES tax_rules(id),
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order           INT          NOT NULL DEFAULT 0,
    description          TEXT,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, rule_code),
    CHECK (min_allowed_rate <= max_allowed_rate),
    CHECK (default_rate >= min_allowed_rate AND default_rate <= max_allowed_rate)
);
CREATE INDEX idx_tax_rules_country        ON tax_rules(country_id);
CREATE INDEX idx_tax_rules_active         ON tax_rules(country_id, is_active);
CREATE INDEX idx_tax_rules_cascade        ON tax_rules(cascade_on_rule_id);

-- 3. venue_country_assignments
CREATE TABLE venue_country_assignments (
    id          SERIAL PRIMARY KEY,
    venue_id    INT          NOT NULL UNIQUE,
    country_id  INT          NOT NULL REFERENCES countries(id),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    assigned_by INT          NOT NULL,
    assigned_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 4. venue_tax_configs (overrides)
CREATE TABLE venue_tax_configs (
    id              SERIAL PRIMARY KEY,
    venue_id        INT          NOT NULL,
    tax_rule_id     INT          NOT NULL REFERENCES tax_rules(id),
    override_rate   NUMERIC(6,4) NOT NULL,
    override_reason TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by      INT          NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (venue_id, tax_rule_id)
);
CREATE INDEX idx_venue_tax_configs_venue  ON venue_tax_configs(venue_id);

-- 5. item_tax_tags
CREATE TABLE item_tax_tags (
    id              SERIAL PRIMARY KEY,
    menu_item_id    INT         NOT NULL UNIQUE,
    temperature     VARCHAR(10)
        CHECK (temperature IN ('HOT','COLD')),
    item_category   VARCHAR(50) NOT NULL
        CHECK (item_category IN ('FOOD','BEVERAGE','ALCOHOL','TOBACCO')),
    is_basic_staple BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. tax_audit_logs
CREATE TABLE tax_audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    venue_id        INT          NOT NULL,
    tax_rule_id     INT          NOT NULL REFERENCES tax_rules(id),
    action          VARCHAR(30)  NOT NULL
        CHECK (action IN ('OVERRIDE_SET','OVERRIDE_REMOVED','COUNTRY_CHANGED','COUNTRY_ASSIGNED')),
    old_rate        NUMERIC(6,4),
    new_rate        NUMERIC(6,4),
    changed_by      INT          NOT NULL,
    changed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    change_reason   TEXT,
    ip_address      INET
);
CREATE INDEX idx_tax_audit_logs_venue     ON tax_audit_logs(venue_id, changed_at DESC);

-- 7. tax_calculation_results
CREATE TABLE tax_calculation_results (
    id               BIGSERIAL   PRIMARY KEY,
    ticket_id        BIGINT       NOT NULL,
    ticket_item_id   BIGINT       NOT NULL,
    tax_rule_id      INT          NOT NULL REFERENCES tax_rules(id),
    rule_code        VARCHAR(50)  NOT NULL,
    base_amount      NUMERIC(12,2) NOT NULL,
    tax_rate         NUMERIC(6,4)  NOT NULL,
    tax_amount       NUMERIC(12,2) NOT NULL,
    order_type       VARCHAR(20)   NOT NULL
        CHECK (order_type IN ('DINE_IN','TAKEAWAY','DELIVERY')),
    item_temperature VARCHAR(10),
    calculated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tax_calc_ticket          ON tax_calculation_results(ticket_id);
```

**Validation check after running migration:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'countries','tax_rules','venue_country_assignments',
    'venue_tax_configs','item_tax_tags','tax_audit_logs','tax_calculation_results'
  );
-- Must return exactly 7 rows.
```

### 2.3 Migration 2 — Seed country + tax rule data

**Filename:** `V{N+1}__seed_tax_rules.sql`

Insert all 13 jurisdictions. Below is the complete seed. Copy verbatim.

```sql
-- ============================================================
-- COUNTRIES
-- ============================================================
INSERT INTO countries (iso_code, name, currency_code, currency_symbol, tax_model, tax_included, notes) VALUES
('GB',    'United Kingdom',             'GBP', '£',   'VAT_INCLUSIVE',  TRUE,  'VAT temperature rule applies'),
('US-CA', 'United States (California)', 'USD', '$',   'TAX_EXCLUSIVE',  FALSE, '80/80 rule may apply'),
('US-OH', 'United States (Ohio)',       'USD', '$',   'TAX_EXCLUSIVE',  FALSE, 'Takeaway exempt'),
('US-NY', 'United States (New York)',   'USD', '$',   'TAX_EXCLUSIVE',  FALSE, 'Ready-to-eat food taxable'),
('IN',    'India',                      'INR', '₹',   'TAX_EXCLUSIVE',  FALSE, 'GST split CGST+SGST. Alcohol outside GST.'),
('AU',    'Australia',                  'AUD', 'A$',  'GST',            TRUE,  'Prepared meals 10%. Basic groceries exempt.'),
('CA',    'Canada (Ontario)',           'CAD', 'C$',  'TAX_EXCLUSIVE',  FALSE, 'Ontario $4 price threshold rule'),
('ZA',    'South Africa',               'ZAR', 'R',   'VAT_INCLUSIVE',  TRUE,  'Standard 15% VAT'),
('KE',    'Kenya',                      'KES', 'KSh', 'TAX_EXCLUSIVE',  FALSE, 'CTL 2% for qualifying venues'),
('NG',    'Nigeria',                    'NGN', '₦',   'TAX_EXCLUSIVE',  FALSE, 'Lagos State adds 5% consumption tax'),
('EG',    'Egypt',                      'EGP', 'E£',  'TAX_EXCLUSIVE',  FALSE, 'Service charge is taxable revenue'),
('GH',    'Ghana',                      'GHS', 'GH₵', 'TAX_EXCLUSIVE',  FALSE, 'Multiple cascading levies'),
('AE',    'United Arab Emirates',       'AED', 'AED', 'TAX_EXCLUSIVE',  FALSE, 'Alcohol 30% excise. Tobacco 100% excise.'),
('SA',    'Saudi Arabia',               'SAR', '﷼',   'TAX_EXCLUSIVE',  FALSE, 'Alcohol prohibited. Tobacco 100% excise.');

-- ============================================================
-- TAX RULES — United Kingdom
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id,
  v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.default_rate, v.min_rate, v.max_rate,
  v.dine_in, v.takeaway, v.hot, v.cold, v.alcohol,
  v.category, FALSE, TRUE, v.sort_order, v.description
FROM countries c,
(VALUES
  ('UK_VAT_STANDARD',      'UK VAT Standard Rate',                  'VAT', 0.20, 0.20, 0.20, TRUE,  TRUE,  TRUE,  NULL,  FALSE, NULL,      1, 'Dine-in all food; hot takeaway items'),
  ('UK_VAT_DINE_IN_COLD',  'UK VAT Dine-In Cold Items',             'VAT', 0.20, 0.20, 0.20, TRUE,  FALSE, FALSE, TRUE,  FALSE, NULL,      2, 'Cold food consumed on premises'),
  ('UK_VAT_ZERO',          'UK VAT Zero Rate — Cold Takeaway',      'VAT', 0.00, 0.00, 0.00, FALSE, TRUE,  FALSE, TRUE,  FALSE, 'FOOD',    3, 'Cold sandwiches/salads as takeaway are zero-rated'),
  ('UK_VAT_ALCOHOL',       'UK VAT — Alcohol',                      'VAT', 0.20, 0.20, 0.20, TRUE,  TRUE,  NULL,  NULL,  TRUE,  'ALCOHOL', 4, 'All alcohol at 20%'),
  ('UK_VAT_SERVICE_CHARGE','UK VAT on Mandatory Service Charge',    'VAT', 0.20, 0.20, 0.20, TRUE,  FALSE, NULL,  NULL,  FALSE, NULL,      5, 'Service charge taxed as revenue')
) AS v(rule_code,rule_name,tax_type,default_rate,min_rate,max_rate,dine_in,takeaway,hot,cold,alcohol,category,sort_order,description)
WHERE c.iso_code = 'GB';

-- ============================================================
-- TAX RULES — USA California
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id,
  v.rule_code, v.rule_name, 'SALES_TAX', v.default_rate, v.min_rate, v.max_rate,
  v.dine_in, v.takeaway, v.hot, v.cold, v.alcohol,
  v.category, FALSE, TRUE, v.sort_order, v.description
FROM countries c,
(VALUES
  ('USCA_SALES_TAX_HOT',     'CA Sales Tax — Hot Food (Dine-In & Takeaway)', 0.095, 0.0725, 0.1075, TRUE,  TRUE,  TRUE,  FALSE, FALSE, NULL,      1, 'Hot food always taxable in CA'),
  ('USCA_SALES_TAX_COLD_EX', 'CA Exempt — Cold Takeaway Food',               0.000, 0.0000, 0.0000, FALSE, TRUE,  FALSE, TRUE,  FALSE, 'FOOD',    2, 'Cold to-go exempt unless 80/80 rule applies'),
  ('USCA_SALES_TAX_ALCOHOL',  'CA Sales Tax — Alcohol',                       0.095, 0.0725, 0.1075, TRUE,  TRUE,  NULL,  NULL,  TRUE,  'ALCOHOL', 3, 'Alcohol always taxable'),
  ('USCA_SALES_TAX_SC',       'CA Sales Tax — Mandatory Service Charge',      0.095, 0.0725, 0.1075, TRUE,  FALSE, NULL,  NULL,  FALSE, NULL,      4, 'Mandatory service charge is taxable')
) AS v(rule_code,rule_name,default_rate,min_rate,max_rate,dine_in,takeaway,hot,cold,alcohol,category,sort_order,description)
WHERE c.iso_code = 'US-CA';

-- ============================================================
-- TAX RULES — USA Ohio
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id,
  v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.default_rate, v.min_rate, v.max_rate,
  v.dine_in, v.takeaway, NULL, NULL, v.alcohol,
  NULL, FALSE, TRUE, v.sort_order, v.description
FROM countries c,
(VALUES
  ('USOH_SALES_TAX_DINE_IN', 'OH Sales Tax — Dine-In',   'SALES_TAX', 0.0575, 0.0575, 0.0800, TRUE,  FALSE, FALSE, 1, 'Standard dine-in rate'),
  ('USOH_EXEMPT_TAKEAWAY',   'OH Exempt — All Takeaway',  'SALES_TAX', 0.0000, 0.0000, 0.0000, FALSE, TRUE,  FALSE, 2, 'All takeaway food exempt in Ohio'),
  ('USOH_SALES_TAX_ALCOHOL',  'OH Sales Tax — Alcohol',   'SALES_TAX', 0.0575, 0.0575, 0.0800, TRUE,  TRUE,  TRUE,  3, 'Alcohol always taxable')
) AS v(rule_code,rule_name,tax_type,default_rate,min_rate,max_rate,dine_in,takeaway,alcohol,sort_order,description)
WHERE c.iso_code = 'US-OH';

-- ============================================================
-- TAX RULES — USA New York
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'SALES_TAX', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, NULL, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('USNY_SALES_TAX_READY_EAT', 'NY Sales Tax — Ready-to-Eat', 0.08875, FALSE, 1, 'All ready-to-eat food taxable'),
  ('USNY_SALES_TAX_ALCOHOL',   'NY Sales Tax — Alcohol',       0.08875, TRUE,  2, 'Alcohol taxable')
) AS v(rule_code,rule_name,rate,alcohol,sort_order,desc)
WHERE c.iso_code = 'US-NY';

-- ============================================================
-- TAX RULES — India
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.default_rate, v.min_rate, v.max_rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('IN_GST_5',             'India GST — Standard Restaurants (5%)',     'GST',          0.05, 0.05, 0.05, FALSE, 'FOOD',     1, 'No ITC. Standalone restaurants.'),
  ('IN_GST_18',            'India GST — Luxury Hotel Restaurants (18%)','GST',          0.18, 0.18, 0.18, FALSE, 'FOOD',     2, 'ITC allowed. Hotel room tariff >₹7500/night.'),
  ('IN_STATE_EXCISE_ALCO', 'India State Excise — Alcohol',              'STATE_EXCISE', 0.20, 0.15, 0.35, TRUE,  'ALCOHOL',  3, 'Outside GST scope. State-level excise.')
) AS v(rule_code,rule_name,tax_type,default_rate,min_rate,max_rate,alcohol,category,sort_order,desc)
WHERE c.iso_code = 'IN';

-- ============================================================
-- TAX RULES — Australia
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'GST', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('AU_GST_PREPARED',      'AU GST — Prepared Meals',         0.10, FALSE, 'FOOD',     1, 'Sushi, sandwiches, hot pies — 10%'),
  ('AU_GST_EXEMPT_BASIC',  'AU GST — Basic Groceries Exempt', 0.00, FALSE, 'FOOD',     2, 'Unprocessed fruit, veg, basic bread — 0%'),
  ('AU_GST_ALCOHOL',       'AU GST — Alcohol',                0.10, TRUE,  'ALCOHOL',  3, 'Standard 10% GST on alcohol')
) AS v(rule_code,rule_name,rate,alcohol,category,sort_order,desc)
WHERE c.iso_code = 'AU';

-- ============================================================
-- TAX RULES — Canada (Ontario)
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, price_threshold_max, price_threshold_min,
  is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.min_r, v.max_r,
  v.dine_in, v.takeaway, NULL, NULL, v.alcohol, v.category, v.thresh_max, v.thresh_min,
  FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('CA_GST_ONLY',        'Canada GST Only (<$4 Ontario Rebate)', 'SALES_TAX', 0.05, 0.05, 0.05, FALSE, TRUE,  FALSE, NULL,      4.00, 1, 'Under $4 takeaway: 5% GST only, provincial rebated'),
  ('CA_HST_ON',          'Canada HST Ontario (≥$4)',             'SALES_TAX', 0.13, 0.13, 0.15, TRUE,  TRUE,  FALSE, NULL,      NULL, 2, 'Standard HST for Ontario above $4 threshold'),
  ('CA_GST_COLD_EXEMPT', 'Canada GST — Cold Basic Grocery',      'SALES_TAX', 0.00, 0.00, 0.00, FALSE, TRUE,  FALSE, 'FOOD',    NULL, 3, 'Unprocessed cold groceries zero-rated'),
  ('CA_HST_ALCOHOL',     'Canada HST — Alcohol',                 'SALES_TAX', 0.13, 0.05, 0.15, TRUE,  TRUE,  TRUE,  'ALCOHOL', NULL, 4, 'Alcohol HST')
) AS v(rule_code,rule_name,tax_type,rate,min_r,max_r,dine_in,takeaway,alcohol,category,thresh_max,thresh_min,sort_order,desc)
WHERE c.iso_code = 'CA';

-- ============================================================
-- TAX RULES — South Africa
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'VAT', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('ZA_VAT_STANDARD',   'SA VAT — Prepared Food',           0.15, FALSE, 'FOOD',     1, '15% on all prepared restaurant food'),
  ('ZA_VAT_ZERO_STAPLE','SA VAT — Unprocessed Staples Zero',0.00, FALSE, 'FOOD',     2, 'Raw veg, milk, bread — zero-rated'),
  ('ZA_VAT_ALCOHOL',    'SA VAT — Alcohol',                  0.15, TRUE,  'ALCOHOL',  3, 'Standard VAT on alcohol')
) AS v(rule_code,rule_name,rate,alcohol,category,sort_order,desc)
WHERE c.iso_code = 'ZA';

-- ============================================================
-- TAX RULES — Kenya
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, NULL, v.cascading, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('KE_VAT_STANDARD', 'Kenya VAT',                    'VAT',   0.16, FALSE, FALSE, 1, '16% VAT on all restaurant sales'),
  ('KE_CTL_LEVY',     'Kenya Catering Tourism Levy',  'LEVY',  0.02, TRUE,  FALSE, 2, '2% CTL for venues above revenue threshold'),
  ('KE_VAT_ALCOHOL',  'Kenya VAT — Alcohol',          'VAT',   0.16, FALSE, TRUE,  3, 'Standard 16% on alcohol')
) AS v(rule_code,rule_name,tax_type,rate,cascading,alcohol,sort_order,desc)
WHERE c.iso_code = 'KE';

-- Set cascade target for KE_CTL_LEVY
UPDATE tax_rules
SET cascade_on_rule_id = (SELECT id FROM tax_rules WHERE rule_code = 'KE_VAT_STANDARD')
WHERE rule_code = 'KE_CTL_LEVY';

-- ============================================================
-- TAX RULES — Nigeria
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, NULL, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('NG_FEDERAL_VAT',      'Nigeria Federal VAT',           'VAT',   0.075, FALSE, 1, '7.5% federal VAT'),
  ('NG_LAGOS_CONSUMPTION','Lagos State Consumption Tax',   'LEVY',  0.050, FALSE, 2, '5% additive tax in Lagos state'),
  ('NG_ALCOHOL_VAT',      'Nigeria VAT — Alcohol',         'VAT',   0.075, TRUE,  3, 'Federal VAT on alcohol')
) AS v(rule_code,rule_name,tax_type,rate,alcohol,sort_order,desc)
WHERE c.iso_code = 'NG';

-- ============================================================
-- TAX RULES — Egypt
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, cascade_on_rule_id, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, 'VAT', v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, NULL, v.cascading, NULL, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('EG_VAT_STANDARD',    'Egypt VAT',                         0.14, FALSE, 1, 'Standard 14% VAT'),
  ('EG_SERVICE_CHARGE',  'Egypt Mandatory Service Charge',    0.12, FALSE, 2, '12% SC added to bill as taxable revenue'),
  ('EG_VAT_ON_SC',       'Egypt VAT Applied on Service Charge',0.14, TRUE,  3, '14% VAT cascades on top of 12% SC')
) AS v(rule_code,rule_name,rate,cascading,sort_order,desc)
WHERE c.iso_code = 'EG';

UPDATE tax_rules
SET cascade_on_rule_id = (SELECT id FROM tax_rules WHERE rule_code = 'EG_SERVICE_CHARGE')
WHERE rule_code = 'EG_VAT_ON_SC';

-- ============================================================
-- TAX RULES — Ghana
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, NULL, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('GH_VAT',          'Ghana VAT',                          'VAT',   0.125, 1, '12.5% standard VAT'),
  ('GH_NHIL',         'National Health Insurance Levy',     'LEVY',  0.025, 2, '2.5% NHIL on base price'),
  ('GH_GETFUND',      'Ghana Education Trust Fund Levy',    'LEVY',  0.025, 3, '2.5% GETFund on base price'),
  ('GH_COVID_LEVY',   'COVID-19 Recovery Levy',             'LEVY',  0.010, 4, '1% on base price'),
  ('GH_TOURISM_LEVY', 'Tourism Levy',                       'LEVY',  0.010, 5, '1% on base price')
) AS v(rule_code,rule_name,tax_type,rate,sort_order,desc)
WHERE c.iso_code = 'GH';

-- ============================================================
-- TAX RULES — UAE
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, v.alcohol, v.category, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('AE_VAT_STANDARD',      'UAE VAT',                          'VAT',    0.05, FALSE, NULL,      1, '5% standard VAT on food and non-alcohol'),
  ('AE_VAT_ALCOHOL',       'UAE VAT + Excise — Alcohol',       'EXCISE', 0.30, TRUE,  'ALCOHOL', 2, '30% effective rate on alcohol'),
  ('AE_EXCISE_TOBACCO',    'UAE Excise — Tobacco/Shisha',      'EXCISE', 1.00, FALSE, 'TOBACCO', 3, '100% excise on tobacco products'),
  ('AE_VAT_SERVICE_CHARGE','UAE VAT on Service Charge',        'VAT',    0.05, FALSE, NULL,      4, '5% VAT applied to service charge')
) AS v(rule_code,rule_name,tax_type,rate,alcohol,category,sort_order,desc)
WHERE c.iso_code = 'AE';

-- ============================================================
-- TAX RULES — Saudi Arabia
-- ============================================================
INSERT INTO tax_rules (country_id, rule_code, rule_name, tax_type, default_rate, min_allowed_rate, max_allowed_rate,
  applies_to_dine_in, applies_to_takeaway, applies_to_hot, applies_to_cold, applies_to_alcohol,
  item_category, is_cascading, is_active, sort_order, description)
SELECT c.id, v.rule_code, v.rule_name, v.tax_type::VARCHAR, v.rate, v.rate, v.rate,
  TRUE, TRUE, NULL, NULL, FALSE, v.category, FALSE, TRUE, v.sort_order, v.desc
FROM countries c,
(VALUES
  ('SA_VAT_STANDARD',   'Saudi Arabia VAT',             'VAT',    0.15, NULL,      1, '15% standard VAT on all food and beverages'),
  ('SA_EXCISE_TOBACCO', 'KSA Excise — Tobacco/Shisha',  'EXCISE', 1.00, 'TOBACCO', 2, '100% excise on tobacco products')
) AS v(rule_code,rule_name,tax_type,rate,category,sort_order,desc)
WHERE c.iso_code = 'SA';

-- ============================================================
-- VERIFY SEED
-- ============================================================
DO $$
DECLARE
  country_count INT;
  rule_count    INT;
BEGIN
  SELECT COUNT(*) INTO country_count FROM countries;
  SELECT COUNT(*) INTO rule_count    FROM tax_rules;
  IF country_count < 14 THEN RAISE EXCEPTION 'Seed failed: expected 14 countries, got %', country_count; END IF;
  IF rule_count    < 40 THEN RAISE EXCEPTION 'Seed failed: expected ≥40 tax rules, got %', rule_count;   END IF;
  RAISE NOTICE 'Seed OK: % countries, % tax rules', country_count, rule_count;
END $$;
```

---

## 3. BACKEND IMPLEMENTATION

### 3.1 Package structure

All classes live under `{rootPackage}.tax`. Mirror the pattern used by existing features in the codebase.

```
{rootPackage}.tax
├── controller
│   └── TaxController.java
├── dto
│   ├── request
│   │   ├── TaxCalculationRequest.java
│   │   ├── TaxLineItemRequest.java
│   │   ├── OverrideRateRequest.java
│   │   └── AssignCountryRequest.java
│   └── response
│       ├── CountryResponse.java
│       ├── CountryRulesResponse.java
│       ├── TaxRuleResponse.java
│       ├── TaxCalculationResponse.java
│       ├── TaxLineItemResult.java
│       ├── TaxSummaryResponse.java
│       ├── TaxBreakdownEntry.java
│       ├── VenueCountryResponse.java
│       ├── AuditLogResponse.java
│       └── PageResponse.java
├── engine
│   ├── TaxEngine.java
│   ├── TaxRuleResolver.java
│   ├── TaxCalculator.java
│   └── exception
│       ├── RateOutOfBoundsException.java
│       ├── AlcoholProhibitedException.java
│       ├── VenueCountryNotSetException.java
│       └── ItemTagMissingException.java
├── entity
│   ├── Country.java
│   ├── TaxRule.java
│   ├── VenueCountryAssignment.java
│   ├── VenueTaxConfig.java
│   ├── ItemTaxTag.java
│   ├── TaxAuditLog.java
│   └── TaxCalculationResult.java
├── repository
│   ├── CountryRepository.java
│   ├── TaxRuleRepository.java
│   ├── VenueCountryAssignmentRepository.java
│   ├── VenueTaxConfigRepository.java
│   ├── ItemTaxTagRepository.java
│   ├── TaxAuditLogRepository.java
│   └── TaxCalculationResultRepository.java
└── service
    ├── TaxConfigService.java
    ├── TaxAuditService.java
    └── ItemTaxTagService.java
```

### 3.2 Entity implementation rules

- Use `@Entity`, `@Table(name = "...")` matching the migration table names exactly.
- If the codebase has a `BaseEntity` with `createdAt`/`updatedAt`, extend it. Otherwise, add those fields directly.
- Use `@Enumerated(EnumType.STRING)` for all enum columns.
- Use `BigDecimal` for all monetary/rate fields (never `double` or `float`).
- `TaxRule.cascadeOnRule` is a self-referential `@ManyToOne(fetch = FetchType.LAZY)`.
- Use `@ColumnDefault("NOW()")` or set defaults in the DB (migration already does this).

### 3.3 Repository implementation rules

`TaxRuleRepository` must include these custom queries:

```java
// All active rules for a country, ordered
List<TaxRule> findByCountryIsoCodeAndIsActiveTrueOrderBySortOrderAsc(String isoCode);

// For the engine — fetch with venue overrides in a single query
@Query("""
    SELECT r FROM TaxRule r
    LEFT JOIN VenueTaxConfig c ON c.taxRule.id = r.id AND c.venueId = :venueId AND c.isActive = true
    WHERE r.country.id = (
        SELECT vca.country.id FROM VenueCountryAssignment vca
        WHERE vca.venueId = :venueId AND vca.isActive = true
    )
    AND r.isActive = true
    ORDER BY r.sortOrder ASC
    """)
List<Object[]> findActiveRulesWithOverridesForVenue(@Param("venueId") Long venueId);
```

`TaxAuditLogRepository`:
```java
Page<TaxAuditLog> findByVenueIdOrderByChangedAtDesc(Long venueId, Pageable pageable);
Page<TaxAuditLog> findByVenueIdAndChangedAtBetweenOrderByChangedAtDesc(
    Long venueId, Instant from, Instant to, Pageable pageable);
```

### 3.4 TaxEngine implementation

The `TaxEngine` is the most critical class. Implement it as a `@Service` with `@Cacheable` on the rule-fetch step.

#### 3.4.1 Rule resolution method

```
resolveRule(List<TaxRule> rules, TaxLineItemRequest item):
  1. Filter by orderType:
     - DINE_IN  → keep rules where appliesToDineIn  = true
     - TAKEAWAY → keep rules where appliesToTakeaway = true
     - DELIVERY → treat same as TAKEAWAY

  2. Filter by temperature (if item.temperature != null):
     - HOT  → keep rules where appliesToHot  = true  OR appliesToHot  IS NULL
     - COLD → keep rules where appliesToCold = true  OR appliesToCold IS NULL
     Rules where both appliesToHot=false AND appliesToCold=true are excluded for HOT items.

  3. Filter by itemCategory:
     - Keep rules where itemCategory = item.itemCategory
     - OR itemCategory IS NULL (wildcard)
     If item.itemCategory = ALCOHOL: additionally require appliesToAlcohol = true

  4. Filter by priceThreshold:
     - If priceThresholdMax != null: keep only if item.unitPrice <= priceThresholdMax
     - If priceThresholdMin != null: keep only if item.unitPrice > priceThresholdMin

  5. Specificity scoring — select the highest scoring remaining rule:
     +10 pts  if itemCategory matches exactly (not wildcard)
     +5  pts  if appliesToHot or appliesToCold is explicitly set (not null)
     +3  pts  if orderType condition is explicitly set (not both true)
     Ties broken by lowest sortOrder.

  6. If no rule matches:
     - Log a warning with item details
     - Throw ItemTagMissingException if required fields are absent
     - Fall back to the country's first active rule (defensive default)
```

#### 3.4.2 Calculation method

```
calculate(TaxRule rule, BigDecimal overrideRate, BigDecimal baseAmount, boolean taxIncluded):

  effectiveRate = (overrideRate != null) ? overrideRate : rule.getDefaultRate()

  IF taxIncluded:
    // Tax is already embedded in the price (UK, AU, ZA)
    netAmount  = baseAmount.divide(ONE.add(effectiveRate), 2, HALF_UP)
    taxAmount  = baseAmount.subtract(netAmount)
    total      = baseAmount

  ELSE:
    // Tax added on top (USA, IN, CA, KE, NG, EG, GH, AE, SA)
    taxAmount  = baseAmount.multiply(effectiveRate).setScale(2, HALF_UP)
    total      = baseAmount.add(taxAmount)
```

#### 3.4.3 Cascading levy calculation

```
FOR each cascading rule in the rule set (is_cascading = true):
  parentRule   = rules.findById(cascade_on_rule_id)
  parentTax    = already calculated taxAmount for parentRule
  cascadeTax   = (baseAmount + parentTax) * cascadeRate   // applied on inclusive base
  Add cascadeTax to the line item's tax total
  Add a separate entry in taxBreakdown
```

#### 3.4.4 Saudi Arabia alcohol guard

```java
if ("SA".equals(countryIsoCode) && "ALCOHOL".equals(item.getItemCategory())) {
    throw new AlcoholProhibitedException(
        "Alcohol items are prohibited for Saudi Arabia venues"
    );
}
```

#### 3.4.5 India GST split

When `country.isoCode = "IN"` and the rule is GST type, split the calculated tax as:
```
cgst = taxAmount / 2  (rounded to 2dp)
sgst = taxAmount - cgst
```
Include both in `TaxLineItemResult.gstSplit { cgst, sgst }`. The frontend will display both.

#### 3.4.6 Service charge processing

After all line items are processed:
```
IF serviceChargeType = MANDATORY:
  Fetch rule with itemCategory = null and rule_code containing 'SERVICE_CHARGE' for the country
  Apply tax to serviceChargeAmount using that rule
  Add as a separate entry in the response (not a line item, but in summary.serviceChargeTax)
```

### 3.5 Controller implementation

**Base mapping:** `@RequestMapping("/api/v1/taxes")`  
**Security:** Use `@PreAuthorize` with the exact role annotation pattern found in your audit (e.g. `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`).

Implement all 12 endpoints exactly as specified in the PRD Section 6. Key rules:

- Return `ResponseEntity<?>` for all endpoints.
- Use `@Valid` on all `@RequestBody` params.
- Capture client IP via `HttpServletRequest.getRemoteAddr()` and pass to the audit service.
- All paginated responses use Spring's `Page<T>` wrapped in `PageResponse<T>`.
- `400 BAD_REQUEST` for validation failures → handled by global `@ControllerAdvice`.
- `422 UNPROCESSABLE_ENTITY` for business rule violations (rate out of bounds, alcohol prohibited).
- `409 CONFLICT` for venue-country-not-set when `/calculate` is called.

### 3.6 Caching

```java
@Cacheable(value = "taxRules", key = "#isoCode")
public List<TaxRule> getRulesForCountry(String isoCode) { ... }

@CacheEvict(value = "taxRules", allEntries = true)
public void saveOverride(...) { ... }

@CacheEvict(value = "taxRules", allEntries = true)
public void assignCountry(...) { ... }
```

Use Caffeine with TTL 10 minutes. Add to `application.yml`:
```yaml
spring:
  cache:
    caffeine:
      spec: maximumSize=500,expireAfterWrite=600s
```

### 3.7 Global exception handler additions

Add to the existing `@ControllerAdvice`:

```java
@ExceptionHandler(RateOutOfBoundsException.class)
ResponseEntity<ErrorResponse> handleRateOutOfBounds(RateOutOfBoundsException ex) {
    return ResponseEntity.unprocessableEntity().body(
        ErrorResponse.of("RATE_OUT_OF_BOUNDS", ex.getMessage(),
            Map.of("minAllowed", ex.getMinAllowed(), "maxAllowed", ex.getMaxAllowed()))
    );
}

@ExceptionHandler(AlcoholProhibitedException.class)
ResponseEntity<ErrorResponse> handleAlcoholProhibited(AlcoholProhibitedException ex) {
    return ResponseEntity.unprocessableEntity().body(
        ErrorResponse.of("ALCOHOL_PROHIBITED", ex.getMessage())
    );
}

@ExceptionHandler(VenueCountryNotSetException.class)
ResponseEntity<ErrorResponse> handleVenueCountryNotSet(VenueCountryNotSetException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(
        ErrorResponse.of("VENUE_COUNTRY_NOT_SET", ex.getMessage())
    );
}
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 CRITICAL: Read your audit results before writing any component

Do not use hardcoded Tailwind classes or component names before checking Section 1 audit results. Every component you write must:

- Use the **same colour palette tokens** as the rest of the app (e.g. if the app uses `bg-zinc-900` for dark cards, use the same — do not introduce `bg-slate-900`).
- Use the **same UI primitive components** (e.g. if the app uses `<Button variant="outline">`, use that — do not use a raw `<button>`).
- Use the **same form library** (react-hook-form + zod, or formik + yup — whatever the audit found).
- Use the **same data-fetching pattern** (React Query hooks, Axios service functions, or SWR — whatever the audit found).
- Use the **same toast function** for success/error notifications.
- Match the **same page-level layout structure** as other admin pages (same header height, same padding, same sidebar behaviour).

### 4.2 Feature directory structure

```
src/features/taxes/
├── api/
│   ├── taxData.ts          # TypeScript types mirroring all DTOs
│   └── taxService.ts       # All API call functions
├── components/
│   ├── TaxRulesPanel.tsx
│   ├── TaxRuleEditor.tsx
│   ├── BillSimulator.tsx
│   ├── BillSimulatorItemForm.tsx
│   ├── BillPreview.tsx
│   ├── TaxAuditLogDrawer.tsx
│   └── ItemTaxTagger.tsx
├── hooks/
│   ├── useTaxRules.ts
│   ├── useTaxCalculation.ts
│   ├── useVenueCountry.ts
│   └── useAuditLog.ts
└── pages/
    └── TaxesDashboardPage.tsx
```

### 4.3 TypeScript types (`api/taxData.ts`)

Define exact TypeScript interfaces matching every field in the API responses. Key types:

```typescript
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type Temperature = 'HOT' | 'COLD';
export type ItemCategory = 'FOOD' | 'BEVERAGE' | 'ALCOHOL' | 'TOBACCO';
export type ServiceChargeType = 'NONE' | 'MANDATORY' | 'DISCRETIONARY';
export type TaxType = 'VAT' | 'GST' | 'SALES_TAX' | 'STATE_EXCISE' | 'EXCISE' | 'LEVY' | 'SERVICE_CHARGE';

export interface Country {
  id: number;
  isoCode: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  taxModel: 'VAT_INCLUSIVE' | 'TAX_EXCLUSIVE' | 'GST';
  taxIncluded: boolean;
}

export interface TaxRule {
  id: number;
  ruleCode: string;
  ruleName: string;
  taxType: TaxType;
  defaultRate: number;
  minAllowedRate: number;
  maxAllowedRate: number;
  appliesToDineIn: boolean;
  appliesToTakeaway: boolean;
  appliesToHot: boolean | null;
  appliesToCold: boolean | null;
  appliesToAlcohol: boolean;
  itemCategory: ItemCategory | null;
  isCascading: boolean;
  description: string;
  // Resolved at runtime per-venue:
  activeRate?: number;          // override rate if set, else defaultRate
  isOverridden?: boolean;
}

export interface TaxLineItemRequest {
  lineItemId: string;
  menuItemId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  orderType: OrderType;
  temperature: Temperature | null;
  itemCategory: ItemCategory;
}

export interface TaxCalculationRequest {
  venueId: number;
  items: TaxLineItemRequest[];
  serviceChargeAmount: number;
  serviceChargeType: ServiceChargeType;
}

export interface GstSplit {
  cgst: number;
  sgst: number;
}

export interface TaxLineItemResult {
  lineItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  baseAmount: number;
  appliedRuleCode: string;
  appliedRuleName: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  gstSplit?: GstSplit;
  orderType: OrderType;
  temperature: Temperature | null;
}

export interface TaxBreakdownEntry {
  ruleCode: string;
  ruleName: string;
  rate: number;
  taxableBase: number;
  taxAmount: number;
}

export interface TaxSummary {
  subtotalBeforeTax: number;
  totalTaxAmount: number;
  grandTotal: number;
  taxBreakdown: TaxBreakdownEntry[];
  serviceChargeTax?: number;
}

export interface TaxCalculationResponse {
  venueId: number;
  countryIsoCode: string;
  taxModel: string;
  currencySymbol: string;
  lineItems: TaxLineItemResult[];
  summary: TaxSummary;
}

export interface AuditLogEntry {
  id: number;
  action: string;
  taxRuleCode: string;
  oldRate: number | null;
  newRate: number | null;
  changedBy: string;
  changedAt: string;
  changeReason: string | null;
}
```

### 4.4 API service (`api/taxService.ts`)

Implement using the HTTP client found in your audit. Functions required:

```typescript
fetchCountries(): Promise<Country[]>
fetchCountryRules(isoCode: string): Promise<{ country: Country; rules: TaxRule[] }>
fetchVenueCountry(venueId: number): Promise<VenueCountryResponse>
assignCountry(venueId: number, isoCode: string, reason: string): Promise<void>
setOverride(venueId: number, taxRuleId: number, rate: number, reason: string): Promise<void>
removeOverride(venueId: number, taxRuleId: number): Promise<void>
calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse>
fetchAuditLog(venueId: number, page: number, size: number): Promise<PagedResponse<AuditLogEntry>>
getItemTaxTag(menuItemId: number): Promise<ItemTaxTag>
setItemTaxTag(menuItemId: number, tag: ItemTaxTagRequest): Promise<void>
```

### 4.5 Route registration in `App.tsx`

Locate the existing lazy-loaded route definitions. Add:

```tsx
const TaxesDashboardPage = lazy(() => import('@/features/taxes/pages/TaxesDashboardPage'));

// Inside the route tree, within the admin-protected route group:
<Route
  path="/taxes"
  element={
    <RequireAuth roles={ADMIN_ROLES}>   {/* use exact component/constant names from your audit */}
      <Suspense fallback={<PageLoader />}>
        <TaxesDashboardPage />
      </Suspense>
    </RequireAuth>
  }
/>
```

### 4.6 Dashboard card in `DashboardPage.tsx`

Locate the `NAV_CARDS` array. Append (do not prepend — match existing ordering logic):

```tsx
{
  title: 'Taxes & Compliance',
  description: 'Configure country tax rules, rates and simulate bills',
  href: '/taxes',
  icon: Receipt,       // from 'lucide-react'
  roles: ADMIN_ROLES,  // exact constant from codebase
}
```

Import `Receipt` from `lucide-react` (already installed). If the app uses a different icon pattern, follow that.

### 4.7 `TaxesDashboardPage.tsx` — layout specification

Use the **exact same page shell** as other admin pages. Typical structure:

```tsx
<PageShell title="Taxes & Compliance" breadcrumb={['Dashboard', 'Taxes']}>
  {/* Header row */}
  <div className="flex items-center justify-between mb-6">
    <CountrySelector ... />
    <Button variant="outline" onClick={() => setAuditOpen(true)}>
      <Clock className="w-4 h-4 mr-2" /> Audit Log
    </Button>
  </div>

  {/* Two-column layout on desktop, stacked on mobile */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    <TaxRulesPanel ... />
    <BillSimulator ... />
  </div>

  <TaxAuditLogDrawer open={auditOpen} onClose={() => setAuditOpen(false)} ... />
</PageShell>
```

**State managed in this page:**
- `activeCountry: Country | null`
- `rules: TaxRule[]`
- `overrides: Record<number, number>` (ruleId → overrideRate)
- `auditOpen: boolean`
- `editorState: { open: boolean; rule: TaxRule | null }`

### 4.8 `TaxRulesPanel.tsx` — component specification

Renders the rules table. Key requirements:

- Use the existing `<Table>` / data-grid primitive from the UI library.
- **"Applies To" column:** Render small icon-chips (not text). Use Lucide icons:
  - Dine-In: `UtensilsCrossed` 
  - Takeaway: `ShoppingBag`
  - Hot: `Flame`
  - Cold: `Snowflake`
  - Alcohol: `Wine`
  - A chip is filled/active colour if the flag is `true`, muted/grey if `false` or `null`.
- **"Active Rate" column:** If overridden, show the override rate in the primary brand colour with a small `Pencil` icon. Default rate shown in muted colour.
- **"Overridden" badge:** Use the same `<Badge>` variant used elsewhere in the app for warnings (typically amber/yellow).
- **[Edit] button:** Opens `TaxRuleEditor`. Use `variant="ghost"` or equivalent for a non-intrusive button.
- **[Reset to Default] button:** Only visible on overridden rows. Calls `removeOverride` then invalidates cache. Confirm with an inline popconfirm or the existing confirm dialog pattern.
- Rows are sorted by `sortOrder` ascending (API already returns this).

### 4.9 `TaxRuleEditor.tsx` — component specification

A modal or sheet (use whatever the existing codebase uses for editing dialogs — `Dialog` or `Sheet`).

**Input field — Override Rate:**
- Number input with step `0.001` (3 decimal places minimum).
- Display as percentage: show `20.00%` for rate `0.20`.
- Clamp via `min={rule.minAllowedRate * 100}` and `max={rule.maxAllowedRate * 100}` on the input.
- If `minAllowedRate === maxAllowedRate`, render as read-only `<Input disabled>` with tooltip: `"This rate is fixed by law and cannot be modified."`.
- Show a thin progress-bar or range slider below the input showing the position of the current value between min and max. Use the primary brand colour for fill.

**Override Reason field:**
- `<Textarea>` — required when rate differs from default.
- Min 10 characters.
- Disabled when rate input is fixed.

**Footer buttons:**
- `[Cancel]` — closes without saving.
- `[Save Override]` — disabled if form invalid. On click: calls `setOverride`, shows toast on success, closes modal.

**Error display:**
- If API returns `RATE_OUT_OF_BOUNDS`, show an inline `<Alert variant="destructive">` inside the modal with the server message and the min/max bounds.

### 4.10 `BillSimulator.tsx` — component specification

Split into a left builder panel and a right live preview panel.

**Left Panel — Order Builder:**

- `[+ Add Item]` button opens `BillSimulatorItemForm` as an inline form row or a small dialog.
- Item list renders as cards (not a table) with:
  - Description + unit price + qty
  - Order type toggle (three-way: Dine-In / Takeaway / Delivery) — use a `<ToggleGroup>` or segmented control
  - Temperature toggle (three-way: Hot / Cold / N/A) — same component
  - Category select (Food / Beverage / Alcohol / Tobacco)
  - `[×]` delete button (top-right of card)
- Service Charge section (below item list):
  - Type toggle: None / Mandatory / Discretionary
  - Amount input — visible only when type ≠ None
  - Show a note about tax treatment when type = Mandatory (e.g. "Mandatory service charges are taxable in this jurisdiction")

**Debounce:** Call `calculateTax` with 400ms debounce on any change. Show a small spinner in the right panel header during recalculation.

**Right Panel — Bill Preview (`BillPreview.tsx`):**

Render with the look of an actual POS receipt (monospaced or receipt-like font is optional but adds realism — check if other receipt views exist in the codebase and match them).

Structure:
```
[ Country flag emoji ] [ Country name ]          [ Tax Model badge ]

LINE ITEMS
──────────────────────────────────────────────
Item name               (Dine-In · Hot)
  Base: £16.67   ×1   →   Rule: UK_VAT_STANDARD
  Tax (20%): £3.33         Total: £20.00
  ❶ Info: "Dine-in items always attract 20%"

Item name               (Takeaway · Cold)
  Base: £5.50    ×1   →   Rule: UK_VAT_ZERO
  Tax (0%): £0.00          Total: £5.50
  ⚡ Info: "Cold takeaway is zero-rated"
──────────────────────────────────────────────
TAX BREAKDOWN
  UK VAT Standard (20%)   Base: £20.00   Tax: £4.00
  UK VAT Zero (0%)        Base: £5.50    Tax: £0.00
──────────────────────────────────────────────
  Subtotal (ex. tax):         £25.50
  Total Tax:                   £4.00
  GRAND TOTAL:                £29.50
──────────────────────────────────────────────
[ Copy JSON ]   [ Reset Simulator ]
```

**Rule info tooltip logic:**
- `UK_VAT_ZERO` on a cold takeaway → show "Cold takeaway is zero-rated"
- `UK_VAT_STANDARD` on a hot takeaway → show "Hot items are always taxed regardless of order type"
- `USOH_EXEMPT_TAKEAWAY` → show "Ohio exempts all takeaway food from sales tax"
- `IN_STATE_EXCISE_ALCO` → show "Alcohol is outside GST scope in India — State Excise applies"
- For cascading rules → show "This levy is applied in addition to the primary tax"
- Display next to the rule name as an `<Info>` Lucide icon with a `<Tooltip>`.

**India-specific:** When `country.isoCode = 'IN'`, split the GST line into two rows:
```
  CGST (9%): ₹45.00
  SGST (9%): ₹45.00
```

**Empty state:** When no items are added, show a centred empty state with `Receipt` icon and text "Add items to the left to see your bill breakdown."

**Error state:** If API returns `ALCOHOL_PROHIBITED`, show a prominent `<Alert variant="destructive">` above the bill: "Alcohol items are not permitted in this jurisdiction."

### 4.11 `TaxAuditLogDrawer.tsx` — component specification

Use the existing `<Sheet>` or `<Drawer>` component for the side panel.

- Paginated table (page size 20). Use the same pagination control as other list views.
- Columns: Timestamp (formatted with locale date-time) · Action badge · Rule Code · Old Rate → New Rate · Changed By · Reason.
- Action badge colours:
  - `OVERRIDE_SET` → amber/yellow
  - `OVERRIDE_REMOVED` → blue
  - `COUNTRY_CHANGED` → purple
  - `COUNTRY_ASSIGNED` → green
- Date range filter: two date inputs (from/to). Clears on "Reset".
- `[Export CSV]` button: generates a CSV from the current filtered result set client-side using array-to-CSV and triggers a download. Filename: `tax-audit-{venueId}-{date}.csv`.

### 4.12 `ItemTaxTagger.tsx` — component specification

Rendered as a new tab within the existing **Menu Item edit drawer** (not a standalone page). The tab is labelled "Tax".

Fields:
- **Temperature** — `<Select>` with options: Hot / Cold / Not Applicable
- **Item Category** — `<Select>` with options: Food / Beverage / Alcohol / Tobacco
- **Is Basic Staple** — `<Checkbox>` with label "Zero-rated basic staple (unprocessed food)" and helper text "Check for unprocessed items like raw vegetables, milk, and basic bread."

On save: call `setItemTaxTag`. Show success toast. The tab auto-loads existing tag data on mount via `getItemTaxTag`.

---

## 5. TESTS

### 5.1 Backend unit tests (`TaxEngineTest.java`)

Create in `src/test/java/{rootPackage}/tax/engine/TaxEngineTest.java`.

Use `@ExtendWith(MockitoExtension.class)`. Mock all repository calls. Test all 20 scenarios from the PRD:

```java
// Template for each test:
@Test
@DisplayName("TE-001: UK hot dine-in food → UK_VAT_STANDARD 20%")
void ukHotDineInFood_shouldApplyStandardVat() {
    // ARRANGE — build a TaxLineItemRequest for hot dine-in food
    // ACT    — call taxEngine.resolveAndCalculate(rules, item, false)
    // ASSERT — assertEquals("UK_VAT_STANDARD", result.getAppliedRuleCode())
    //          assertEquals(new BigDecimal("0.2000"), result.getTaxRate())
    //          assertEquals(new BigDecimal("3.33"),   result.getTaxAmount())  // on £16.67 base
}
```

Write all 20 tests. All must pass. Key edge cases to validate:
- TE-010: `AlcoholProhibitedException` thrown for Saudi Arabia alcohol item.
- TE-014/015: `RateOutOfBoundsException` thrown when override outside bounds.
- TE-016/017: Tax-inclusive vs tax-exclusive produces correct net/gross split.
- TE-019: India GST splits into exactly equal CGST and SGST.
- TE-020: Egypt SC rule correctly cascades VAT on top of service charge amount.

### 5.2 Backend integration tests (`TaxControllerIntegrationTest.java`)

Use `@SpringBootTest(webEnvironment = RANDOM_PORT)` + `@AutoConfigureMockMvc`.  
Use `TestRestTemplate` or `MockMvc`.

Required test cases:

```
IT-01: POST /calculate with UK mixed order → 200, correct line items
IT-02: POST /calculate with no venue country set → 409
IT-03: PUT /overrides/{ruleId} with rate within bounds → 200 + audit log created
IT-04: PUT /overrides/{ruleId} with rate below min → 422, RATE_OUT_OF_BOUNDS
IT-05: PUT /overrides/{ruleId} with rate above max → 422, RATE_OUT_OF_BOUNDS
IT-06: POST /calculate Saudi Arabia + alcohol item → 422, ALCOHOL_PROHIBITED
IT-07: PUT /active-country changes country → audit log entry with COUNTRY_CHANGED
IT-08: DELETE /overrides/{ruleId} → 204 + audit log OVERRIDE_REMOVED
IT-09: GET /audit-logs → paginated results with correct structure
IT-10: POST /calculate Ontario item < $4 → CA_GST_ONLY applied (5%)
IT-11: POST /calculate Ontario item >= $4 → CA_HST_ON applied (13%)
IT-12: POST /calculate India food → CGST + SGST split in response
IT-13: GET /countries → 14 countries returned (matches seed)
IT-14: GET /countries/{iso}/rules → UK returns 5 rules
IT-15: Unauthenticated request to any endpoint → 401
IT-16: Cashier role request to PUT /overrides → 403
```

### 5.3 Frontend tests

Create in `src/features/taxes/__tests__/`.

Using Vitest + React Testing Library (or whatever test framework is in use):

```
FE-01: TaxRulesPanel renders correct number of rule rows for UK (5 rows)
FE-02: TaxRulesPanel shows "Overridden" badge on rows with active override
FE-03: TaxRuleEditor — input disabled when minRate === maxRate
FE-04: TaxRuleEditor — shows error when rate below min is entered and form submitted
FE-05: TaxRuleEditor — shows error when rate above max is entered
FE-06: BillSimulator — adding a hot takeaway item (UK) shows 20% rate in preview
FE-07: BillSimulator — adding a cold takeaway item (UK) shows 0% rate in preview
FE-08: BillSimulator — empty state shown when no items
FE-09: BillSimulator — ALCOHOL_PROHIBITED error shown for SA venue + alcohol item
FE-10: TaxAuditLogDrawer — renders audit entries with correct action badge colours
FE-11: BillSimulator India — shows CGST and SGST as separate lines
FE-12: TaxesDashboardPage — "Taxes & Compliance" card visible on dashboard for admin
FE-13: TaxesDashboardPage — card NOT visible for cashier role
FE-14: CountrySelector — changing country shows confirmation dialog
FE-15: ItemTaxTagger — saves tax tag and shows success toast
```

### 5.4 Running all tests

```bash
# Backend
./mvnw test -pl backend -Dtest="TaxEngineTest,TaxControllerIntegrationTest"

# Frontend
npx vitest run src/features/taxes

# All tests (CI command)
./mvnw verify && npx vitest run
```

All tests must pass before marking any phase complete.

---

## 6. SELF-CHECK VERIFICATION MATRIX

Before submitting for review, run through every item. Mark ✅ or ❌.

### 6.1 Database

| # | Check | How to verify |
|---|-------|--------------|
| DB-01 | All 7 tables exist | `\dt` in psql |
| DB-02 | 14 countries seeded | `SELECT COUNT(*) FROM countries;` → 14 |
| DB-03 | ≥40 tax rules seeded | `SELECT COUNT(*) FROM tax_rules;` → ≥40 |
| DB-04 | KE_CTL_LEVY has `cascade_on_rule_id` set | `SELECT cascade_on_rule_id FROM tax_rules WHERE rule_code='KE_CTL_LEVY';` not null |
| DB-05 | EG_VAT_ON_SC has `cascade_on_rule_id` set | Same check for `EG_VAT_ON_SC` |
| DB-06 | All CHECK constraints in place | `\d tax_rules` in psql |
| DB-07 | All indexes present | `\di` in psql |

### 6.2 Backend API

| # | Check | How to verify |
|---|-------|--------------|
| BE-01 | `GET /api/v1/taxes/countries` returns 14 countries | curl + jq |
| BE-02 | `GET /api/v1/taxes/countries/GB/rules` returns 5 rules | curl |
| BE-03 | `POST /calculate` UK mixed order returns correct line items | See Sample 1 in PRD |
| BE-04 | `POST /calculate` returns 409 when venue has no country | curl without assignment |
| BE-05 | `PUT /overrides` with bad rate returns 422 with bounds | curl |
| BE-06 | SA alcohol item returns 422 ALCOHOL_PROHIBITED | curl |
| BE-07 | Every override write creates audit log row | `SELECT COUNT(*) FROM tax_audit_logs;` |
| BE-08 | Tax-inclusive countries extract tax correctly | UK: base 20 → tax = 3.33, total = 20 |
| BE-09 | India response includes `gstSplit.cgst` and `gstSplit.sgst` | curl |
| BE-10 | Ontario $4 rule — item $3.50 → 5%, item $12 → 13% | curl with two items |
| BE-11 | Cache is invalidated after override save | Call `GET rules`, set override, call `GET rules` — rate updated |
| BE-12 | Audit log IP address recorded | `SELECT ip_address FROM tax_audit_logs LIMIT 1;` |
| BE-13 | Unauthenticated → 401 | curl without token |
| BE-14 | Cashier role on write endpoint → 403 | curl with cashier JWT |

### 6.3 Frontend UI

| # | Check | How to verify |
|---|-------|--------------|
| FE-01 | "Taxes & Compliance" card visible on dashboard | Load app as ADMIN |
| FE-02 | Card NOT visible as CASHIER | Load app as CASHIER |
| FE-03 | `/taxes` route loads without error | Navigate in browser |
| FE-04 | Country selector loads all 14 countries | Open dropdown |
| FE-05 | Selecting UK shows 5 rules in the table | Select UK |
| FE-06 | Fixed-rate rules (UK VAT 20%) show disabled editor input | Click Edit on UK_VAT_STANDARD |
| FE-07 | "Overridden" badge appears after saving override | Save an override, check row |
| FE-08 | BillSimulator empty state shown on first load | Open simulator |
| FE-09 | Add hot dine-in + cold takeaway (UK) → different rates | Build order in simulator |
| FE-10 | India GST shows CGST + SGST split in preview | Set venue to India, add food item |
| FE-11 | SA + alcohol item → clear error in preview | Set venue to SA, add alcohol item |
| FE-12 | Audit drawer opens on [Audit Log] button | Click button |
| FE-13 | Audit drawer shows correct badge colours | Review entries |
| FE-14 | [Export CSV] downloads a file | Click export |
| FE-15 | ItemTaxTagger tab appears in menu item editor | Open any menu item |
| FE-16 | Page is responsive on mobile (375px) | DevTools responsive mode |
| FE-17 | All interactive elements have aria-labels | Run axe accessibility check |
| FE-18 | Theme matches existing pages exactly | Side-by-side comparison with Dashboard |
| FE-19 | Toast appears on override save success | Save an override |
| FE-20 | Confirmation dialog appears when changing country | Change country selector |

### 6.4 Tests

| # | Check | Pass criteria |
|---|-------|--------------|
| TS-01 | All 20 TaxEngine unit tests pass | `mvnw test` → BUILD SUCCESS |
| TS-02 | All 16 integration tests pass | `mvnw verify` → BUILD SUCCESS |
| TS-03 | All 15 frontend tests pass | `vitest run` → all green |
| TS-04 | No skipped or pending tests | No `@Disabled`, no `test.skip` |

---

## 7. THEME ADHERENCE QUICK REFERENCE

This section summarises the most common theme decisions to get right. **Fill in the blanks from your Section 1 audit before proceeding.**

```
Primary brand colour:      [fill from audit] — use for active rates, primary CTAs
Neutral/muted colour:      [fill from audit] — use for default rates, disabled states
Warning/amber colour:      [fill from audit] — use for "Overridden" badges
Destructive colour:        [fill from audit] — use for errors, alcohol-prohibited alerts
Success colour:            [fill from audit] — use for zero-rated badge, success toasts

UI primitive - Button:     [fill from audit] e.g. <Button variant="outline">
UI primitive - Badge:      [fill from audit] e.g. <Badge variant="secondary">
UI primitive - Dialog:     [fill from audit] e.g. <Dialog> or <Modal>
UI primitive - Sheet:      [fill from audit] e.g. <Sheet side="right">
UI primitive - Table:      [fill from audit] e.g. <DataTable columns={} data={}>
UI primitive - Input:      [fill from audit] e.g. <Input type="number">
UI primitive - Select:     [fill from audit] e.g. <Select><SelectItem>
UI primitive - Toast:      [fill from audit] e.g. toast.success('...')

Page shell component:      [fill from audit] e.g. <PageShell title="">
Breadcrumb component:      [fill from audit] e.g. <Breadcrumb items={[]}>
Loading skeleton:          [fill from audit] e.g. <Skeleton className="h-4 w-full">
Empty state component:     [fill from audit] or build a consistent inline empty state
```

**Rule:** If a visual element you are building does not map to one of the above primitives, check two more existing pages before creating a new pattern. Consistency is mandatory.

---

## 8. KNOWN EDGE CASES & IMPLEMENTATION NOTES

| # | Edge Case | Required Behaviour |
|---|-----------|-------------------|
| EC-01 | Venue has no country assigned | `POST /calculate` → 409. Frontend shows an inline warning on the dashboard: "No tax jurisdiction configured for this venue. Select a country to continue." |
| EC-02 | Menu item has no tax tag | Engine uses the country's lowest sort_order wildcard rule as fallback. Logs a warning. Frontend shows a yellow "Untagged" chip on BillSimulator items. |
| EC-03 | CA 80/80 Rule active for venue | When `venue.eightyEightyRuleActive = true`, `USCA_SALES_TAX_COLD_EX` is NOT returned by rule resolver — cold takeaway becomes taxable. Store this flag on the venue config table. |
| EC-04 | Kenya CTL not applicable | When `venue.ctlApplicable = false`, filter out `KE_CTL_LEVY` during rule resolution. |
| EC-05 | Nigeria venue outside Lagos | When `venue.state != 'LAGOS'`, filter out `NG_LAGOS_CONSUMPTION` during rule resolution. |
| EC-06 | Override set to same as default | Accept silently. Show no "Overridden" badge if override === default. |
| EC-07 | Ghana cascading compounding | All 5 Ghana levies apply to the base price independently (not compounding on each other). The ~21.9% effective rate is the additive sum. |
| EC-08 | Egypt SC as taxable revenue | The service charge amount (12%) is first added to the bill. Then 14% VAT is applied to the service charge amount, not to the food subtotal. Two separate line entries in the breakdown. |
| EC-09 | India luxury flag | The venue must have a boolean field `luxuryHotelGst` (add to venue config or a new `venue_tax_flags` column). When `true`, `IN_GST_5` is hidden and `IN_GST_18` is used. |
| EC-10 | Mixed India order with alcohol | Food items → GST at 5% or 18%. Alcohol items on the same ticket → `IN_STATE_EXCISE_ALCO`. Both appear in the tax breakdown with different rule codes. |

---

## 9. DEPLOYMENT CHECKLIST

Before deploying to staging:

- [ ] Flyway migrations run successfully on the staging database.
- [ ] `SELECT COUNT(*) FROM tax_rules;` returns ≥ 40 on staging.
- [ ] Application starts without `BeanCreationException` (Spring cache config valid).
- [ ] At least one venue has a country assigned via `PUT /api/v1/taxes/venues/{id}/active-country`.
- [ ] A test order processed through `POST /calculate` returns a valid breakdown.
- [ ] All Flyway migration checksums match (no manual edits to migration files after run).
- [ ] `tax.audit.retention-years` property set in staging `application.yml`.
- [ ] Role constants used in `@PreAuthorize` match exactly what the JWT issuer emits.
- [ ] Frontend build (`npm run build`) completes with 0 TypeScript errors.
- [ ] No `console.error` calls in the browser console on page load.