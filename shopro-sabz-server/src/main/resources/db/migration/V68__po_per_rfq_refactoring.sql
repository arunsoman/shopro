-- V68__po_per_rfq_refactoring.sql
-- Refactor Purchase Order to be 1:1 with RFQ and created at RFQ initiation.

-- 1. Make supplier and generator optional for initial DRAFT state
ALTER TABLE purchase_order ALTER COLUMN supplier_id DROP NOT NULL;
ALTER TABLE purchase_order ALTER COLUMN generated_by_id DROP NOT NULL;

-- 2. Add RFQ link. 
-- NOTE: UNIQUE constraint cannot be added to a partitioned table without including the partition key (id).
-- We will enforce uniqueness in the application layer and use a regular index here for performance.
ALTER TABLE purchase_order ADD COLUMN rfq_id UUID REFERENCES rfq(id);
CREATE INDEX idx_po_rfq_id ON purchase_order(rfq_id);

-- 3. Remove the legacy link from VendorBid to PurchaseOrder
-- First drop the constraint added in V67
ALTER TABLE vendor_bid DROP CONSTRAINT IF EXISTS fk_vendor_bid_generated_po;
ALTER TABLE vendor_bid DROP COLUMN IF EXISTS generated_po_id;
