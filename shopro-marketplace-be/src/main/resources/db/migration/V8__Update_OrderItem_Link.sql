-- V8 Update OrderItem Link

ALTER TABLE order_item ADD COLUMN purchase_order_id UUID REFERENCES purchase_order(id);
ALTER TABLE order_item ALTER COLUMN sub_order_id DROP NOT NULL;

-- Backfill purchase_order_id from sub_order
UPDATE order_item oi
SET purchase_order_id = so.purchase_order_id
FROM sub_order so
WHERE oi.sub_order_id = so.id;

ALTER TABLE order_item ALTER COLUMN purchase_order_id SET NOT NULL;
