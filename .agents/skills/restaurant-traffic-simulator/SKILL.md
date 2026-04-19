---
name: restaurant-traffic-simulator
description: >
  Simulates N days of restaurant traffic using Poisson distribution for guest arrivals.
  10 worker threads steal from a shared work queue — if no table is available, the slot is
  re-queued instantly and the worker picks up a slot from another day instead.
  Triggers on "simulate restaurant traffic", "generate 90 days of orders",
  "populate menu engineering data", "run traffic simulation",
  "generate sales data for Q1 2026".
---

# Restaurant Traffic Simulator Skill

Simulates realistic restaurant traffic over N days (default: 90) using Poisson
distribution for party arrivals. **Work-stealing thread pool** — 10 workers continuously
pull from a shared queue; if the next slot has no free table, it is **re-queued** and the
worker immediately steals the next available slot instead of blocking.

---

## Usage

```bash
# Default: 90 days starting 2026-01-01
python traffic_simulator.py

# 30 days
python traffic_simulator.py 30

# 90 days from specific date
python traffic_simulator.py 90 2026-01-01

# Lightweight order generator (record-misfire / inventory depletion)
python direct_order_generator.py 90 2026-01-01
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `days` | `90` | Number of days to simulate |
| `start_date` | `2026-01-01` | First simulation date |
| `lambda_lunch` | `5` | Avg Poisson arrivals/hour — lunch (11–14) |
| `lambda_dinner` | `8` | Avg Poisson arrivals/hour — dinner (17–22) |
| `party_size` | `2–4` | Guests per party |
| `weekend_multiplier` | `1.3` | Sat/Sun lambda multiplier |
| `max_tables` | `24` | Total dining tables (capacity ceiling) |
| `max_workers` | `10` | Concurrent worker threads |

---

## Work-Stealing Architecture

The key innovation is **work stealing with table-backpressure**:

```
┌─────────────────────────────────────────────────────────────┐
│  WORK QUEUE  (thread-safe queue.Queue)                       │
│                                                             │
│  Every slot = 1 party arrival (2-4 guests, one menu item)   │
│  All 10 workers share ONE queue                             │
│                                                             │
│  worker_0  ──get()──►  slot (date_X, hour_Y, arrival_Z)     │
│                                                             │
│  ┌─ table T01 free? ──── YES ──► place order, task_done   │
│  │                                                       │
│  └─ table T01 free? ──── NO ──► re-queue slot             │
│                                      │                     │
│                                      └──► steal next slot  │
│                                              from queue    │
└─────────────────────────────────────────────────────────────┘
```

**Why work stealing matters**:
- In a busy dinner service (λ=8/hr, 10 tables), many slots will have no free table
- A **blocking** worker would wait 45–90 min for a table to free up — blocking a thread
- Instead: the worker re-queues the slot, and immediately grabs a slot from a different
  day/hour where a table might be free
- Result: threads stay busy across all 90 days instead of piling up on peak hours

### Table Occupancy Model

| Element | Detail |
|---------|--------|
| `MAX_TABLES` | Total tables (configurable; 24 for The Market Table, 20 for Afghan) |
| `occupied_tables` | Shared dict: `{"date\|T01": "2026-01-15_19:45", ...}` |
| `get_free_table()` | Returns first table where `release_ts ≤ current_hour` |
| `occupy_table()` | Books a table for 45–90 min (randomized per party) |
| `free_expired_tables()` | Cleans up tables whose release time has passed before each seat attempt |
| `busy_waits` counter | Tracks re-queues due to no-free-table (metric for capacity pressure) |

### Worker Lifecycle

```
1.  worker_idle = True
2.  slot = work_queue.get(timeout=0.5)
3.  if no slot → check all done? → break
4.  free_expired_tables(date, hour)
5.  table = get_free_table(date, hour)
6.  if table is None:
        stats["busy_waits"] += 1
        time.sleep(0.05-0.3s)        ← tiny backoff to avoid tight-spinning
        work_queue.put(slot)         ← re-queue (same slot, other worker)
        continue                    ← immediately grab next slot
7.  if table found:
        place_order(slot, table)
        occupy_table(table, date, hour)
        work_queue.task_done()
        mark done_slots[day_idx].add((hour, arrival_idx))
```

---

## Workflow

```
Phase 1: Initial Procurement
  → 3 procurement threads in parallel, stocks lamb/rice/spices/yogurt

Phase 2: Work Generation
  → For every day × every open hour (11-14, 17-22):
        Poisson(λ × weekend_mult) → N party arrivals
        Each arrival = 1 slot enqueued in work_queue
  → Work queue size = total_slots (e.g. ~4,000 slots for 90 days)

