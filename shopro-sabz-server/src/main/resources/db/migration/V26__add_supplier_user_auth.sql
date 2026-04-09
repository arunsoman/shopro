-- V26__add_supplier_user_auth.sql
-- Adds support for external Supplier Users (US-13 Supplier Portal)

CREATE TABLE supplier_user (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES supplier(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL, -- e.g., 'SUPPLIER_ADMIN', 'SUPPLIER_BIDDER', 'SUPPLIER_PLANNER'
    active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_supplier_user_email ON supplier_user(email);
CREATE INDEX idx_supplier_user_org ON supplier_user(supplier_id);

-- Add tracking to vendor_bid
ALTER TABLE vendor_bid ADD COLUMN submitted_by_id UUID REFERENCES supplier_user(id);
