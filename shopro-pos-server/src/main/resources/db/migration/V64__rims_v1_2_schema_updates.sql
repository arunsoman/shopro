-- V61: Restaurant Inventory Management System (RIMS) v1.2 updates
-- Implements core schema additions for FIFO, Batch Tracking, and Bid Auction System.

-- 1. Alter raw_ingredient table
ALTER TABLE raw_ingredient 
ADD COLUMN IF NOT EXISTS restocking_mode VARCHAR(20) DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_type VARCHAR(20) DEFAULT 'AMBIENT',
ADD COLUMN IF NOT EXISTS daily_restock_enrolled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS bid_supplier_pool JSONB DEFAULT '[]';

-- 2. Alter supplier table
ALTER TABLE supplier
ADD COLUMN IF NOT EXISTS lead_time_variance DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS reliability_score DECIMAL(5,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS min_order_value DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS bid_eligible BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100),
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]';

-- 3. Create inventory_location table
CREATE TABLE IF NOT EXISTS inventory_location (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    storage_type VARCHAR(20) NOT NULL, -- COLD, DRY, AMBIENT, FROZEN
    temperature_target DECIMAL(5,2),
    humidity_target DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create inventory_batch table
CREATE TABLE IF NOT EXISTS inventory_batch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    location_id UUID REFERENCES inventory_location(id),
    supplier_id UUID REFERENCES supplier(id),
    batch_number VARCHAR(50) NOT NULL,
    received_quantity DECIMAL(12,4) NOT NULL,
    current_quantity DECIMAL(12,4) NOT NULL,
    cost_at_receipt DECIMAL(12,4) NOT NULL,
    received_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, DEPLETED, QUARANTINED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batch_expiry ON inventory_batch(expiry_date);
CREATE INDEX IF NOT EXISTS idx_batch_status ON inventory_batch(status);

-- 5. Create demand_forecast table
CREATE TABLE IF NOT EXISTS demand_forecast (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    forecast_date DATE NOT NULL,
    projected_quantity DECIMAL(12,4) NOT NULL,
    confidence_score DECIMAL(5,2),
    model_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forecast_date ON demand_forecast(forecast_date);

-- 6. Alter purchase_order to add order_type
ALTER TABLE purchase_order
ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) DEFAULT 'STANDARD'; -- STANDARD, EMERGENCY, REPLENISHMENT

-- 7. Add columns to RFQ for Auction logic
ALTER TABLE rfq
ADD COLUMN IF NOT EXISTS auction_type VARCHAR(20) DEFAULT 'REVERSE_AUCTION',
ADD COLUMN IF NOT EXISTS initiated_by VARCHAR(50), -- SYSTEM, ADMIN
ADD COLUMN IF NOT EXISTS delivery_window_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS auto_award BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_unit_price DECIMAL(12,4);

-- 8. Alter vendor_bid for Scoring
ALTER TABLE vendor_bid
ADD COLUMN IF NOT EXISTS composite_score DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS proposed_lead_time_days INTEGER,
ADD COLUMN IF NOT EXISTS quality_grade VARCHAR(20),
ADD COLUMN IF NOT EXISTS cold_chain_certified BOOLEAN DEFAULT FALSE;