Phase 3: Thread Pool (Work-Stealing ×10)
  → ThreadPoolExecutor(max_workers=10)
  → All 10 workers keep pulling until queue is drained
  → Busy-wait slots are re-queued (not dropped — no data loss)
  → Live: work_queue.qsize() shows remaining work
  → **EOD AUDIT** runs after each day's work is complete

Phase 4: Summary
  → Total orders, revenue, procurement cycles, busy_waits, wall time
  → EOD Audit Summary (inventory variances + staff attendance)
```

---

## End-of-Day (EOD) Audit

After each day's simulation completes, an EOD Audit runs automatically to validate:

### Inventory Audit
Verifies that actual ingredient depletion matches what was ordered:
- **Expected consumption** calculated from order line items × recipe ingredients
- **Actual consumption** queried from the `inventory_ingredient_ledger` for DEPLETION events
- **Variance threshold**: ±5% tolerance (configurable via `VARIANCE_THRESHOLD`)
- **Alerts**: Ingredients where `|Expected - Actual| > threshold` are flagged

### Staff Attendance Audit
Verifies employee clock-in/clock-out compliance for the day:
- **Clocked-in employees**: Records from `employee_attendance` table
- **Active employees**: All employees with `is_active = true` for this restaurant
- **Checks**:
  - Missing clock-out records (attendance left in ACTIVE status)
  - Staff with no clock-in record for the day
  - Expected vs actual hours worked vs scheduled

- **Alerts**: Employees flagged for attendance anomalies

### EOD Audit Stats
| Metric | Description |
|--------|-------------|
| `eod_audits_run` | Number of days with completed audits |
| `inventory_variances` | Ingredients with >5% variance |
| `attendance_alerts` | Staff with clock-in/out issues |
| `variance_alerts` | Breakdown by ingredient (Lamb, Rice, etc.) |

### Audit Report Sample
```
📋 EOD AUDIT — Day 5 (Weekday) — 2026-01-05
══════════════════════════════════════════════
🍖 Inventory Audit
  Expected Orders: 42  |  Actual Ledger Entries: 40
  ⚠️  Lamb Shoulder: Expected -2.3 LB, Actual -2.1 LB (Δ 8.7% — OK)
  ⚠️  Basmati Rice: Expected -1.5 LB, Actual -1.8 LB (Δ 16.7% — FAIL)
  ❌ Low Variance:  1 ingredients flagged

👥 Staff Attendance Audit
  Total Staff: 14      Clocked In: 12        Alerts: 2
  ❌ Hassan Qaderi: No clock-in record
  ❌ Aisha Nazari: Missing clock-out (still ACTIVE)
  ❌ Attendance Alerts: 2 staff

✅ Day 5 Audit Complete — 1 warning, 2 critical issues
```

---

## Stats

| Metric | Description |
|--------|-------------|
| `total_orders` | Orders successfully placed |
| `total_revenue` | Sum of `totalAmount` from all PAID orders |
| `procurement_cycles` | PO→GRN→Invoice cycles triggered |
| `inventory_alerts` | Times lamb stock fell below threshold |
| `busy_waits` | Slots re-queued due to no free table |
| `order_errors` | API calls that returned non-2xx |
| `eod_audits_run` | Number of EOD audits completed |
| `inventory_variances` | Ingredients with >5% consumption variance |
| `attendance_alerts` | Staff with clock-in/out attendance issues |

`busy_waits` is a **capacity pressure indicator**:
- `busy_waits ≈ 0` → restaurant never reached capacity
- `busy_waits >> 0` → restaurant is full during those hours; Poisson arrivals
  exceed table throughput; consider adding tables or adjusting λ

---

## Speed Benchmark

| Mode | Throughput | 90 days wall time |
|------|-----------|-------------------|
| Serial (old) | ~1 day/iteration | 8–15 min |
| **Work-stealing ×10** | ~10× faster | **~45–90 sec** |

Actual time is dominated by API response latency, not Python.

---

## Code Location

| File | Purpose |
|------|---------|
| `traffic_simulator.py` | Full-featured: POS orders + procurement + table tracking |
| `direct_order_generator.py` | Lightweight: record-misfire for inventory depletion |

---

## Extending for Restaurant 2 (The Market Table)

1. Change `RESTAURANT_ID = 2`
2. Update `MAX_TABLES = 24`
3. Update `MENU_WEIGHTS` / `MENU_ITEMS` with Restaurant 2 items
4. Update `STOCK_THRESHOLD` and procurement ingredient IDs
5. Optionally increase `lambda_dinner` to 10–12 (upscale dinner draw)
