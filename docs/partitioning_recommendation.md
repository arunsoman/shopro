# ADR: PostgreSQL Partitioning Strategy for Prime Cost Module

## Status
Proposed / Scale-Ready

## Context
As the Shopro POS platform grows to manage hundreds of restaurants with thousands of daily labor records and shifts, a single flat table for `employee_labor_record` and `scheduled_shift` will become a performance bottleneck. Large indexes will slow down writes, and historical reporting will require scanning millions of irrelevant rows.

## Decision
We recommend implementing **Declarative Table Partitioning** in PostgreSQL.

### 1. Partitioning Key
- **Primary Strategy**: Range Partitioning by `week_start_date` or `shift_date`.
- **Secondary Strategy**: List Partitioning by `restaurant_id` (if specific high-volume tenants need physical isolation).

### 2. Implementation Template (SQL Migration)

To convert the newly indexed tables into partitioned tables, the following Flyway migration pattern should be used:

```sql
-- Example for scheduled_shift
-- 1. Create the parent table (Declarative)
CREATE TABLE scheduled_shift_p (
    id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    station VARCHAR(255),
    notes TEXT,
    PRIMARY KEY (id, shift_date) -- PK must include partition key
) PARTITION BY RANGE (shift_date);

-- 2. Create child partitions for the current year
CREATE TABLE scheduled_shift_2026_q1 PARTITION OF scheduled_shift_p
    FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE scheduled_shift_2026_q2 PARTITION OF scheduled_shift_p
    FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

-- 3. Add composite indexes to the parent (automatically propagated)
CREATE INDEX idx_p_shift_res_date ON scheduled_shift_p (restaurant_id, shift_date);
```

## Consequences
- **Positive**: 
    - Queries restricted to specific weeks scan only the relevant partition.
    - Historical data can be archived/dropped by detaching partitions (Instant DROP).
    - Vacuum operations are far more efficient on smaller child tables.
- **Negative**:
    - Primary keys must include the partitioning column (e.g., `id` + `shift_date`).
    - Using `GenerationType.IDENTITY` can be complex; switching to Sequence-based IDs or UUIDs is advised for partitioned tables.

## Scaling Trigger
The current composite indexes added in Phase 2 (`restaurant_id`, `date`) provide immediate relief. Partitioning should be initiated once any single table exceeds **10 million rows** or **5GB disk space**.
