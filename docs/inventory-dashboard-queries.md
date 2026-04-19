# Inventory Dashboard Queries

This document provides optimized SQL queries for inventory dashboards, reports, and analytics using the new performance-optimized schema.

## Quick Reference

| Query Purpose | Table/View | Performance |
|---------------|-----------|-------------|
| Current balance (single ingredient) | `inventory_ingredient_balance` | <1ms |
| Low stock alert list | `inventory_ingredient_balance` | <5ms |
| Full inventory snapshot | `mv_restaurant_inventory_snapshot` | <10ms |
| Daily movement trend | `mv_ingredient_daily_balance` | <10ms |
| Historical ledger (raw) | `inventory_ingredient_ledger` | <50ms |

---

## 1. Dashboard Widgets

### 1.1 Total Inventory Value

```sql
-- Get total positive inventory balance for restaurant
SELECT 
    SUM(current_balance) as total_quantity,
    COUNT(*) as ingredient_count,
    COUNT(CASE WHEN current_balance <= 0 THEN 1 END) as out_of_stock_count,
    COUNT(CASE WHEN current_balance <= reorder_point THEN 1 END) as low_stock_count
FROM inventory_ingredient_balance bal
JOIN ingredient ing ON bal.ingredient_id = ing.id
WHERE bal.restaurant_id = 3;
```

**Use case:** Dashboard header showing inventory health

**Expected time:** <5ms

---

### 1.2 Low Stock Alert List

```sql
SELECT 
    bal.ingredient_id,
    ing.description as ingredient_name,
    ing.purchase_unit as unit,
    bal.current_balance,
    ing.reorder_point,
    bal.last_movement_at,
    bal.last_movement_type,
    CASE 
        WHEN bal.current_balance <= 0 THEN 'OUT_OF_STOCK'
        WHEN bal.current_balance <= ing.reorder_point THEN 'LOW_STOCK'
        ELSE 'OK'
    END as stock_status,
    (ing.reorder_point - bal.current_balance) as shortage_qty
FROM inventory_ingredient_balance bal
JOIN ingredient ing ON bal.ingredient_id = ing.id
WHERE bal.restaurant_id = 3
  AND bal.current_balance <= ing.reorder_point
ORDER BY 
    CASE 
        WHEN bal.current_balance <= 0 THEN 0
        ELSE 1
    END,
    bal.current_balance ASC
LIMIT 20;
```

**Use case:** Dashboard alert widget

**Expected time:** <5ms

---

### 1.3 Inventory by Category

```sql
SELECT 
    ing.inventory_category,
    COUNT(*) as ingredient_count,
    SUM(bal.current_balance) as total_quantity,
    COUNT(CASE WHEN bal.current_balance <= 0 THEN 1 END) as out_of_stock_count
FROM inventory_ingredient_balance bal
JOIN ingredient ing ON bal.ingredient_id = ing.id
WHERE bal.restaurant_id = 3
GROUP BY ing.inventory_category
ORDER BY total_quantity DESC;
```

**Use case:** Pie chart showing inventory distribution

**Expected time:** <10ms

---

### 1.4 Recent Movements (Last 24 Hours)

```sql
SELECT 
    led.created_at,
    led.event_type,
    ing.description as ingredient_name,
    led.quantity,
    led.running_balance,
    led.activeLot_id,
    led.order_id,
    led.grn_id,
    led.created_by
FROM inventory_ingredient_ledger led
JOIN ingredient ing ON led.ingredient_id = ing.id
WHERE led.restaurant_id = 3
  AND led.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY led.created_at DESC
LIMIT 50;
```

**Use case:** Activity feed on dashboard

**Expected time:** <10ms

---

## 2. Ingredient Detail Page

### 2.1 Current Status

```sql
SELECT 
    bal.ingredient_id,
    ing.description as ingredient_name,
    ing.purchase_unit as unit,
    bal.current_balance,
    ing.reorder_point,
    ing.standard_waste_percentage,
    bal.last_movement_at,
    bal.last_movement_type,
    lot.batch_number as last_lot_batch,
    lot.expiry_date as last_lot_expiry,
    CASE 
        WHEN bal.current_balance <= 0 THEN 'OUT_OF_STOCK'
        WHEN bal.current_balance <= ing.reorder_point THEN 'LOW_STOCK'
        ELSE 'OK'
    END as stock_status
FROM inventory_ingredient_balance bal
JOIN ingredient ing ON bal.ingredient_id = ing.id
LEFT JOIN inventory_active_lot lot ON bal.last_lot_id = lot.id
WHERE bal.restaurant_id = 3 
  AND bal.ingredient_id = 123;
```

**Use case:** Ingredient detail page header

**Expected time:** <2ms

---

### 2.2 30-Day Movement Trend

