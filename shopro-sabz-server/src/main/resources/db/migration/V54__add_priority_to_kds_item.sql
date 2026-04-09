-- Add priority column to kds_ticket_item table
ALTER TABLE kds_ticket_item ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;

-- Add index for priority-based sorting in Expo/Station views
CREATE INDEX idx_kds_item_priority ON kds_ticket_item(priority);
