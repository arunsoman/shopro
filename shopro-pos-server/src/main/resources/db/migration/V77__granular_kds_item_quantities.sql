-- Add granular quantity fields to kds_ticket_item for "Quantity-Status Matrix"
ALTER TABLE kds_ticket_item 
ADD COLUMN total_quantity INTEGER NOT NULL DEFAULT 1,
ADD COLUMN quantity_pending INTEGER NOT NULL DEFAULT 0,
ADD COLUMN quantity_cooking INTEGER NOT NULL DEFAULT 0,
ADD COLUMN quantity_ready INTEGER NOT NULL DEFAULT 0,
ADD COLUMN quantity_served INTEGER NOT NULL DEFAULT 0;

-- Sync existing data (assume all current items are either pending or ready based on status)
-- We use status since that was the old truth.
UPDATE kds_ticket_item 
SET 
  total_quantity = 1,
  quantity_pending = CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END,
  quantity_cooking = CASE WHEN status = 'COOKING' THEN 1 ELSE 0 END,
  quantity_ready = CASE WHEN status = 'READY' THEN 1 ELSE 0 END,
  quantity_served = CASE WHEN status = 'SERVED' THEN 1 ELSE 0 END;