```sql
SELECT 
    balance_date,
    total_receipts,
    total_depletions,
    total_waste,
    net_movement,
    ending_balance,
    transaction_count
FROM mv_ingredient_daily_balance
WHERE restaurant_id = 3 
  AND ingredient_id = 123
  AND balance_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY balance_date DESC;
```

**Use case:** Line chart showing inventory trend

**Expected time:** <5ms

---

### 2.3 FIFO Lot Breakdown

```sql
SELECT 
    lot.id as lot_id,
    lot.batch_number,
    lot.expiry_date,
    lot.initial_qty,
    lot.available_qty,
    (lot.initial_qty - lot.available_qty) as depleted_qty,
    lot.unit_price,
    (lot.available_qty * lot.unit_price) as remaining_value,
    CASE 
        WHEN lot.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN lot.expiry_date < CURRENT_DATE + INTERVAL '7 days' THEN 'EXPIRING_SOON'
        ELSE 'OK'
    END as expiry_status
FROM inventory_active_lot lot
WHERE lot.restaurant_id = 3
  AND lot.ingredient_id = 123
  AND lot.active = true
ORDER BY lot.expiry_date ASC, lot.received_at ASC;
```

**Use case:** Table showing active lots for ingredient

**Expected time:** <5ms

---

### 2.4 Recent Transactions (Ledger)

```sql
SELECT 
    led.id,
    led.created_at,
    led.event_type,
    led.quantity,
    led.unit_cost,
    led.total_value,
    led.running_balance,
    led.activeLot_id,
    lot.batch_number,
    led.order_id,
    led.grn_id,
    led.reason_code,
    led.created_by
FROM inventory_ingredient_ledger led
LEFT JOIN inventory_active_lot lot ON led.activeLot_id = lot.id
WHERE led.restaurant_id = 3
  AND led.ingredient_id = 123
ORDER BY led.created_at DESC, led.id DESC
LIMIT 100;
```

**Use case:** Transaction history table

**Expected time:** <10ms

---

## 3. Reports

### 3.1 Daily Inventory Summary Report

```sql
SELECT 
    balance_date,
    ingredient_id,
    ing.description as ingredient_name,
    total_receipts,
    total_depletions,
    total_waste,
    net_movement,
    ending_balance,
    transaction_count,
    total_value_change,
    avg_unit_cost
FROM mv_ingredient_daily_balance mv
JOIN ingredient ing ON mv.ingredient_id = ing.id
WHERE mv.restaurant_id = 3
  AND balance_date = CURRENT_DATE - INTERVAL '1 day'
ORDER BY ingredient_name;
```

**Use case:** Daily inventory report

**Expected time:** <15ms

---

### 3.2 Weekly Usage Report (for Menu Engineering)

```sql
SELECT 
    DATE_TRUNC('week', balance_date) as week_start,
    ingredient_id,
    ing.description as ingredient_name,
    SUM(total_depletions) as weekly_usage,
    SUM(total_receipts) as weekly_receipts,
    AVG(ending_balance) as avg_balance,
    SUM(transaction_count) as total_transactions
FROM mv_ingredient_daily_balance mv
JOIN ingredient ing ON mv.ingredient_id = ing.id
WHERE mv.restaurant_id = 3
  AND balance_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', balance_date), ingredient_id, ing.description
ORDER BY week_start DESC, ingredient_name;
```

**Use case:** Menu engineering analysis

**Expected time:** <20ms

---

### 3.3 Supplier Performance Report

```sql
SELECT 
    sup.id as supplier_id,
    sup.name as supplier_name,
    COUNT(DISTINCT led.activeLot_id) as total_deliveries,
    SUM(CASE WHEN led.event_type = 'RECEIPT' THEN led.quantity ELSE 0 END) as total_quantity_supplied,
    AVG(led.unit_cost) as avg_unit_price,
    SUM(led.total_value) as total_value,
    MIN(led.created_at) as first_delivery,
    MAX(led.created_at) as last_delivery
FROM inventory_ingredient_ledger led
JOIN ingredient ing ON led.ingredient_id = ing.id
JOIN supplier sup ON led.supplier_id = sup.id
WHERE led.restaurant_id = 3
  AND led.event_type = 'RECEIPT'
  AND led.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY sup.id, sup.name
ORDER BY total_value DESC;
```

**Use case:** Supplier evaluation

**Expected time:** <25ms

---

### 3.4 Waste Analysis Report

