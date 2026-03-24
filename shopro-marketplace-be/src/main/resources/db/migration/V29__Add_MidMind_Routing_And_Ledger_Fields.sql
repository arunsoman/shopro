-- V29: Add midMind Routing and Ledger Fields

-- 1. Add routing status to PurchaseOrder
ALTER TABLE purchase_order ADD COLUMN routing_status VARCHAR(50) DEFAULT 'NOT_STARTED';

-- 2. Add markup and routing strategy to SubOrder
ALTER TABLE sub_order ADD COLUMN markup_amount DECIMAL(19, 4) DEFAULT 0.0000;
ALTER TABLE sub_order ADD COLUMN routing_strategy VARCHAR(100);

-- 3. Add vendor price and markup to OrderItem
ALTER TABLE order_item ADD COLUMN vendor_price_at_order DECIMAL(19, 4);
ALTER TABLE order_item ADD COLUMN markup_amount DECIMAL(19, 4) DEFAULT 0.0000;

-- 4. Add index for faster routing lookups
CREATE INDEX idx_po_routing_status ON purchase_order(routing_status);
CREATE INDEX idx_so_parent_po ON sub_order(purchase_order_id);
