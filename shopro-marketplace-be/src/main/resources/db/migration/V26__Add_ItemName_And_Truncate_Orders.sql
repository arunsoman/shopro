-- Denormalize item name into order_item for audit integrity and performance
ALTER TABLE order_item ADD COLUMN item_name VARCHAR(255);

-- Truncate all PO and Bidding related data as requested to start fresh with new schema
-- Using CASCADE to handle foreign key dependencies
TRUNCATE TABLE 
    order_item, 
    sub_order, 
    purchase_order, 
    bid_item, 
    quote, 
    bid_invitation 
CASCADE;