```sql
SELECT 
    ing.description as ingredient_name,
    ing.inventory_category,
    SUM(CASE WHEN led.event_type = 'WASTE' THEN led.quantity ELSE 0 END) as total_wasted_qty,
    SUM(CASE WHEN led.event_type = 'WASTE' THEN led.total_value ELSE 0 END) as total_waste_value,
    COUNT(CASE WHEN led.event_type = 'WASTE' THEN 1 END) as waste_incidents,
    AVG(CASE WHEN led.event_type = 'WASTE' THEN led.quantity END) as avg_waste_per_incident
FROM inventory_ingredient_ledger led
JOIN ingredient ing ON led.ingredient_id = ing.id
WHERE led.restaurant_id = 3
  AND led.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ing.description, ing.inventory_category
HAVING SUM(CASE WHEN led.event_type = 'WASTE' THEN led.quantity ELSE 0 END) > 0
ORDER BY total_waste_value DESC
LIMIT 20;
```

**Use case:** Waste reduction analysis

**Expected time:** <20ms

---

### 3.5 Inventory Turnover Analysis

```sql
WITH ingredient_metrics AS (
    SELECT 
        ingredient_id,
        ing.description as ingredient_name,
        ing.purchase_unit,
        SUM(total_depletions) as total_consumed,
        AVG(ending_balance) as avg_inventory,
        MAX(ending_balance) as max_inventory
    FROM mv_ingredient_daily_balance mv
    JOIN ingredient ing ON mv.ingredient_id = ing.id
    WHERE mv.restaurant_id = 3
      AND balance_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY ingredient_id, ing.description, ing.purchase_unit
)
SELECT 
    ingredient_name,
    purchase_unit,
    total_consumed,
    avg_inventory,
    CASE 
        WHEN avg_inventory > 0 THEN ROUND((total_consumed / avg_inventory)::numeric, 2)
        ELSE 0
    END as turnover_ratio,
    CASE 
        WHEN avg_inventory > 0 THEN ROUND((30.0 / (total_consumed / avg_inventory))::numeric, 1)
        ELSE NULL
    END as days_of_inventory
FROM ingredient_metrics
WHERE total_consumed > 0
ORDER BY turnover_ratio DESC;
```

**Use case:** Inventory efficiency analysis

**Expected time:** <25ms

---

## 4. Alerts & Notifications

### 4.1 Out of Stock Alert

```sql
SELECT 
    bal.ingredient_id,
    ing.description as ingredient_name,
    bal.current_balance,
    bal.last_movement_at,
    ing.reorder_point,
    'OUT_OF_STOCK' as alert_type,
    'CRITICAL' as priority
FROM inventory_ingredient_balance bal
JOIN ingredient ing ON bal.ingredient_id = ing.id
WHERE bal.restaurant_id = 3
  AND bal.current_balance <= 0
ORDER BY bal.last_movement_at DESC;
```

**Use case:** Email/SMS alert trigger

**Expected time:** <5ms

---

### 4.2 Expiring Lots Alert

```sql
SELECT 
    lot.id as lot_id,
    ing.description as ingredient_name,
    lot.batch_number,
    lot.expiry_date,
    lot.available_qty,
    lot.unit_price,
    (lot.available_qty * lot.unit_price) as value_at_risk,
    CASE 
        WHEN lot.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN lot.expiry_date < CURRENT_DATE + INTERVAL '3 days' THEN 'EXPIRES_IN_3_DAYS'
        WHEN lot.expiry_date < CURRENT_DATE + INTERVAL '7 days' THEN 'EXPIRES_IN_WEEK'
        ELSE 'EXPIRES_IN_MONTH'
    END as urgency,
    days_until_expiry
FROM (
    SELECT 
        lot.*,
        (lot.expiry_date - CURRENT_DATE) as days_until_expiry
    FROM inventory_active_lot lot
    WHERE lot.restaurant_id = 3
      AND lot.active = true
      AND lot.available_qty > 0
      AND lot.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
) lot
JOIN ingredient ing ON lot.ingredient_id = ing.id
ORDER BY lot.expiry_date ASC;
```

**Use case:** Expiry alert dashboard

**Expected time:** <10ms

---

### 4.3 Negative Balance Alert (Data Integrity)

```sql
SELECT 
    bal.ingredient_id,
    ing.description as ingredient_name,
    bal.current_balance,
    bal.last_movement_at,
    bal.last_movement_type,
    'NEGATIVE_BALANCE' as alert_type,
    'HIGH' as priority
FROM inventory_ingredient_balance bal
JOIN ingredient ing ON bal.ingredient_id = ing.id
WHERE bal.restaurant_id = 3
  AND bal.current_balance < 0
ORDER BY bal.current_balance ASC;
```

**Use case:** Data integrity monitoring

**Expected time:** <5ms

---

## 5. API Query Patterns (for Spring Data JPA)

### 5.1 Repository Method Queries

