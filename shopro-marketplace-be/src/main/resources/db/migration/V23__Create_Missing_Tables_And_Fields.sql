-- V23 Create Missing Tables and Fields

-- Missing fields in existing tables
ALTER TABLE bid_invitation ADD COLUMN IF NOT EXISTS sub_order_id UUID;
ALTER TABLE bid_invitation ADD COLUMN IF NOT EXISTS purchase_order_id UUID;

-- 1. financial_transaction
CREATE TABLE IF NOT EXISTS financial_transaction (
    id UUID PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    transaction_date TIMESTAMP WITHOUT TIME ZONE,
    amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    restaurant_id UUID REFERENCES restaurant(id),
    supplier_id UUID REFERENCES supplier(id),
    sub_order_id UUID REFERENCES sub_order(id),
    purchase_order_id UUID REFERENCES purchase_order(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 2. support_ticket
CREATE TABLE IF NOT EXISTS support_ticket (
    id UUID PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    priority VARCHAR(50),
    restaurant_id UUID REFERENCES restaurant(id),
    supplier_id UUID REFERENCES supplier(id),
    purchase_order_id UUID REFERENCES purchase_order(id),
    sub_order_id UUID REFERENCES sub_order(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 3. ticket_message
CREATE TABLE IF NOT EXISTS ticket_message (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_ticket(id),
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 4. compliance_document
CREATE TABLE IF NOT EXISTS compliance_document (
    id UUID PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    restaurant_id UUID REFERENCES restaurant(id),
    supplier_id UUID REFERENCES supplier(id),
    status VARCHAR(50) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 5. quote_item
CREATE TABLE IF NOT EXISTS quote_item (
    id UUID PRIMARY KEY,
    quote_id UUID REFERENCES quote(id),
    bid_item_id UUID REFERENCES bid_item(id),
    offered_price DECIMAL(19,4) NOT NULL,
    quantity DECIMAL(19,4) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 6. auto_reorder_rule
CREATE TABLE IF NOT EXISTS auto_reorder_rule (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurant(id),
    product_id UUID NOT NULL,
    min_threshold DECIMAL(19,4) NOT NULL,
    reorder_quantity DECIMAL(19,4) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 7. restaurant_inventory
CREATE TABLE IF NOT EXISTS restaurant_inventory (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurant(id),
    product_id UUID NOT NULL,
    current_stock DECIMAL(19,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 8. transit_event
CREATE TABLE IF NOT EXISTS transit_event (
    id UUID PRIMARY KEY,
    sub_order_id UUID NOT NULL REFERENCES sub_order(id),
    event_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 9. quality_audit
CREATE TABLE IF NOT EXISTS quality_audit (
    id UUID PRIMARY KEY,
    reference_id UUID NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    auditor_id UUID NOT NULL,
    score DECIMAL(5,2),
    findings TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 10. platform_holding
CREATE TABLE IF NOT EXISTS platform_holding (
    id UUID PRIMARY KEY,
    sub_order_id UUID NOT NULL REFERENCES sub_order(id),
    amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(50) NOT NULL,
    release_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 11. ledger_entry
CREATE TABLE IF NOT EXISTS ledger_entry (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance_after DECIMAL(19,4) NOT NULL,
    entry_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 12. seasonality_rule
CREATE TABLE IF NOT EXISTS seasonality_rule (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES category(id),
    peak_start_month INTEGER NOT NULL,
    peak_end_month INTEGER NOT NULL,
    price_multiplier DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 13. supplier_performance_sla
CREATE TABLE IF NOT EXISTS supplier_performance_sla (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    metric_name VARCHAR(255) NOT NULL,
    target_value DECIMAL(19,4) NOT NULL,
    current_value DECIMAL(19,4) NOT NULL,
    evaluation_period VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
