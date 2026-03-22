-- V25: Add Inventory Item support to Order Item

ALTER TABLE order_item ADD COLUMN IF NOT EXISTS inventory_item_id UUID;
ALTER TABLE order_item DROP CONSTRAINT IF EXISTS fk_oi_inventory_item;
ALTER TABLE order_item ADD CONSTRAINT fk_oi_inventory_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(id);
ALTER TABLE order_item ALTER COLUMN product_id DROP NOT NULL;
