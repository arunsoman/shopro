-- V22 Add Missing Fields to Orders

-- Add missing fields to purchase_order
ALTER TABLE purchase_order ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE purchase_order ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE purchase_order ADD COLUMN IF NOT EXISTS total_tax DECIMAL(19,4) DEFAULT 0;
ALTER TABLE purchase_order ADD COLUMN IF NOT EXISTS total_discount DECIMAL(19,4) DEFAULT 0;
ALTER TABLE purchase_order ADD COLUMN IF NOT EXISTS created_by_principal_id VARCHAR(50);

-- Add missing fields to sub_order
ALTER TABLE sub_order ADD COLUMN IF NOT EXISTS assignment_mode VARCHAR(50) DEFAULT 'DIRECT';
ALTER TABLE sub_order ADD COLUMN IF NOT EXISTS bid_invitation_id UUID;
ALTER TABLE sub_order ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
ALTER TABLE sub_order ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;
ALTER TABLE sub_order ADD COLUMN IF NOT EXISTS payout_status VARCHAR(50) DEFAULT 'PENDING_DELIVERY';
ALTER TABLE sub_order ADD COLUMN IF NOT EXISTS payout_transaction_id VARCHAR(255);
ALTER TABLE sub_order ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- Seed default values for new columns
UPDATE purchase_order 
SET billing_address = 'Default Billing Address', 
    special_instructions = 'None',
    total_tax = 0,
    total_discount = 0
WHERE billing_address IS NULL;

UPDATE sub_order 
SET assignment_mode = 'DIRECT',
    payout_status = 'PENDING_DELIVERY',
    shipping_address = 'Default Shipping Address'
WHERE shipping_address IS NULL;
