---
name: one-day-validator
description: >
  Simulates exactly ONE day of restaurant traffic (orders, table sessions,
  staff attendance, procurement) while TRACKING every data insertion, then
  validates the entire server state by calling ALL REST API endpoints and
  comparing actual state against the tracked expected state. Produces a
  comprehensive PASS/FAIL validation report covering POS, Inventory, Procurement,
  Prime Cost, Labor, Analytics, Reports, KDS, and Menu Engineering.
  Triggers on "validate one day", "one day validator", "run one day simulation",
  "simulate and validate", "full state validation", or "end-to-end test".
---

# One-Day Validator Skill

Simulates **one day** of restaurant traffic, tracks **every data insertion**, then
validates the server state by calling **all REST API endpoints** and comparing
actual vs expected state.

## Usage

```bash
python one_day_validator.py [date] [restaurant_id]
python one_day_validator.py                    # defaults: today, restaurant=3
python one_day_validator.py 2026-04-19         # specific date, restaurant=3
python one_day_validator.py 2026-04-19 1        # specific date and restaurant
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  ONE-DAY VALIDATOR                                                  │
│                                                                     │
│  Phase 0: PRE-SNAPSHOT                                              │
│    → Call ALL GET endpoints, record baseline state                  │
│    → (order counts, inventory levels, employee list, tables, etc.)  │
│                                                                     │
│  Phase 1: BOOTSTRAP (if needed)                                     │
│    → Create restaurant, suppliers, ingredients, menu items,          │
│      recipes, staff, tables (track all created IDs)                 │
│                                                                     │
│  Phase 2: SIMULATE ONE DAY                                          │
│    → Clock-in staff (track each employee_id + time)                 │
│    → Poisson arrivals → open sessions → place orders → pay → close  │
│    → Procurement: PO → GRN → Invoice → Post (track all IDs)        │
│    → Clock-out staff (track each clock_out_time)                    │
│    → EVERY entity creation is recorded in a tracking ledger         │
│                                                                     │
│  Phase 3: VALIDATE ALL ENDPOINTS                                    │
│    → Call every REST API endpoint                                   │
│    → Compare actual state vs (baseline + inserted = expected)      │
│    → Generate comprehensive PASS/FAIL report                        │
│                                                                     │
│  Categories validated:                                              │
│    POS | Inventory | Procurement | Prime Cost | Labor               │
│    Analytics | Reports | Menu Engineering | KDS | Recipes            │
└─────────────────────────────────────────────────────────────────────┘
```

## Validation Report

The validator produces a detailed report with:

| Section | What's Checked |
|---------|----------------|
| POS | Order count, totals, statuses, session closure, table states |
| Inventory | On-hand quantities, no negatives, low-stock alerts, valuation |
| Procurement | PO/GRN/Invoice creation, 3-way match, stock received |
| Prime Cost | Live COGS, weekly aggregation, shrinkage, forecast |
| Labor | Clock-in/out records, hours, variance |
| Analytics | Dashboard, CFO snapshot, manager views return data |
| Reports | Menu engineering, inventory valuation, category distribution |
| KDS | Central summary, expo queue reflect orders |
| Menu Engineering | Period creation, run analysis, results |

Each check is: ✅ PASS | ⚠️ WARN | 🚨 FAIL with expected vs actual values.

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `date` | today | Simulation date (YYYY-MM-DD) |
| `restaurant_id` | 3 | Restaurant ID |
| `lambda_lunch` | 5 | Avg Poisson arrivals/hour — lunch (11-14) |
| `lambda_dinner` | 8 | Avg Poisson arrivals/hour — dinner (17-22) |
| `party_min/max` | 2-4 | Guests per party |
| `max_tables` | 20 | Total dining tables |

## Stats

| Metric | Description |
|--------|-------------|
| `orders_placed` | Total orders in simulation |
| `revenue_expected` | Sum of all order totals (tracked) |
| `revenue_actual` | Revenue from server (validated) |
| `checks_passed` | Validation checks that passed |
| `checks_warned` | Warnings (data exists but minor mismatch) |
| `checks_failed` | Failures (significant mismatch or error) |