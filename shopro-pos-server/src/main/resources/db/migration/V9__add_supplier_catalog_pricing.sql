-- V9__add_supplier_catalog_pricing.sql
-- Adds the supplier_ingredient_pricing table for catalog imports and benchmarking (US-8.1, 8.2)

CREATE TABLE supplier_ingredient_pricing (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    unit_price NUMERIC(12,4) NOT NULL,
    vendor_sku VARCHAR(50),
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    UNIQUE(supplier_id, ingredient_id)
);

CREATE INDEX idx_sip_ingredient ON supplier_ingredient_pricing(ingredient_id);
CREATE INDEX idx_sip_supplier ON supplier_ingredient_pricing(supplier_id);