```java
// InventoryBalanceRepository.java

@Query("""
    SELECT new mls.sho.dms.application.inventory.dto.InventorySummaryDto(
        b.ingredient.id,
        b.ingredient.description,
        b.ingredient.purchaseUnit,
        b.currentBalance,
        b.ingredient.reorderPoint,
        b.lastMovementAt,
        b.lastMovementType
    )
    FROM InventoryIngredientBalance b
    JOIN b.ingredient i
    WHERE b.restaurant.id = :restaurantId
      AND b.currentBalance > 0
    ORDER BY b.currentBalance DESC
""")
List<InventorySummaryDto> getInventorySummary(@Param("restaurantId") Long restaurantId);

@Query("""
    SELECT new mls.sho.dms.application.inventory.dto.LowStockDto(
        b.ingredient.id,
        b.ingredient.description,
        b.currentBalance,
        b.ingredient.reorderPoint,
        (b.ingredient.reorderPoint - b.currentBalance)
    )
    FROM InventoryIngredientBalance b
    JOIN b.ingredient i
    WHERE b.restaurant.id = :restaurantId
      AND b.currentBalance <= b.ingredient.reorderPoint
    ORDER BY b.currentBalance ASC
""")
List<LowStockDto> getLowStockIngredients(@Param("restaurantId") Long restaurantId);

@Query("""
    SELECT new mls.sho.dms.application.inventory.dto.DailyMovementDto(
        m.balanceDate,
        m.totalReceipts,
        m.totalDepletions,
        m.totalWaste,
        m.netMovement,
        m.endingBalance,
        m.transactionCount
    )
    FROM MvIngredientDailyBalance m
    WHERE m.restaurantId = :restaurantId
      AND m.ingredientId = :ingredientId
      AND m.balanceDate >= :startDate
    ORDER BY m.balanceDate DESC
""")
List<DailyMovementDto> getIngredientMovementTrend(
    @Param("restaurantId") Long restaurantId,
    @Param("ingredientId") Long ingredientId,
    @Param("startDate") LocalDate startDate
);
```

---

## 6. Performance Monitoring

### 6.1 Query Performance Check

```sql
-- Check which queries are slow
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE query LIKE '%inventory%'
  AND query NOT LIKE '%pg_stat%'
ORDER BY mean_time DESC
LIMIT 10;
```

### 6.2 Index Usage Check

```sql
-- Check if indexes are being used
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename LIKE 'inventory%'
ORDER BY idx_scan DESC;
```

### 6.3 Table Size Check

```sql
-- Monitor table growth
SELECT 
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size,
    pg_size_pretty(pg_relation_size(relid)) as data_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE relname LIKE 'inventory%'
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## 7. Materialized View Refresh

### 7.1 Manual Refresh

```sql
-- Refresh daily balance view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ingredient_daily_balance;

-- Refresh inventory snapshot view
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_restaurant_inventory_snapshot;
```

### 7.2 Scheduled Refresh (pg_cron)

```sql
-- Check if scheduled
SELECT * FROM cron.job WHERE jobname = 'refresh-inventory-views';

-- If not scheduled, create job
SELECT cron.schedule(
    'refresh-inventory-views',
    '*/5 * * * *',  -- Every 5 minutes
    $$SELECT fn_ledger_refresh_all_views()$$
);
```

---

## 8. Troubleshooting Queries

### 8.1 Verify Balance Consistency

```sql
-- Check if summary table matches ledger
SELECT 
    bal.ingredient_id,
    bal.current_balance as summary_balance,
    led.ledger_balance,
    (bal.current_balance - led.ledger_balance) as difference
FROM inventory_ingredient_balance bal
JOIN (
    SELECT 
        ingredient_id,
        SUM(quantity) as ledger_balance
    FROM inventory_ingredient_ledger
    WHERE restaurant_id = 3
    GROUP BY ingredient_id
) led ON bal.ingredient_id = led.ingredient_id
WHERE bal.restaurant_id = 3
  AND ABS(bal.current_balance - led.ledger_balance) > 0.0001;
```

### 8.2 Find Missing Running Balances

```sql
-- Check for NULL running_balance
SELECT COUNT(*) 
FROM inventory_ingredient_ledger 
WHERE running_balance IS NULL 
  AND restaurant_id = 3;
```

### 8.3 Trigger Execution Check

```sql
-- Check if triggers are active
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as status
FROM pg_trigger
WHERE tgname LIKE 'trg_ledger%'
  AND tgrelid = 'inventory_ingredient_ledger'::regclass;
```

---

## Summary

| Query Type | Recommended Source | Performance |
|------------|-------------------|-------------|
| Current balance | `inventory_ingredient_balance` | <1ms |
| Balance history | `inventory_ingredient_ledger` (with running_balance) | <5ms |
| Daily trends | `mv_ingredient_daily_balance` | <10ms |
| Dashboard snapshot | `mv_restaurant_inventory_snapshot` | <10ms |
| Low stock alerts | `inventory_ingredient_balance` | <5ms |
| Transaction details | `inventory_ingredient_ledger` | <15ms |

**Key Principle:** Use summary tables and materialized views for dashboards (read-heavy), use ledger table for audit trails and detailed analysis.
