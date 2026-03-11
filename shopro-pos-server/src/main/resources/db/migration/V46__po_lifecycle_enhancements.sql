-- V46__po_lifecycle_enhancements.sql
-- Enhancing PO for lifecycle management, audit trail, and supplier policies.

-- 1. Add traceability and counter-offer fields to purchase_order
ALTER TABLE purchase_order ADD COLUMN source_bid_id UUID;
ALTER TABLE purchase_order ADD COLUMN source_proposal_id UUID;
ALTER TABLE purchase_order ADD COLUMN counter_offer_price DECIMAL(12, 4);
ALTER TABLE purchase_order ADD COLUMN counter_offer_qty DECIMAL(12, 4);
ALTER TABLE purchase_order ADD COLUMN counter_offer_date TIMESTAMPTZ;
ALTER TABLE purchase_order ADD COLUMN counter_offer_notes TEXT;
ALTER TABLE purchase_order ADD COLUMN acknowledged_at TIMESTAMPTZ;

COMMENT ON COLUMN purchase_order.source_bid_id IS 'Link to the awarded VendorBid';
COMMENT ON COLUMN purchase_order.source_proposal_id IS 'Link to the accepted VendorPriceProposal';
COMMENT ON COLUMN purchase_order.counter_offer_price IS 'Alternative price proposed by supplier';
COMMENT ON COLUMN purchase_order.counter_offer_qty IS 'Alternative quantity proposed by supplier';
COMMENT ON COLUMN purchase_order.counter_offer_notes IS 'Supplier provided reason for counter-offer';
COMMENT ON COLUMN purchase_order.acknowledged_at IS 'Timestamp of supplier formal acknowledgment';

-- 1b. Add proposed_quantity to vendor_price_proposal
ALTER TABLE vendor_price_proposal ADD COLUMN proposed_quantity DECIMAL(12, 4);
COMMENT ON COLUMN vendor_price_proposal.proposed_quantity IS 'Quantity proposed by the supplier in the proactive proposal';

-- 2. Create PO Status History table for audit trail
CREATE TABLE po_status_history (
    id UUID PRIMARY KEY,
    po_id UUID NOT NULL REFERENCES purchase_order(id),
    from_status VARCHAR(25),
    to_status VARCHAR(25) NOT NULL,
    actor_id UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_history_po_id ON po_status_history(po_id);

-- 3. Create Supplier Policy table
CREATE TABLE supplier_policy (
    supplier_id UUID PRIMARY KEY REFERENCES supplier(id),
    auto_acknowledge BOOLEAN NOT NULL DEFAULT FALSE,
    counter_offer_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    payment_terms VARCHAR(100),
    qty_tolerance DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    price_tolerance DECIMAL(5, 2) NOT NULL DEFAULT 2.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
