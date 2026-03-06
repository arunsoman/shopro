-- V19__optimize_inventory_schema.sql
-- Implements robust partitioning for transactional tables and optimized indexing.
-- NOTE: Skip partitioning for raw_ingredient to preserve UNIQUE(name) constraint.

BEGIN;

--------------------------------------------------------------------------------
-- 0. Drop Dependent Foreign Keys
--------------------------------------------------------------------------------

-- Foreign keys pointing to purchase_order
ALTER TABLE purchase_order_line DROP CONSTRAINT IF EXISTS purchase_order_line_purchase_order_id_fkey;
ALTER TABLE goods_receipt_note DROP CONSTRAINT IF EXISTS goods_receipt_note_purchase_order_id_fkey;
ALTER TABLE vendor_invoice DROP CONSTRAINT IF EXISTS vendor_invoice_purchase_order_id_fkey;

-- Foreign keys pointing to inventory_transaction
-- (None)

--------------------------------------------------------------------------------
-- 1. inventory_transaction (Range Partitioning by transacted_at)
--------------------------------------------------------------------------------

ALTER TABLE inventory_transaction RENAME TO inventory_transaction_old;

-- Drop foreign key to raw_ingredient from old table to avoid confusion
ALTER TABLE inventory_transaction_old DROP CONSTRAINT IF EXISTS inventory_transaction_ingredient_id_fkey;

CREATE TABLE inventory_transaction (
    id UUID NOT NULL,
    ingredient_id UUID NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    quantity_delta NUMERIC(12,4) NOT NULL,
    unit_cost_at_time NUMERIC(10,4),
    reason VARCHAR(256),
    reference_id UUID,
    metadata JSONB,
    created_by_id UUID,
    transacted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    PRIMARY KEY (id, transacted_at)
) PARTITION BY RANGE (transacted_at);

-- Create partitions
CREATE TABLE inventory_transaction_y2024 PARTITION OF inventory_transaction
    FOR VALUES FROM ('2024-01-01 00:00:00+00') TO ('2025-01-01 00:00:00+00');

CREATE TABLE inventory_transaction_y2025 PARTITION OF inventory_transaction
    FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');

CREATE TABLE inventory_transaction_y2026 PARTITION OF inventory_transaction
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

INSERT INTO inventory_transaction SELECT * FROM inventory_transaction_old;
DROP TABLE inventory_transaction_old;

CREATE INDEX idx_inv_trans_brin ON inventory_transaction USING BRIN (transacted_at);
CREATE INDEX idx_inv_trans_ingredient ON inventory_transaction (ingredient_id);

--------------------------------------------------------------------------------
-- 2. purchase_order (Hash Partitioning by id)
--------------------------------------------------------------------------------

ALTER TABLE purchase_order RENAME TO purchase_order_old;

-- Drop foreign keys from old table
ALTER TABLE purchase_order_old DROP CONSTRAINT IF EXISTS fk_po_supplier;
ALTER TABLE purchase_order_old DROP CONSTRAINT IF EXISTS fk_po_generated_by;

CREATE TABLE purchase_order (
    id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    generated_by_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    total_value NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    expected_delivery_date DATE,
    approved_by_id UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE purchase_order_p0 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE purchase_order_p1 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE purchase_order_p2 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE purchase_order_p3 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 3);

INSERT INTO purchase_order SELECT * FROM purchase_order_old;
DROP TABLE purchase_order_old;

CREATE INDEX idx_po_status_created ON purchase_order (status, created_at);
CREATE INDEX idx_po_supplier ON purchase_order (supplier_id);

--------------------------------------------------------------------------------
-- 3. raw_ingredient Optimized Indexes (No Partitioning to preserve UNIQUE name)
--------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ingredient_stock_valuation ON raw_ingredient (current_stock, cost_per_unit);
CREATE INDEX IF NOT EXISTS idx_ingredient_supplier ON raw_ingredient (supplier_id);

--------------------------------------------------------------------------------
-- 4. Restore Foreign Keys
--------------------------------------------------------------------------------

-- inventory_transaction -> raw_ingredient
ALTER TABLE inventory_transaction 
    ADD CONSTRAINT fk_inv_trans_ingredient FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);

-- purchase_order -> supplier & staff
ALTER TABLE purchase_order 
    ADD CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(id),
    ADD CONSTRAINT fk_po_generated_by FOREIGN KEY (generated_by_id) REFERENCES staff_member(id);

-- purchase_order_line -> purchase_order & raw_ingredient
ALTER TABLE purchase_order_line 
    ADD CONSTRAINT fk_po_line_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_po_line_ingredient FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);

-- goods_receipt_note -> purchase_order
ALTER TABLE goods_receipt_note 
    ADD CONSTRAINT fk_grn_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);

-- vendor_invoice -> purchase_order
ALTER TABLE vendor_invoice 
    ADD CONSTRAINT fk_vendor_invoice_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);

COMMIT;
