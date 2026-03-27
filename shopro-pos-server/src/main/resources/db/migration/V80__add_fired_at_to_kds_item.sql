-- V80: Add fired_at to kds_ticket_item for perfect unit identity matching
ALTER TABLE kds_ticket_item ADD COLUMN fired_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN kds_ticket_item.fired_at IS 'Timestamp when this specific unit was fired from the POS (high-resolution).';

-- Index for the composite search (id, index, fired_at) used during decrement
CREATE INDEX idx_kds_ticket_item_identity ON kds_ticket_item (order_item_id, unit_index, fired_at);
