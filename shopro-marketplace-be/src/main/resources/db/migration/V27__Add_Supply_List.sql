-- V27 Add Supply List table
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
