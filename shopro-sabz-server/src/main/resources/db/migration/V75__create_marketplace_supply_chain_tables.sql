-- V75__create_marketplace_supply_chain_tables.sql
-- Consolidate missing marketplace tables and fields from disconnected migrations

-- 1. category (Marketplace specific)
CREATE TABLE IF NOT EXISTS category (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    restaurant_id UUID,
    created_by_id UUID,
    parent_category_id UUID REFERENCES category(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 2. supply_list
CREATE TABLE IF NOT EXISTS supply_list (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    food_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(19,4),
    offer_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    stock_qty DOUBLE PRECISION DEFAULT 0.0,
    auto_response_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    UNIQUE(supplier_id, food_id)
);

-- 3. sub_order
CREATE TABLE IF NOT EXISTS sub_order (
    id UUID PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_order(id),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    total_amount DECIMAL(19,4),
    status VARCHAR(50) DEFAULT 'ACK_PENDING',
    assignment_mode VARCHAR(50) DEFAULT 'DIRECT',
    bid_invitation_id UUID,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    payout_status VARCHAR(50) DEFAULT 'PENDING_DELIVERY',
    payout_transaction_id VARCHAR(255),
    shipping_address TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 4. bid_invitation
CREATE TABLE IF NOT EXISTS bid_invitation (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES category(id),
    restaurant_id UUID,
    deadline TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    urgency VARCHAR(50) DEFAULT 'NORMAL',
    purchase_order_id UUID REFERENCES purchase_order(id),
    sub_order_id UUID REFERENCES sub_order(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 5. bid_item
CREATE TABLE IF NOT EXISTS bid_item (
    id UUID PRIMARY KEY,
    bid_invitation_id UUID NOT NULL REFERENCES bid_invitation(id),
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(19,4) NOT NULL,
    unit VARCHAR(50),
    target_price DECIMAL(19,4),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 6. quote
CREATE TABLE IF NOT EXISTS quote (
    id UUID PRIMARY KEY,
    bid_invitation_id UUID NOT NULL REFERENCES bid_invitation(id),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    total_amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    valid_until TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 7. quote_item
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

-- 8. financial_transaction
CREATE TABLE IF NOT EXISTS financial_transaction (
    id UUID PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    transaction_date TIMESTAMP WITHOUT TIME ZONE,
    amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    type VARCHAR(50) NOT NULL,
    restaurant_id UUID,
    supplier_id UUID REFERENCES supplier(id),
    sub_order_id UUID REFERENCES sub_order(id),
    purchase_order_id UUID REFERENCES purchase_order(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 9. invoice (Marketplace specific)
CREATE TABLE IF NOT EXISTS invoice (
    id UUID PRIMARY KEY,
    sub_order_id UUID NOT NULL REFERENCES sub_order(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(50) DEFAULT 'UNPAID',
    due_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 10. audit_log (Marketplace specific)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    performed_by VARCHAR(255),
    target VARCHAR(255),
    severity VARCHAR(50) DEFAULT 'LOW',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 11. auto_reorder_rule
CREATE TABLE IF NOT EXISTS auto_reorder_rule (
    id UUID PRIMARY KEY,
    restaurant_id UUID NOT NULL,
    product_id UUID NOT NULL,
    min_threshold DECIMAL(19,4) NOT NULL,
    reorder_quantity DECIMAL(19,4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 12. compliance_document
CREATE TABLE IF NOT EXISTS compliance_document (
    id UUID PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    restaurant_id UUID,
    supplier_id UUID REFERENCES supplier(id),
    status VARCHAR(50) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 13. support_ticket
CREATE TABLE IF NOT EXISTS support_ticket (
    id UUID PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    priority VARCHAR(50),
    restaurant_id UUID,
    supplier_id UUID REFERENCES supplier(id),
    purchase_order_id UUID REFERENCES purchase_order(id),
    sub_order_id UUID REFERENCES sub_order(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 14. ticket_message
CREATE TABLE IF NOT EXISTS ticket_message (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_ticket(id),
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 15. platform_holding
CREATE TABLE IF NOT EXISTS platform_holding (
    id UUID PRIMARY KEY,
    sub_order_id UUID NOT NULL REFERENCES sub_order(id),
    amount DECIMAL(19,4) NOT NULL,
    status VARCHAR(50) NOT NULL,
    release_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 16. ledger_entry
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

-- 17. seasonality_rule
CREATE TABLE IF NOT EXISTS seasonality_rule (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES category(id),
    peak_start_month INTEGER NOT NULL,
    peak_end_month INTEGER NOT NULL,
    price_multiplier DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 18. supplier_performance_sla
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

-- 19. Update purchase_order
ALTER TABLE purchase_order 
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'NOT_REQUIRED',
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS total_tax NUMERIC(19, 4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_discount NUMERIC(19, 4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by_principal_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'MANUAL';

-- 20. Update order_item (Marketplace fields)
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS sub_order_id UUID REFERENCES sub_order(id);
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS inventory_item_id UUID;
ALTER TABLE order_item ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);
ALTER TABLE order_item ALTER COLUMN menu_item_id DROP NOT NULL;

-- 21. TRUNCATE as per V26 to ensure clean state
TRUNCATE TABLE 
    order_item, 
    sub_order, 
    purchase_order, 
    bid_item, 
    quote, 
    bid_invitation 
CASCADE;
