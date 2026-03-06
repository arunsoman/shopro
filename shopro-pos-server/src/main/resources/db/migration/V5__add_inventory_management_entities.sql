-- V5__add_inventory_management_entities.sql
-- Adds missing entities and fields for advanced Inventory Management (Epics 8-15)

-- 1. Updates to raw_ingredient
ALTER TABLE raw_ingredient 
    ADD COLUMN safety_level NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    ADD COLUMN critical_level NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    ADD COLUMN max_stock_level NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    ADD COLUMN auto_replenish BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. New Table: raw_ingredient_allergen
CREATE TABLE raw_ingredient_allergen (
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id) ON DELETE CASCADE,
    allergen VARCHAR(30) NOT NULL,
    PRIMARY KEY (ingredient_id, allergen)
);

-- 3. Updates to supplier
ALTER TABLE supplier
    ADD COLUMN vendor_rating NUMERIC(5,2) NOT NULL DEFAULT 70.00;

-- 4. New Table: sub_recipe
CREATE TABLE sub_recipe (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    yield_quantity NUMERIC(12,4) NOT NULL,
    unit_of_measure VARCHAR(30) NOT NULL,
    cost_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- 5. New Table: batch_record
CREATE TABLE batch_record (
    id UUID PRIMARY KEY,
    sub_recipe_id UUID NOT NULL REFERENCES sub_recipe(id),
    produced_qty NUMERIC(12,4) NOT NULL,
    remaining_qty NUMERIC(12,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    produced_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_at TIMESTAMP WITH TIME ZONE,
    notes VARCHAR(500),
    produced_by_id UUID NOT NULL REFERENCES staff_member(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_batch_subrecipe_status ON batch_record(sub_recipe_id, status);
CREATE INDEX idx_batch_expiry ON batch_record(expiry_at);

-- 6. New Table: rfq
CREATE TABLE rfq (
    id UUID PRIMARY KEY,
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    required_qty NUMERIC(12,4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    desired_delivery_date DATE NOT NULL,
    bid_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_rfq_ingredient ON rfq(ingredient_id);
CREATE INDEX idx_rfq_status ON rfq(status);

-- 7. New Table: vendor_bid
CREATE TABLE vendor_bid (
    id UUID PRIMARY KEY,
    rfq_id UUID NOT NULL REFERENCES rfq(id),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    unit_price NUMERIC(10,4) NOT NULL,
    quantity_available NUMERIC(12,4) NOT NULL,
    delivery_date DATE NOT NULL,
    payment_terms VARCHAR(100),
    notes VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_vendor_bid_rfq ON vendor_bid(rfq_id);
CREATE INDEX idx_vendor_bid_supplier ON vendor_bid(supplier_id);

-- 8. Updates to purchase_order 
ALTER TABLE purchase_order
    ADD COLUMN total_value NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    ADD COLUMN expected_delivery_date DATE,
    ADD COLUMN approved_by_id UUID REFERENCES staff_member(id),
    ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- 9. Updates to purchase_order_line
ALTER TABLE purchase_order_line
    ADD COLUMN invoice_unit_price NUMERIC(10,4);

-- 10. New Table: goods_receipt_note
CREATE TABLE goods_receipt_note (
    id UUID PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_order(id),
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    received_by_id UUID NOT NULL REFERENCES staff_member(id),
    delivery_note_reference VARCHAR(100),
    notes VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_grn_po ON goods_receipt_note(purchase_order_id);

-- 11. New Table: goods_receipt_note_line
CREATE TABLE goods_receipt_note_line (
    id UUID PRIMARY KEY,
    goods_receipt_note_id UUID NOT NULL REFERENCES goods_receipt_note(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    received_qty NUMERIC(12,4) NOT NULL,
    damaged_qty NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_grn_line_grn ON goods_receipt_note_line(goods_receipt_note_id);
CREATE INDEX idx_grn_line_ingredient ON goods_receipt_note_line(ingredient_id);

-- 12. New Table: vendor_invoice
CREATE TABLE vendor_invoice (
    id UUID PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_order(id),
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    invoice_date DATE NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount NUMERIC(12,4) NOT NULL,
    tax_amount NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_vendor_invoice_po ON vendor_invoice(purchase_order_id);

-- 13. New Table: vendor_invoice_line
CREATE TABLE vendor_invoice_line (
    id UUID PRIMARY KEY,
    vendor_invoice_id UUID NOT NULL REFERENCES vendor_invoice(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    invoiced_qty NUMERIC(12,4) NOT NULL,
    unit_price NUMERIC(10,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_invoice_line_invoice ON vendor_invoice_line(vendor_invoice_id);
CREATE INDEX idx_invoice_line_ingredient ON vendor_invoice_line(ingredient_id);
