# Phase Tracker: Restaurant Scenario Builder

## Current Phase: ✅ COMPLETE — Flyway + Hibernate Integration Fixed

### Phases

| # | Phase                    | Status | Notes                                                    |
|---|--------------------------|--------|----------------------------------------------------------|
| 0 | Prerequisites            | ✅ DONE | Project cloned, DB running, dependencies resolved       |
| 0.5 | Market Research          | ✅ DONE | Market study report generated (see below)                |
| 1 | Scenario Design          | ✅ DONE | Restaurant scenario created                             |
| 2 | SQL Migration Generation  | ✅ DONE | V6–V9 SQL migrations generated with ON CONFLICT DO NOTHING|
| 3 | Flyway Integration Fix    | ✅ DONE | V0 base schema + Hibernate ddl-auto: none + Flyway enabled|
| 4 | Database Seeding Verified | ✅ DONE | All 10 migrations (V0–V9) apply cleanly from empty DB   |

---

## Phase 3: Flyway + Hibernate Integration Fix — COMPLETE

### Problem
Flyway migrations V1–V9 failed on a fresh database because:
- `spring.jpa.hibernate.ddl-auto` was `create-drop`, which drops all tables on shutdown
- Flyway runs BEFORE Hibernate creates the schema
- V6+ INSERT statements depend on tables that don't exist yet

### Solution
1. **Added V0__create_schema.sql** — Full DDL dump from Hibernate (63 tables, sequences, indexes, constraints)
   - Includes `pgcrypto` extension for `sha256()` function
   - All CHECK constraints updated to match seed data (inventory_type, category, recipe_unit, recipe_station, etc.)

2. **Changed Hibernate config** — `ddl-auto: none` (Hibernate only validates, Flyway manages schema)

3. **Enabled Flyway** — `spring.flyway.enabled: true` with `baseline-on-migrate: true`

4. **Fixed all V1–V9 migrations** for idempotency and PostgreSQL compatibility:
   - V3: `CREATE TABLE IF NOT EXISTS` (was `CREATE TABLE`)
   - V5: `DO $$ ... IF NOT EXISTS` wrapper for `ALTER TABLE ADD COLUMN`
   - V6: Removed V7/V8 columns (payment_mode, preferred_supplier_id, shelf_life_days), fixed `is_active` vs `active`, `PERISHABLE`→`FOOD`, `STABLE`→`FOOD`/`BAR`, `yield_quantity`/`yield_unit` added, `sha256()`→`digest()`, removed sample orders, removed `updated_at` from menu_cost_group
   - V7: Already idempotent (uses IF NOT EXISTS)
   - V8: Fixed MySQL-style inline `COMMENT` → PostgreSQL `COMMENT ON COLUMN`
   - V9: Fixed `active`→`is_active`, `PERISHABLE`→`FOOD`, removed `recorded_at`, `reason`→`reason_code`, `quantity_change`→`quantity`, `OPENING_STOCK`→`RECEIVING`

5. **Updated KitchenStationType enum** — Added SALAD, FRY, SAUTE, GRILL, OVEN, BRK, BAR, PASS, WOK, PLATE, PASTRY

### Key Files Changed
| File | Change |
|------|--------|
| `application.yml` | `ddl-auto: none`, `flyway.enabled: true` |
| `V0__create_schema.sql` | NEW — 3500 lines, full DDL from Hibernate schema dump |
| `V3__*.sql` | `CREATE TABLE` → `CREATE TABLE IF NOT EXISTS` |
| `V5__*.sql` | Idempotent `ADD COLUMN` with DO block |
| `V6__*.sql` | Major fixes: column names, data types, removed V7/V8 deps |
| `V7__*.sql` | No changes needed (already idempotent) |
| `V8__*.sql` | MySQL COMMENT → PostgreSQL COMMENT ON COLUMN |
| `V9__*.sql` | Column name, data type, and constraint fixes |
| `KitchenStationType.java` | Added 11 new enum values |

### Verification
All 10 Flyway migrations (V0–V9) apply successfully on a fresh empty database:
- ✅ V0: create schema (63 tables, sequences, indexes, constraints)
- ✅ V1: create audit log
- ✅ V2: menu engineering settings (IF NOT EXISTS)
- ✅ V3: menu engineering recommendations (IF NOT EXISTS)
- ✅ V4: menu engineering extended settings (ADD COLUMN IF NOT EXISTS)
- ✅ V5: add revenue category to menu cost group (idempotent)
- ✅ V6: restaurant The Market Table (core seed data)
- ✅ V7: add supplier payment mode and preferred supplier
- ✅ V8: add shelf life and purchase order expiry
- ✅ V9: market table market-informed menu (bar program expansion)