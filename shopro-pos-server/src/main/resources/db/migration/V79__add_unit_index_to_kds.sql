-- V79: Add unit_index to kds_ticket_item for independent unit tracking
ALTER TABLE kds_ticket_item ADD COLUMN unit_index INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN kds_ticket_item.unit_index IS 'Tracks which specific unit of the OrderItem this record represents (1-indexed).';
