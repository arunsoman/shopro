-- V6 Add SKU and Stock to Product

ALTER TABLE product ADD COLUMN sku VARCHAR(50);
ALTER TABLE product ADD COLUMN stock_quantity INTEGER DEFAULT 0;

-- Update existing data
UPDATE product SET sku = 'SKU-' || substring(id::text, 1, 8);
