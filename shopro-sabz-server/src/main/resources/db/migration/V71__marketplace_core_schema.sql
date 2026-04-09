-- V71: Marketplace Core Schema

-- 1. Masked Identity table for anonymity
CREATE TABLE masked_identity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_id UUID NOT NULL UNIQUE,
    masked_id VARCHAR(20) NOT NULL UNIQUE,
    category VARCHAR(20) NOT NULL, -- BUYER, SELLER, ORDER
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_masked_id ON masked_identity(masked_id);

-- 2. Marketplace Users (Buyers and Sellers)
CREATE TABLE marketplace_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- MARKETPLACE_BUYER, MARKETPLACE_SELLER, PLATFORM_ADMIN
    associated_entity_id UUID, -- Restaurant ID for Buyers, Supplier ID for Sellers
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Platform Transaction Ledger
CREATE TABLE platform_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL,
    total_captured_amount DECIMAL(12, 4) NOT NULL DEFAULT 0,
    supplier_payout_amount DECIMAL(12, 4) NOT NULL DEFAULT 0,
    fee_amount DECIMAL(12, 4) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL, -- CAPTURED, ESCROW, DISBURSED, REFUNDED
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_tx_po ON platform_transaction(po_id);

-- 4. Extend Purchase Order for Facilitator logic
ALTER TABLE purchase_order ADD COLUMN po_type VARCHAR(30) DEFAULT 'INTERNAL_PROCUREMENT';
ALTER TABLE purchase_order ADD COLUMN related_po_id UUID;
ALTER TABLE purchase_order ADD COLUMN platform_tx_id UUID;
ALTER TABLE purchase_order ADD COLUMN restaurant_id UUID;

-- 4.1 Extend RFQ for Facilitator logic
ALTER TABLE rfq ADD COLUMN restaurant_id UUID;

-- 5. Logistics & Transit Events
CREATE TABLE transit_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL,
    event_type VARCHAR(30) NOT NULL, -- PICKED_UP, HUB_RECEIVED, HUB_INSPECTED, HUB_DISPATCHED, DELIVERED
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location_desc TEXT,
    evidence_images JSONB,
    inspected_by UUID, -- PlatformUser ID
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_transit_po ON transit_event(po_id);

-- 6. Quality Audit
CREATE TABLE quality_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED
    auditor_notes TEXT,
    inspected_at TIMESTAMPTZ,
    inspected_by UUID,
    version BIGINT NOT NULL DEFAULT 0
);
