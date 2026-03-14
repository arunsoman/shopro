# Shopro POS — Taxes & Compliance Module
## Product Requirements Document (PRD)

**Version:** 1.0.0  
**Date:** 2025  
**Status:** Draft — Awaiting Engineering Review  
**Authors:** Product & Engineering Team  
**Stack:** React (Frontend) · Spring Boot (Backend) · PostgreSQL (Database)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [User Personas & Roles](#3-user-personas--roles)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Database Schema](#5-database-schema)
6. [Backend API Specification](#6-backend-api-specification)
7. [Tax Engine Logic](#7-tax-engine-logic)
8. [Frontend Feature Specification](#8-frontend-feature-specification)
9. [Global Tax Rule Catalogue](#9-global-tax-rule-catalogue)
10. [Complex Order Billing Samples](#10-complex-order-billing-samples)
11. [Validation & Error Handling](#11-validation--error-handling)
12. [Testing Requirements](#12-testing-requirements)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Implementation Phases & Timeline](#14-implementation-phases--timeline)
15. [Appendix — Field Glossary](#15-appendix--field-glossary)

---

## 1. Executive Summary

Shopro POS currently applies a single, static tax rate across all order items. This approach is inadequate for restaurant operators with multi-country deployments or for those operating under jurisdictions with complex, context-sensitive tax regimes (e.g., UK VAT temperature rules, Ohio's dine-in vs. takeaway distinction, India's GST AC/Non-AC model).

The **Taxes & Compliance Module** is a new, first-class feature area within Shopro POS that enables:

- **Administrators** to configure the active country/jurisdiction and inspect the full tax ruleset in effect.
- The **POS engine** to automatically resolve the correct tax rate for each line item on a ticket, based on item temperature, order type, item price, and category.
- **Bill generation** that correctly handles mixed tickets (same ticket containing dine-in and takeaway items, hot and cold food, alcohol vs. non-alcohol).
- A **Tax Rule Editor** that allows overriding default rates within legally defined minimum and maximum bounds.

This document is the authoritative specification for all engineering work on this module.

---

## 2. Goals & Non-Goals

### 2.1 Goals

| # | Goal |
|---|------|
| G1 | Support all 13 jurisdictions listed in the 2025 Country-wise Restaurant Tax Report. |
| G2 | Automatically apply correct tax rates per line item on every ticket based on order context. |
| G3 | Handle mixed-type tickets (dine-in + takeaway, hot + cold, alcohol + non-alcohol) in a single bill. |
| G4 | Allow administrators to override default rates within legal bounds via a guided UI. |
| G5 | Store a full audit trail of every tax rate change made by an administrator. |
| G6 | Expose a clean REST API so the mobile POS client and third-party integrations can consume tax rules. |
| G7 | Generate itemised tax breakdowns on printed and digital receipts. |

### 2.2 Non-Goals

| # | Non-Goal |
|---|----------|
| N1 | Filing or submitting tax returns on behalf of the operator. |
| N2 | Real-time sync with government tax authority APIs. |
| N3 | Supporting payroll or employment-related taxes. |
| N4 | Custom tax rules for jurisdictions not in the initial catalogue. |
| N5 | Currency conversion for multi-currency billing. |

---

## 3. User Personas & Roles

### 3.1 Super Admin
- Full access to all tax configuration across all venues.
- Can add/remove country assignments per venue.
- Can view and export audit logs.

### 3.2 Venue Admin / Owner
- Can view and override default tax rates for their venue within legal bounds.
- Can run the tax simulation sandbox.
- Cannot modify audit logs.

### 3.3 Cashier / POS Operator
- Read-only view of the active tax rules applied to a ticket.
- No configuration access.

### 3.4 Kitchen / Bar Staff
- No access to the Taxes module.

---

## 4. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ TaxDashboard   │  │  TaxRuleEditor   │  │ BillSim     │  │
│  │ Page           │  │  Component       │  │ Sandbox     │  │
│  └────────────────┘  └──────────────────┘  └─────────────┘  │
└──────────────────────────────────┬───────────────────────────┘
                                   │ REST/JSON
┌──────────────────────────────────▼───────────────────────────┐
│                    Spring Boot Backend                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ TaxController   │  │  TaxEngine       │  │ AuditLog   │  │
│  │ (REST Layer)    │  │  (Core Logic)    │  │ Service    │  │
│  └─────────────────┘  └──────────────────┘  └────────────┘  │
│  ┌─────────────────┐  ┌──────────────────┐                   │
│  │ CountryTaxRepo  │  │ VenueTaxConfig   │                   │
│  │ (JPA)           │  │ Repo (JPA)       │                   │
│  └─────────────────┘  └──────────────────┘                   │
└──────────────────────────────────┬───────────────────────────┘
                                   │ JDBC
┌──────────────────────────────────▼───────────────────────────┐
│                       PostgreSQL                              │
│  countries · tax_rules · venue_tax_configs · tax_audit_logs  │
│  tax_calculation_results · item_tax_tags                     │
└──────────────────────────────────────────────────────────────┘
```

### 4.1 Key Design Decisions

- **Seed Data Strategy:** All 13 jurisdictions and their default rules are seeded via a Flyway migration (`V3__seed_tax_rules.sql`). Venue overrides are stored separately.
- **Immutable Defaults:** Country-level default tax rules are never mutated by admin actions — overrides are stored in `venue_tax_configs`. This guarantees a safe fallback.
- **Tax-Inclusive vs. Tax-Exclusive:** The engine supports both models. UK prices are tax-inclusive (VAT already in price); USA prices are tax-exclusive (tax added on top). A `taxIncluded` flag on the country record drives this.
- **Rate Bounds Enforcement:** The `TaxEngine` rejects any override where `rate < minAllowedRate` or `rate > maxAllowedRate`.

---

## 5. Database Schema

### 5.1 `countries`

Stores the master list of supported jurisdictions.

```sql
CREATE TABLE countries (
    id              SERIAL PRIMARY KEY,
    iso_code        CHAR(2)      NOT NULL UNIQUE,  -- e.g. 'GB', 'US', 'IN'
    name            VARCHAR(100) NOT NULL,
    currency_code   CHAR(3)      NOT NULL,          -- e.g. 'GBP', 'USD'
    currency_symbol VARCHAR(5)   NOT NULL,
    tax_model       VARCHAR(30)  NOT NULL,          -- 'VAT_INCLUSIVE', 'TAX_EXCLUSIVE', 'GST'
    tax_included    BOOLEAN      NOT NULL DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 5.2 `tax_rules`

Stores every discrete tax rule for a country. One country can have many rules (e.g., standard rate, zero rate, alcohol excise).

```sql
CREATE TABLE tax_rules (
    id                  SERIAL PRIMARY KEY,
    country_id          INT          NOT NULL REFERENCES countries(id),
    rule_code           VARCHAR(50)  NOT NULL,       -- e.g. 'UK_VAT_STANDARD', 'IN_GST_5'
    rule_name           VARCHAR(150) NOT NULL,       -- Human-readable name
    tax_type            VARCHAR(50)  NOT NULL,       -- 'VAT', 'GST', 'SALES_TAX', 'EXCISE', 'LEVY'
    default_rate        NUMERIC(6,4) NOT NULL,       -- e.g. 0.2000 = 20%
    min_allowed_rate    NUMERIC(6,4) NOT NULL,       -- Legal lower bound
    max_allowed_rate    NUMERIC(6,4) NOT NULL,       -- Legal upper bound
    applies_to_dine_in  BOOLEAN      NOT NULL DEFAULT TRUE,
    applies_to_takeaway BOOLEAN      NOT NULL DEFAULT TRUE,
    applies_to_hot      BOOLEAN,                    -- NULL = not relevant
    applies_to_cold     BOOLEAN,                    -- NULL = not relevant
    applies_to_alcohol  BOOLEAN      NOT NULL DEFAULT FALSE,
    item_category       VARCHAR(50),                -- NULL = applies to all; e.g. 'FOOD', 'BEVERAGE'
    price_threshold_min NUMERIC(12,2),              -- e.g. Ontario $4 rule — items ABOVE this threshold
    price_threshold_max NUMERIC(12,2),              -- e.g. Ontario $4 rule — items BELOW this threshold
    is_cascading        BOOLEAN      NOT NULL DEFAULT FALSE,  -- e.g. Ghana levies
    cascade_on_rule_id  INT          REFERENCES tax_rules(id),  -- Levy is applied on top of which rule
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order          INT          NOT NULL DEFAULT 0,     -- Order of application
    description         TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, rule_code)
);

CREATE INDEX idx_tax_rules_country ON tax_rules(country_id);
CREATE INDEX idx_tax_rules_active ON tax_rules(country_id, is_active);
```

### 5.3 `venue_tax_configs`

Stores per-venue overrides on top of country defaults.

```sql
CREATE TABLE venue_tax_configs (
    id              SERIAL PRIMARY KEY,
    venue_id        INT          NOT NULL,           -- FK to venues table (existing)
    tax_rule_id     INT          NOT NULL REFERENCES tax_rules(id),
    override_rate   NUMERIC(6,4) NOT NULL,
    override_reason TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by      INT          NOT NULL,           -- FK to users table (existing)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (venue_id, tax_rule_id)
);

CREATE INDEX idx_venue_tax_configs_venue ON venue_tax_configs(venue_id);
```

### 5.4 `venue_country_assignments`

Which country/jurisdiction is active for a given venue.

```sql
CREATE TABLE venue_country_assignments (
    id          SERIAL PRIMARY KEY,
    venue_id    INT         NOT NULL UNIQUE,    -- One active country per venue
    country_id  INT         NOT NULL REFERENCES countries(id),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    assigned_by INT         NOT NULL,           -- FK to users
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.5 `item_tax_tags`

Tags menu items with metadata needed by the TaxEngine to resolve the correct rule.

```sql
CREATE TABLE item_tax_tags (
    id              SERIAL PRIMARY KEY,
    menu_item_id    INT         NOT NULL UNIQUE,  -- FK to menu_items (existing)
    temperature     VARCHAR(10),                  -- 'HOT', 'COLD', NULL (not applicable)
    item_category   VARCHAR(50) NOT NULL,         -- 'FOOD', 'BEVERAGE', 'ALCOHOL', 'TOBACCO'
    is_basic_staple BOOLEAN     NOT NULL DEFAULT FALSE,  -- e.g. bread, raw veg
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.6 `tax_audit_logs`

Immutable log of every rate change.

```sql
CREATE TABLE tax_audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    venue_id        INT          NOT NULL,
    tax_rule_id     INT          NOT NULL REFERENCES tax_rules(id),
    action          VARCHAR(20)  NOT NULL,   -- 'OVERRIDE_SET', 'OVERRIDE_REMOVED', 'COUNTRY_CHANGED'
    old_rate        NUMERIC(6,4),
    new_rate        NUMERIC(6,4),
    changed_by      INT          NOT NULL,
    changed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    change_reason   TEXT,
    ip_address      INET
);

CREATE INDEX idx_tax_audit_logs_venue ON tax_audit_logs(venue_id, changed_at DESC);
```

### 5.7 `tax_calculation_results`

Stores the resolved tax breakdown for every completed ticket line item (for reporting).

```sql
CREATE TABLE tax_calculation_results (
    id              BIGSERIAL PRIMARY KEY,
    ticket_id       BIGINT       NOT NULL,     -- FK to tickets (existing)
    ticket_item_id  BIGINT       NOT NULL,     -- FK to ticket_items (existing)
    tax_rule_id     INT          NOT NULL REFERENCES tax_rules(id),
    rule_code       VARCHAR(50)  NOT NULL,     -- Snapshot at time of calculation
    base_amount     NUMERIC(12,2) NOT NULL,
    tax_rate        NUMERIC(6,4)  NOT NULL,
    tax_amount      NUMERIC(12,2) NOT NULL,
    order_type      VARCHAR(20)   NOT NULL,    -- 'DINE_IN', 'TAKEAWAY', 'DELIVERY'
    item_temperature VARCHAR(10),              -- 'HOT', 'COLD'
    calculated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tax_calc_ticket ON tax_calculation_results(ticket_id);
```

---

## 6. Backend API Specification

**Base path:** `/api/v1/taxes`  
**Authentication:** Bearer JWT. All endpoints require `ROLE_ADMIN` minimum unless noted.

---

### 6.1 Country & Rule Endpoints

#### `GET /api/v1/taxes/countries`
Returns the list of all supported countries.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "isoCode": "GB",
    "name": "United Kingdom",
    "currencyCode": "GBP",
    "currencySymbol": "£",
    "taxModel": "VAT_INCLUSIVE",
    "taxIncluded": true
  }
]
```

---

#### `GET /api/v1/taxes/countries/{isoCode}/rules`
Returns all active tax rules for a given country, ordered by `sort_order`.

**Path param:** `isoCode` — e.g. `GB`, `US-CA`, `IN`

**Response `200 OK`:**
```json
{
  "countryIsoCode": "GB",
  "countryName": "United Kingdom",
  "taxModel": "VAT_INCLUSIVE",
  "rules": [
    {
      "id": 12,
      "ruleCode": "UK_VAT_STANDARD",
      "ruleName": "UK VAT Standard Rate",
      "taxType": "VAT",
      "defaultRate": 0.20,
      "minAllowedRate": 0.20,
      "maxAllowedRate": 0.20,
      "appliesToDineIn": true,
      "appliesToTakeaway": true,
      "appliesToHot": true,
      "appliesToCold": false,
      "appliesToAlcohol": false,
      "isCascading": false,
      "description": "Applies to all dine-in food (hot/cold) and hot takeaway items."
    },
    {
      "id": 13,
      "ruleCode": "UK_VAT_ZERO",
      "ruleName": "UK VAT Zero Rate — Cold Takeaway",
      "taxType": "VAT",
      "defaultRate": 0.00,
      "minAllowedRate": 0.00,
      "maxAllowedRate": 0.00,
      "appliesToDineIn": false,
      "appliesToTakeaway": true,
      "appliesToHot": false,
      "appliesToCold": true,
      "description": "Zero-rated for cold food sold as takeaway (sandwiches, cold salads)."
    }
  ]
}
```

---

#### `GET /api/v1/taxes/venues/{venueId}/active-country`
Returns the currently assigned country and any venue-level overrides.

**Response `200 OK`:**
```json
{
  "venueId": 42,
  "country": { "isoCode": "IN", "name": "India" },
  "overrides": [
    {
      "taxRuleId": 31,
      "ruleCode": "IN_GST_18",
      "overrideRate": 0.18,
      "overrideReason": "Hotel room tariff > ₹7500"
    }
  ]
}
```

---

#### `PUT /api/v1/taxes/venues/{venueId}/active-country`
Assigns a new country to a venue. Clears any existing overrides.

**Request body:**
```json
{
  "isoCode": "AU",
  "assignmentReason": "Venue opened in Sydney"
}
```

**Response `200 OK`:** Updated venue-country assignment.

---

#### `PUT /api/v1/taxes/venues/{venueId}/overrides/{taxRuleId}`
Creates or updates a rate override for a specific rule in a venue. Backend validates that `overrideRate` is within `[minAllowedRate, maxAllowedRate]`.

**Request body:**
```json
{
  "overrideRate": 0.05,
  "overrideReason": "Standalone restaurant, non-luxury classification"
}
```

**Response `200 OK`:** Updated override record.  
**Response `422 Unprocessable Entity`:** If rate is outside legal bounds.

```json
{
  "error": "RATE_OUT_OF_BOUNDS",
  "message": "Override rate 0.03 is below the legal minimum of 0.05 for rule IN_GST_5",
  "minAllowed": 0.05,
  "maxAllowed": 0.18
}
```

---

#### `DELETE /api/v1/taxes/venues/{venueId}/overrides/{taxRuleId}`
Removes a venue-level override and restores the country default.

**Response `204 No Content`**

---

### 6.2 Tax Calculation Endpoint

#### `POST /api/v1/taxes/calculate`
The core calculation endpoint. Accepts a full order payload and returns a line-by-line tax breakdown plus totals. Used by the POS at checkout and the simulation sandbox in the admin UI.

**Request body:**
```json
{
  "venueId": 42,
  "orderType": "MIXED",
  "items": [
    {
      "lineItemId": "li-001",
      "menuItemId": 101,
      "description": "Steak Frites",
      "quantity": 1,
      "unitPrice": 16.67,
      "orderType": "DINE_IN",
      "temperature": "HOT",
      "itemCategory": "FOOD"
    },
    {
      "lineItemId": "li-002",
      "menuItemId": 205,
      "description": "Chicken Club Sandwich",
      "quantity": 1,
      "unitPrice": 5.50,
      "orderType": "TAKEAWAY",
      "temperature": "COLD",
      "itemCategory": "FOOD"
    },
    {
      "lineItemId": "li-003",
      "menuItemId": 310,
      "description": "Latte",
      "quantity": 1,
      "unitPrice": 3.33,
      "orderType": "TAKEAWAY",
      "temperature": "HOT",
      "itemCategory": "BEVERAGE"
    }
  ],
  "serviceChargeAmount": 0.00,
  "serviceChargeType": "NONE"
}
```

**Response `200 OK`:**
```json
{
  "venueId": 42,
  "countryIsoCode": "GB",
  "taxModel": "VAT_INCLUSIVE",
  "lineItems": [
    {
      "lineItemId": "li-001",
      "description": "Steak Frites",
      "quantity": 1,
      "unitPrice": 16.67,
      "baseAmount": 16.67,
      "appliedRuleCode": "UK_VAT_STANDARD",
      "taxRate": 0.20,
      "taxAmount": 3.33,
      "totalAmount": 20.00
    },
    {
      "lineItemId": "li-002",
      "description": "Chicken Club Sandwich",
      "quantity": 1,
      "unitPrice": 5.50,
      "baseAmount": 5.50,
      "appliedRuleCode": "UK_VAT_ZERO",
      "taxRate": 0.00,
      "taxAmount": 0.00,
      "totalAmount": 5.50
    },
    {
      "lineItemId": "li-003",
      "description": "Latte",
      "quantity": 1,
      "unitPrice": 3.33,
      "baseAmount": 3.33,
      "appliedRuleCode": "UK_VAT_STANDARD",
      "taxRate": 0.20,
      "taxAmount": 0.67,
      "totalAmount": 4.00
    }
  ],
  "serviceCharge": null,
  "summary": {
    "subtotalBeforeTax": 25.50,
    "totalTaxAmount": 4.00,
    "grandTotal": 29.50,
    "taxBreakdown": [
      { "ruleCode": "UK_VAT_STANDARD", "ruleName": "UK VAT Standard Rate", "rate": 0.20, "taxableBase": 20.00, "taxAmount": 4.00 },
      { "ruleCode": "UK_VAT_ZERO", "ruleName": "UK VAT Zero Rate", "rate": 0.00, "taxableBase": 5.50, "taxAmount": 0.00 }
    ]
  }
}
```

---

### 6.3 Audit Log Endpoint

#### `GET /api/v1/taxes/venues/{venueId}/audit-logs`
Returns paginated audit log of all tax configuration changes for a venue.

**Query params:** `page`, `size`, `from` (ISO date), `to` (ISO date)

**Response `200 OK`:**
```json
{
  "content": [
    {
      "id": 1001,
      "action": "OVERRIDE_SET",
      "taxRuleCode": "IN_GST_5",
      "oldRate": null,
      "newRate": 0.05,
      "changedBy": "admin@shopro.io",
      "changedAt": "2025-03-10T14:22:00Z",
      "changeReason": "Standalone restaurant classification"
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

---

### 6.4 Item Tax Tag Endpoints

#### `GET /api/v1/taxes/menu-items/{menuItemId}/tax-tag`
Returns the tax classification tag for a menu item.

#### `PUT /api/v1/taxes/menu-items/{menuItemId}/tax-tag`
Sets or updates the tax classification for a menu item.

**Request body:**
```json
{
  "temperature": "HOT",
  "itemCategory": "FOOD",
  "isBasicStaple": false
}
```

---

## 7. Tax Engine Logic

The `TaxEngine` is the core Java service class (`com.shopro.tax.TaxEngine`) responsible for resolving the correct tax rule for each line item and performing the calculation.

### 7.1 Rule Resolution Algorithm

```
FOR EACH lineItem IN order:

  1. Fetch all active tax_rules for the venue's active country
     (including any venue-level overrides)

  2. Filter rules where:
     a. appliesToDineIn  = TRUE  (if lineItem.orderType == DINE_IN)
        OR appliesToTakeaway = TRUE (if lineItem.orderType == TAKEAWAY)

     b. appliesToHot = TRUE or NULL  (if lineItem.temperature == HOT)
        OR appliesToCold = TRUE or NULL (if lineItem.temperature == COLD)

     c. itemCategory matches lineItem.itemCategory
        OR rule.itemCategory IS NULL (wildcard — applies to all)

     d. appliesToAlcohol = TRUE (if lineItem.itemCategory == ALCOHOL)

  3. Apply price threshold checks:
     IF rule.priceThresholdMin IS NOT NULL:
       ONLY match if lineItem.unitPrice > rule.priceThresholdMin
     IF rule.priceThresholdMax IS NOT NULL:
       ONLY match if lineItem.unitPrice <= rule.priceThresholdMax

  4. Select the BEST MATCH rule:
     - Most specific rule (has temperature + orderType + category) wins
     - If tie: lowest sort_order wins

  5. Calculate tax:
     IF country.taxIncluded == TRUE (e.g. UK, Australia):
       taxAmount  = baseAmount - (baseAmount / (1 + appliedRate))
       netAmount  = baseAmount / (1 + appliedRate)
       totalAmount = baseAmount  [price already includes tax]
     ELSE (e.g. USA, India):
       taxAmount  = baseAmount * appliedRate
       totalAmount = baseAmount + taxAmount

  6. IF isCascading == TRUE for any secondary levy rule:
     Apply secondary rule rate on top of the primary tax amount
     (e.g. Ghana NHIL 2.5% applied on the VAT-inclusive subtotal)

  7. Store resolved ruleCode, rate, taxAmount on the line item result
```

### 7.2 Service Charge Handling

```
IF serviceChargeType == 'MANDATORY':
  serviceChargeTaxRule = fetchRuleForCategory(country, 'SERVICE_CHARGE')
  serviceChargeTax = serviceChargeAmount * serviceChargeTaxRule.rate
  Add serviceCharge as a separate line in the tax summary

IF serviceChargeType == 'DISCRETIONARY':
  IF country.discretionaryServiceChargeIsTaxable == TRUE:
    Apply same logic as MANDATORY
  ELSE:
    serviceChargeTax = 0
```

### 7.3 Alcohol Tax Special Cases

- **India:** Alcohol is outside GST scope. Apply State VAT at 20% (stored as a special rule with `appliesToAlcohol = TRUE, taxType = 'STATE_EXCISE'`).
- **Saudi Arabia:** Alcohol is prohibited. The engine throws `AlcoholProhibitedException` if an alcohol item is submitted for a Saudi venue.
- **UAE:** Standard 5% VAT applies to non-alcoholic beverages. A 30% excise applies to alcohol.
- **UK/Australia/Canada/Ghana/Nigeria/Egypt/South Africa/Kenya:** Alcohol is taxed at the standard VAT/GST rate unless a separate excise rule exists.

### 7.4 Bounds Validation

```java
public void validateOverride(TaxRule rule, BigDecimal overrideRate) {
    if (overrideRate.compareTo(rule.getMinAllowedRate()) < 0 ||
        overrideRate.compareTo(rule.getMaxAllowedRate()) > 0) {
        throw new RateOutOfBoundsException(rule, overrideRate);
    }
}
```

---

## 8. Frontend Feature Specification

### 8.1 Navigation

- Add a **"Taxes & Compliance"** card to `DashboardPage` (existing `NAV_CARDS` array).
  - Icon: `Receipt` or `Percent` from Lucide.
  - Route: `/taxes`
  - Roles: `ADMIN`, `SUPER_ADMIN`
- Add lazy-loaded route in `App.tsx`:
  ```tsx
  { path: '/taxes', element: <TaxesDashboardPage />, roles: ['ADMIN', 'SUPER_ADMIN'] }
  ```

---

### 8.2 Page: `TaxesDashboardPage`

**Route:** `/taxes`

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  Taxes & Compliance                         [Audit] │
├─────────────────────────────────────────────────────┤
│  Active Country: [United Kingdom ▼]   [Change]      │
├──────────────────────┬──────────────────────────────┤
│  Tax Rules Panel     │  Bill Simulation Sandbox      │
│  (TaxRulesPanel)     │  (BillSimulator)              │
└──────────────────────┴──────────────────────────────┘
```

**Behaviours:**

- On load: call `GET /api/v1/taxes/venues/{venueId}/active-country` to determine the active country.
- Country Selector dropdown lists all countries from `GET /api/v1/taxes/countries`.
- Changing the country triggers a confirmation dialog: "Changing the country will reset all active overrides. Continue?"
- On confirm: call `PUT /api/v1/taxes/venues/{venueId}/active-country`.
- Clicking **[Audit]** opens `TaxAuditLogDrawer`.

---

### 8.3 Component: `TaxRulesPanel`

Displays a table of all active rules for the selected country with override capability.

**Columns:**

| Column | Description |
|--------|-------------|
| Rule Name | e.g. "UK VAT Standard Rate" |
| Tax Type | Badge: VAT / GST / EXCISE / LEVY |
| Default Rate | e.g. 20% |
| Active Rate | Venue override if set, else default |
| Applies To | Icon chips: Dine-In · Takeaway · Hot · Cold · Alcohol |
| Bounds | "Min: 20% / Max: 20%" |
| Override | [Edit] button — opens `TaxRuleEditor` |

**State:**
- Each row shows a yellow "Overridden" badge if a venue override is active.
- [Reset to Default] button appears when an override is active.

---

### 8.4 Component: `TaxRuleEditor`

A modal/drawer that allows editing a single rule's rate.

**Fields:**

| Field | Type | Validation |
|-------|------|------------|
| Rule Name | Text (read-only) | — |
| Tax Type | Text (read-only) | — |
| Default Rate | Text (read-only) | — |
| Override Rate | Number input with % suffix | Must be within [minAllowedRate, maxAllowedRate] |
| Override Reason | Textarea | Required if rate differs from default |
| Min Allowed Rate | Text (read-only, legal bound info) | — |
| Max Allowed Rate | Text (read-only, legal bound info) | — |

**Behaviours:**
- The input slider/number field is clamped to `[minAllowedRate, maxAllowedRate]`.
- If `minAllowedRate == maxAllowedRate`, the field is read-only with a tooltip: "This rate is fixed by law."
- On save: call `PUT /api/v1/taxes/venues/{venueId}/overrides/{taxRuleId}`.
- On success: toast "Tax rule override saved. Audit log updated."

---

### 8.5 Component: `BillSimulator` (Tax Logic Visualizer)

An interactive sandbox that allows an admin to construct a hypothetical order and see the tax breakdown.

**Left Panel — Order Builder:**

- [+ Add Item] button opens an item form:
  - **Description** (free text)
  - **Unit Price** (number)
  - **Quantity** (number)
  - **Order Type** (toggle: Dine-In / Takeaway / Delivery)
  - **Temperature** (toggle: Hot / Cold / N/A)
  - **Item Category** (select: Food / Beverage / Alcohol / Tobacco)
- Items appear as a list with delete (×) buttons.
- **Service Charge** section:
  - Toggle: None / Mandatory / Discretionary
  - Amount input (enabled if not "None")

**Right Panel — Live Bill Preview:**

Calls `POST /api/v1/taxes/calculate` on every change (debounced 400ms).

Renders:
```
┌─────────────────────────────────────────────────┐
│  LINE ITEMS                                     │
│  ─────────────────────────────────────────────  │
│  Steak Frites (Dine-In · Hot)                   │
│  Base: £16.67   VAT 20%: £3.33   Total: £20.00  │
│  Rule: UK_VAT_STANDARD                          │
│                                                 │
│  Chicken Club (Takeaway · Cold)                 │
│  Base: £5.50   VAT 0%: £0.00   Total: £5.50     │
│  Rule: UK_VAT_ZERO  [Zero-rated: cold takeaway] │
│  ─────────────────────────────────────────────  │
│  TAX BREAKDOWN                                  │
│  UK VAT Standard (20%)  Taxable: £20.00  £4.00  │
│  UK VAT Zero (0%)       Taxable: £5.50   £0.00  │
│  ─────────────────────────────────────────────  │
│  Subtotal (ex. tax):    £25.50                  │
│  Total Tax:              £4.00                  │
│  GRAND TOTAL:           £29.50                  │
└─────────────────────────────────────────────────┘
```

- Each line item shows a colour-coded rule badge.
- If a rule is "interesting" (e.g. zero-rated when hot would have been taxable), show an info tooltip explaining why.
- A "Copy JSON" button copies the full response payload for developer use.

---

### 8.6 Component: `TaxAuditLogDrawer`

Side drawer with a paginated table of all tax changes for the venue.

**Columns:** Timestamp · Action · Rule · Old Rate · New Rate · Changed By · Reason

**Filters:** Date range picker, Action type selector.

**Export:** [Export CSV] button downloads the filtered log.

---

### 8.7 Component: `ItemTaxTagger` (Menu Integration)

A new section within the existing **Menu Management** page (not a standalone page) that allows admins to tag each menu item with its tax classification.

**Accessed via:** Menu Item edit drawer → "Tax Classification" tab

**Fields:**
- Temperature (Hot / Cold / N/A)
- Item Category (Food / Beverage / Alcohol / Tobacco)
- Is Basic Staple (checkbox — zero-rates item in applicable countries)

---

## 9. Global Tax Rule Catalogue

This section defines the seed data for all 13 supported jurisdictions.

### 9.1 United Kingdom (`GB`)

| Rule Code | Name | Default Rate | Min | Max | Dine-In | Takeaway | Hot | Cold |
|-----------|------|-------------|-----|-----|---------|----------|-----|------|
| `UK_VAT_STANDARD` | UK VAT Standard Rate | 20% | 20% | 20% | ✓ | ✓ | ✓ | — |
| `UK_VAT_DINE_IN_COLD` | UK VAT Dine-In Cold | 20% | 20% | 20% | ✓ | — | — | ✓ |
| `UK_VAT_ZERO` | UK VAT Zero Rate (Cold Takeaway) | 0% | 0% | 0% | — | ✓ | — | ✓ |
| `UK_VAT_ALCOHOL` | UK VAT Alcohol | 20% | 20% | 20% | ✓ | ✓ | — | — |
| `UK_VAT_SERVICE_CHARGE` | UK VAT on Service Charge | 20% | 20% | 20% | ✓ | — | — | — |

**Rule Notes:**
- `taxIncluded = TRUE` — prices entered inclusive of VAT.
- "Heating Context": if food is heated for consumption, 20% applies regardless of takeaway.

---

### 9.2 United States — California (`US-CA`)

| Rule Code | Name | Default Rate | Min | Max | Dine-In | Takeaway |
|-----------|------|-------------|-----|-----|---------|----------|
| `USCA_SALES_TAX_FOOD_HOT` | CA Sales Tax — Hot Food | 9.5% | 7.25% | 10.75% | ✓ | ✓ |
| `USCA_SALES_TAX_COLD_EXEMPT` | CA Exempt — Cold Takeaway | 0% | 0% | 0% | — | ✓ |
| `USCA_SALES_TAX_ALCOHOL` | CA Sales Tax — Alcohol | 9.5% | 7.25% | 10.75% | ✓ | ✓ |
| `USCA_SALES_TAX_SERVICE_CHARGE` | CA Sales Tax — Mandatory Service Charge | 9.5% | 7.25% | 10.75% | ✓ | — |

**Rule Notes:**
- `taxIncluded = FALSE` — tax added on top.
- 80/80 Rule: if venue derives >80% revenue from food and >80% of food revenue is from taxable food, cold takeaway may also become taxable. Engine flag: `venue.eightyEightyRuleActive`.

---

### 9.3 United States — Ohio (`US-OH`)

| Rule Code | Name | Default Rate | Min | Max | Dine-In | Takeaway |
|-----------|------|-------------|-----|-----|---------|----------|
| `USOH_SALES_TAX_DINE_IN` | OH Sales Tax — Dine-In | 5.75% | 5.75% | 8.0% | ✓ | — |
| `USOH_EXEMPT_TAKEAWAY` | OH Exempt — Takeaway | 0% | 0% | 0% | — | ✓ |
| `USOH_SALES_TAX_ALCOHOL` | OH Sales Tax — Alcohol | 5.75% | 5.75% | 8.0% | ✓ | ✓ |

---

### 9.4 United States — New York (`US-NY`)

| Rule Code | Name | Default Rate | Dine-In | Takeaway |
|-----------|------|-------------|---------|----------|
| `USNY_SALES_TAX_READY_EAT` | NY Sales Tax — Ready-to-Eat | 8.875% | ✓ | ✓ |
| `USNY_SALES_TAX_ALCOHOL` | NY Sales Tax — Alcohol | 8.875% | ✓ | ✓ |

---

### 9.5 India (`IN`)

| Rule Code | Name | Default Rate | Min | Max |
|-----------|------|-------------|-----|-----|
| `IN_GST_5` | India GST — Standard Restaurants (5%) | 5% | 5% | 5% |
| `IN_GST_18` | India GST — Luxury Hotel Restaurants (18%) | 18% | 18% | 18% |
| `IN_STATE_EXCISE_ALCOHOL` | India State Excise — Alcohol | 20% | 15% | 35% |

**Rule Notes:**
- `IN_GST_5`: No Input Tax Credit (ITC).
- `IN_GST_18`: ITC allowed. Applies when hotel room tariff > ₹7,500/night.
- GST is split equally as CGST (Central) and SGST (State) — display both on the bill.
- Alcohol is outside GST scope; State Excise rule applies separately.

---

### 9.6 Australia (`AU`)

| Rule Code | Name | Default Rate | Min | Max |
|-----------|------|-------------|-----|-----|
| `AU_GST_PREPARED` | AU GST — Prepared Meals | 10% | 10% | 10% |
| `AU_GST_EXEMPT_BASIC` | AU GST — Basic Groceries (Exempt) | 0% | 0% | 0% |
| `AU_GST_ALCOHOL` | AU GST + WET — Alcohol | 10% | 10% | 10% |

---

### 9.7 Canada (`CA`)

| Rule Code | Name | Default Rate | Min | Max | Condition |
|-----------|------|-------------|-----|-----|-----------|
| `CA_GST_ONLY` | Canada GST Only (Basic) | 5% | 5% | 5% | Item < $4 (Ontario) |
| `CA_HST_ON` | Canada HST Ontario | 13% | 13% | 15% | Item ≥ $4 |
| `CA_GST_COLD_EXEMPT` | Canada GST — Cold Basic Grocery | 0% | 0% | 0% | Unprocessed |
| `CA_GST_ALCOHOL` | Canada HST — Alcohol | 13% | 5% | 15% | |

**Rule Notes:**
- Ontario $4 Rule: `priceThresholdMax = 4.00` triggers the `CA_GST_ONLY` (5%) rebate.
- "Basic grocery" cold items (unprocessed) are zero-rated; "ready-to-eat" cold salads are taxable.

---

### 9.8 South Africa (`ZA`)

| Rule Code | Name | Default Rate |
|-----------|------|-------------|
| `ZA_VAT_STANDARD` | SA VAT — Prepared Food | 15% |
| `ZA_VAT_ZERO_STAPLE` | SA VAT — Basic Unprocessed Staples | 0% |
| `ZA_VAT_ALCOHOL` | SA VAT — Alcohol | 15% |

---

### 9.9 Kenya (`KE`)

| Rule Code | Name | Default Rate | Cascades On |
|-----------|------|-------------|-------------|
| `KE_VAT_STANDARD` | Kenya VAT | 16% | — |
| `KE_CTL_LEVY` | Kenya Catering Tourism Levy (CTL) | 2% | `KE_VAT_STANDARD` |
| `KE_VAT_ALCOHOL` | Kenya VAT — Alcohol | 16% | — |

**Rule Notes:**
- CTL (`is_cascading = TRUE`) applies to venues above the revenue threshold; flag `venue.ctlApplicable`.
- Total effective rate: 18% on applicable items.

---

### 9.10 Nigeria (`NG`)

| Rule Code | Name | Default Rate |
|-----------|------|-------------|
| `NG_FEDERAL_VAT` | Nigeria Federal VAT | 7.5% |
| `NG_LAGOS_CONSUMPTION` | Lagos State Consumption Tax | 5.0% |
| `NG_ALCOHOL_VAT` | Nigeria VAT — Alcohol | 7.5% |

**Rule Notes:**
- Lagos State Consumption Tax is additive: total ≈ 12.5%.
- The engine applies both rules when `venue.state == 'LAGOS'`.

---

### 9.11 Egypt (`EG`)

| Rule Code | Name | Default Rate | Notes |
|-----------|------|-------------|-------|
| `EG_VAT_STANDARD` | Egypt VAT | 14% | |
| `EG_SERVICE_CHARGE` | Egypt Service Charge | 12% | Treated as taxable revenue |
| `EG_VAT_ON_SC` | Egypt VAT on Service Charge | 14% | Cascades on EG_SERVICE_CHARGE |

---

### 9.12 Ghana (`GH`)

| Rule Code | Name | Default Rate | Cascading |
|-----------|------|-------------|-----------|
| `GH_VAT` | Ghana VAT | 12.5% | — |
| `GH_NHIL` | National Health Insurance Levy | 2.5% | on subtotal |
| `GH_GETFUND` | Ghana Education Trust Fund | 2.5% | on subtotal |
| `GH_COVID_LEVY` | COVID-19 Recovery Levy | 1.0% | on subtotal |
| `GH_TOURISM_LEVY` | Tourism Levy | 1.0% | on subtotal |

**Rule Notes:**
- Effective total can reach ~21.9% due to cascading/compounding.

---

### 9.13 UAE (`AE`)

| Rule Code | Name | Default Rate |
|-----------|------|-------------|
| `AE_VAT_STANDARD` | UAE VAT | 5% |
| `AE_VAT_ALCOHOL` | UAE VAT + Excise — Alcohol | 30% |
| `AE_EXCISE_TOBACCO` | UAE Excise — Tobacco/Shisha | 100% |
| `AE_VAT_SERVICE_CHARGE` | UAE VAT on Service Charge | 5% |

---

### 9.14 Saudi Arabia (`SA`)

| Rule Code | Name | Default Rate |
|-----------|------|-------------|
| `SA_VAT_STANDARD` | Saudi Arabia VAT | 15% |
| `SA_EXCISE_TOBACCO` | KSA Excise — Tobacco/Shisha | 100% |

**Rule Notes:**
- Alcohol is prohibited; engine blocks alcohol items for SA venues.

---

## 10. Complex Order Billing Samples

These samples illustrate the output of `POST /api/v1/taxes/calculate` for complex mixed orders.

### Sample 1: United Kingdom — Mixed Dine-In & Takeaway

**Scenario:** Guest dines in for a steak and beer, colleague also orders a cold sandwich and hot latte to take away.

| Line | Order Type | Temp | Base Price | Rule Applied | Tax Rate | Tax Amt | Total |
|------|-----------|------|-----------|-------------|---------|---------|-------|
| Steak Frites | Dine-In | Hot | £16.67 | UK_VAT_STANDARD | 20% | £3.33 | £20.00 |
| Pint of Lager | Dine-In | Cold | £5.00 | UK_VAT_STANDARD | 20% | £1.00 | £6.00 |
| Chicken Club | Takeaway | Cold | £5.50 | UK_VAT_ZERO | 0% | £0.00 | £5.50 |
| Latte | Takeaway | Hot | £3.33 | UK_VAT_STANDARD | 20% | £0.67 | £4.00 |
| **Total** | | | **£30.50** | | | **£5.00** | **£35.50** |

> **POS Note:** The Latte attracts 20% because it is **hot** takeaway. The Chicken Club is zero-rated because it is **cold** takeaway. All dine-in items always attract 20%.

---

### Sample 2: USA California — Large Party + Mandatory Service Charge

**Scenario:** Family dinner. Large party triggers mandatory service charge. Some items ordered to take home.

| Line | Order Type | Base Price | Tax Rate | Tax Amt | Total |
|------|-----------|-----------|---------|---------|-------|
| 2× Burger Combo | Dine-In | $30.00 | 9.5% | $2.85 | $32.85 |
| Wine Bottle | Dine-In | $40.00 | 9.5% | $3.80 | $43.80 |
| Service Charge (Mandatory) | — | $10.50 | 9.5% | $1.00 | $11.50 |
| Cold Deli Tray | Takeaway (Cold) | $20.00 | 0% | $0.00 | $20.00 |
| Hot Wings | Takeaway (Hot) | $15.00 | 9.5% | $1.43 | $16.43 |
| **Total** | | **$115.50** | | **$9.08** | **$124.58** |

> **POS Note:** Mandatory Service Charge is taxable in CA. Cold Deli Tray is exempt for takeaway. Hot Wings are taxable even for takeaway.

---

### Sample 3: India — Luxury Hotel Restaurant (18% GST)

**Scenario:** High-end hotel restaurant (room tariff > ₹7,500/night). Alcohol billed under State Excise.

| Line | Order Type | Base Price | GST Rate | CGST (9%) | SGST (9%) | Total |
|------|-----------|-----------|---------|----------|----------|-------|
| Paneer Tikka | Dine-In | ₹500 | 18% | ₹45 | ₹45 | ₹590 |
| Craft Beer | Dine-In | ₹400 | State Excise 20% | — | — | ₹480 |
| Takeaway Pasta | Takeaway | ₹600 | 18% | ₹54 | ₹54 | ₹708 |
| Service Charge | Mandatory | ₹150 | 18% | ₹13.50 | ₹13.50 | ₹177 |
| **Total** | | **₹1,650** | | **₹112.50** | **₹112.50** | **₹1,955** |

> **POS Note:** Alcohol is outside the GST net. It attracts State Excise (~20%) separately. GST is split as CGST + SGST on the bill.

---

### Sample 4: Canada (Ontario) — Price Threshold Rule

**Scenario:** Customer orders items that span the Ontario $4 threshold.

| Line | Order Type | Unit Price | Rule Applied | Tax Rate | Tax Amt | Total |
|------|-----------|----------|-------------|---------|---------|-------|
| Espresso | Takeaway | $3.50 | CA_GST_ONLY | 5% | $0.18 | $3.68 |
| Club Sandwich | Dine-In | $12.00 | CA_HST_ON | 13% | $1.56 | $13.56 |
| Sparkling Water | Takeaway | $2.50 | CA_GST_ONLY | 5% | $0.13 | $2.63 |
| Beef Burger | Dine-In | $16.00 | CA_HST_ON | 13% | $2.08 | $18.08 |
| **Total** | | **$34.00** | | | **$3.95** | **$37.95** |

> **POS Note:** Items under $4.00 at takeaway receive the Ontario point-of-sale rebate — only 5% GST applies instead of 13% HST.

---

### Sample 5: Ghana — Cascading Levies

**Scenario:** Standard restaurant, multiple levies stack on top of each other.

| Line | Base Price | VAT 12.5% | NHIL 2.5% | GETFund 2.5% | COVID 1% | Tourism 1% | Total Tax | Total |
|------|-----------|----------|----------|-------------|---------|-----------|----------|-------|
| Jollof Rice | GH₵80 | GH₵10.00 | GH₵2.00 | GH₵2.00 | GH₵0.80 | GH₵0.80 | GH₵15.60 | GH₵95.60 |
| Grilled Tilapia | GH₵120 | GH₵15.00 | GH₵3.00 | GH₵3.00 | GH₵1.20 | GH₵1.20 | GH₵23.40 | GH₵143.40 |
| Soft Drink | GH₵15 | GH₵1.88 | GH₵0.38 | GH₵0.38 | GH₵0.15 | GH₵0.15 | GH₵2.94 | GH₵17.94 |
| **Total** | **GH₵215** | **GH₵26.88** | **GH₵5.38** | **GH₵5.38** | **GH₵2.15** | **GH₵2.15** | **GH₵41.94** | **GH₵256.94** |

> **POS Note:** Each levy is calculated on the base price (not cascaded). Effective rate: ~19.5% on base amount.

---

### Sample 6: UAE — Mixed Alcohol & Food with Service Charge

**Scenario:** Guests order food, alcohol (excise applies), and shisha (100% excise).

| Line | Order Type | Base Price | Rule Applied | Tax Rate | Tax Amt | Total |
|------|-----------|-----------|-------------|---------|---------|-------|
| Grilled Salmon | Dine-In | AED 95.00 | AE_VAT_STANDARD | 5% | AED 4.75 | AED 99.75 |
| House Wine (bottle) | Dine-In | AED 200.00 | AE_VAT_ALCOHOL | 30% | AED 60.00 | AED 260.00 |
| Shisha | Dine-In | AED 80.00 | AE_EXCISE_TOBACCO | 100% | AED 80.00 | AED 160.00 |
| Service Charge (10%) | — | AED 37.50 | AE_VAT_SERVICE_CHARGE | 5% | AED 1.88 | AED 39.38 |
| **Total** | | **AED 412.50** | | | **AED 146.63** | **AED 559.13** |

---

## 11. Validation & Error Handling

### 11.1 API Error Codes

| Error Code | HTTP Status | Description |
|-----------|------------|-------------|
| `RATE_OUT_OF_BOUNDS` | 422 | Override rate outside legal `[min, max]` bounds |
| `ALCOHOL_PROHIBITED` | 422 | Alcohol item submitted for Saudi Arabia venue |
| `COUNTRY_NOT_SUPPORTED` | 400 | Requested ISO code not in catalogue |
| `VENUE_COUNTRY_NOT_SET` | 409 | Venue has no country assignment; cannot calculate tax |
| `ITEM_TAX_TAG_MISSING` | 422 | `temperature` or `itemCategory` missing and required by active country rules |
| `INVALID_ORDER_TYPE` | 400 | `orderType` field has unrecognised value |

### 11.2 Frontend Validation

- **Override Rate Input:** Enforced min/max via HTML input constraints + client-side check before submission.
- **Service Charge:** Cannot be negative. If mandatory service charge >30% of subtotal, show warning (not blocking).
- **Bill Simulator:** If required field (temperature, category) is missing, show inline error on that item row and disable simulation.

---

## 12. Testing Requirements

### 12.1 Backend Unit Tests (`TaxEngineTest.java`)

| Test ID | Scenario | Expected Outcome |
|---------|---------|-----------------|
| TE-001 | UK: Hot dine-in food | UK_VAT_STANDARD (20%) applied |
| TE-002 | UK: Cold takeaway food | UK_VAT_ZERO (0%) applied |
| TE-003 | UK: Hot takeaway food | UK_VAT_STANDARD (20%) applied |
| TE-004 | Ohio: Takeaway (any temp) | USOH_EXEMPT_TAKEAWAY (0%) applied |
| TE-005 | Ohio: Dine-in food | USOH_SALES_TAX_DINE_IN (5.75%) applied |
| TE-006 | Ontario: Item < $4 takeaway | CA_GST_ONLY (5%) applied |
| TE-007 | Ontario: Item ≥ $4 dine-in | CA_HST_ON (13%) applied |
| TE-008 | CA: Mandatory service charge | USCA_SALES_TAX_SERVICE_CHARGE applied |
| TE-009 | India: Alcohol item | IN_STATE_EXCISE_ALCOHOL (20%) applied, not GST |
| TE-010 | Saudi Arabia: Alcohol item | `AlcoholProhibitedException` thrown |
| TE-011 | Ghana: Jollof Rice GH₵80 | All 5 levies calculated correctly |
| TE-012 | UAE: Wine bottle | AE_VAT_ALCOHOL (30%) applied |
| TE-013 | Kenya: CTL applicable venue | Both KE_VAT (16%) + KE_CTL (2%) applied |
| TE-014 | Override below min bound | `RateOutOfBoundsException` thrown |
| TE-015 | Override above max bound | `RateOutOfBoundsException` thrown |
| TE-016 | Tax-inclusive model (UK) | Tax extracted from price, not added |
| TE-017 | Tax-exclusive model (USA) | Tax added to base price |
| TE-018 | Mixed order (UK sample 1) | Each line gets correct rule independently |
| TE-019 | India: GST split CGST/SGST | Each = 9%, total = 18% |
| TE-020 | Egypt: Service charge cascades | VAT applied on service charge amount |

### 12.2 Integration Tests

- `POST /api/v1/taxes/calculate` with UK mixed order — assert full response structure.
- `PUT /api/v1/taxes/venues/{id}/overrides/{ruleId}` with out-of-bounds rate — assert 422.
- `PUT /api/v1/taxes/venues/{id}/active-country` — assert audit log entry created.

### 12.3 Frontend Tests (Vitest + React Testing Library)

- `BillSimulator`: Add 3 items, verify live calculation matches expected totals.
- `TaxRuleEditor`: Input rate below minimum — verify error message shown, submit blocked.
- `TaxRulesPanel`: Verify "Overridden" badge shows on overridden rows.
- `TaxAuditLogDrawer`: Verify log entries paginate correctly.

### 12.4 Manual QA Checklist

- [ ] Navigate to `/taxes` as ADMIN — page loads with country selector.
- [ ] Navigate to `/taxes` as CASHIER — redirect to unauthorized / no taxes card shown on dashboard.
- [ ] Select "United Kingdom" — rule table shows 5 rows including VAT_ZERO.
- [ ] Change country from UK to India — confirmation dialog appears and overrides are cleared.
- [ ] Add a hot dine-in item and cold takeaway item in BillSimulator (UK) — verify different rates applied.
- [ ] Attempt to set override rate of 0.01 on UK_VAT_STANDARD (which has min=max=0.20) — verify input disabled or error shown.
- [ ] Add alcohol item for Saudi Arabia venue in BillSimulator — verify error message.
- [ ] Verify audit log entry appears after override is set.
- [ ] Verify printed receipt format shows CGST + SGST split for India.

---

## 13. Non-Functional Requirements

### 13.1 Performance

- `POST /api/v1/taxes/calculate` must return p99 response time < 200ms for orders up to 50 line items.
- Tax rule lookups must be cached (Spring Cache / Caffeine). Cache TTL: 10 minutes. Cache invalidated on override save.

### 13.2 Security

- All `/api/v1/taxes/**` endpoints require authentication.
- Override and country change endpoints require `ROLE_ADMIN` or `ROLE_SUPER_ADMIN`.
- Audit log is append-only; no DELETE endpoint exposed.
- Rate bounds are enforced server-side regardless of client input.

### 13.3 Accessibility

- All form inputs have `aria-label` and `aria-describedby` linking to the bounds hint.
- BillSimulator table meets WCAG 2.1 AA colour contrast on all badge colours.

### 13.4 Internationalisation

- Currency symbol and decimal format are driven by the `countries.currency_symbol` field.
- All monetary values in the API are `NUMERIC(12,2)` — frontend formats using `Intl.NumberFormat` with the venue's locale.

### 13.5 Audit & Compliance

- Every tax rate change writes an immutable row to `tax_audit_logs`.
- Log includes the actor's IP address (captured server-side from the request).
- Audit logs must be retained for a minimum of 7 years (configurable via `tax.audit.retention-years` application property).

---

## 14. Implementation Phases & Timeline

### Phase 1 — Foundation (Week 1–2)
- [ ] Flyway migration: create all 7 tables.
- [ ] Flyway seed migration: insert all 13 countries + default rules.
- [ ] `TaxEngine.java` — core rule resolution + calculation logic.
- [ ] `TaxController.java` — `GET /countries`, `GET /countries/{iso}/rules`, `POST /calculate`.
- [ ] Unit tests for TaxEngine (all 20 test cases).

### Phase 2 — Venue Config & Overrides (Week 3)
- [ ] `GET /venues/{id}/active-country`, `PUT /venues/{id}/active-country`.
- [ ] `PUT /venues/{id}/overrides/{ruleId}`, `DELETE` override.
- [ ] Audit log service + endpoint.
- [ ] Cache layer (Caffeine) for rule lookups.

### Phase 3 — Frontend Core (Week 3–4)
- [ ] Route + lazy loading in `App.tsx`.
- [ ] `TaxesDashboardPage` — layout + country selector.
- [ ] `TaxRulesPanel` — rule table with override badges.
- [ ] `TaxRuleEditor` — modal with bounds-enforced input.

### Phase 4 — Bill Simulator (Week 4–5)
- [ ] `BillSimulator` — order builder + live preview panel.
- [ ] Integration with `POST /calculate`.
- [ ] Service charge controls.

### Phase 5 — Integration & Polish (Week 5–6)
- [ ] `ItemTaxTagger` tab on Menu Item edit drawer.
- [ ] `TaxAuditLogDrawer` with CSV export.
- [ ] Dashboard card in `DashboardPage.tsx`.
- [ ] Responsive layout review (mobile + desktop).
- [ ] Full QA pass against manual checklist.

---

## 15. Appendix — Field Glossary

| Term | Definition |
|------|-----------|
| **Tax-Inclusive** | The displayed price already contains tax. The tax amount is extracted by back-calculation. Common in UK, Australia. |
| **Tax-Exclusive** | Tax is added on top of the displayed price. Common in USA, India, Canada. |
| **Cascading Tax** | A levy calculated on the result of another tax, not on the base price. Common in Ghana. |
| **Rule Code** | Unique identifier for a tax rule (e.g. `UK_VAT_ZERO`). Used internally and in receipts. |
| **Override Rate** | A venue-specific rate that replaces the country default for that rule only. |
| **Min/Max Allowed Rate** | Legal bounds within which a venue may override the default rate. |
| **CTL** | Catering Tourism Levy (Kenya) — 2% additional levy for qualifying establishments. |
| **ITC** | Input Tax Credit (India) — the ability for a business to claim credit for GST paid on inputs. |
| **HST** | Harmonised Sales Tax (Canada) — combined federal GST + provincial tax. |
| **80/80 Rule** | A California rule where a vendor selling mostly hot taxable food must tax all food including cold takeaway. |
| **Dine-In** | Order consumed on the premises of the restaurant. |
| **Takeaway** | Order prepared by the restaurant and consumed off-premises. |
| **Temperature Tag** | Classification of a menu item as HOT or COLD, used to determine applicable VAT/GST rule in temperature-sensitive jurisdictions (UK, Canada). |
| **Basic Staple** | Unprocessed food items (raw veg, bread, milk) that are zero-rated in applicable countries (Australia, South Africa, UK). |
| **CGST / SGST** | Central GST / State GST in India — always equal halves of the total GST rate, both printed on the bill. |
| **WET** | Wine Equalisation Tax (Australia) — additional excise on wine. |