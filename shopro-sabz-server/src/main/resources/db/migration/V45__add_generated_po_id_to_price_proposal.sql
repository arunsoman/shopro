-- V45__add_generated_po_id_to_price_proposal.sql
ALTER TABLE vendor_price_proposal ADD COLUMN generated_po_id UUID REFERENCES purchase_order(id);
-- Index for faster retrieval when viewing POs from proposals
CREATE INDEX idx_price_proposal_po ON vendor_price_proposal(generated_po_id);
