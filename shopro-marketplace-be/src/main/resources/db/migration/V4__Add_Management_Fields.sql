-- V4 Add Management Fields to Restaurant and Supplier

-- Add columns to restaurant
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE restaurant ADD COLUMN category VARCHAR(50);
ALTER TABLE restaurant ADD COLUMN volume DECIMAL(19,4) DEFAULT 0;
ALTER TABLE restaurant ADD COLUMN trust_score INTEGER DEFAULT 0;
ALTER TABLE restaurant ADD COLUMN city VARCHAR(50);
ALTER TABLE restaurant ADD COLUMN members_count INTEGER DEFAULT 0;
ALTER TABLE restaurant ADD COLUMN image_url TEXT;

-- Add columns to supplier
ALTER TABLE supplier ADD COLUMN category VARCHAR(50);
ALTER TABLE supplier ADD COLUMN volume DECIMAL(19,4) DEFAULT 0;
ALTER TABLE supplier ADD COLUMN trust_score INTEGER DEFAULT 0;
ALTER TABLE supplier ADD COLUMN fulfillment_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE supplier ADD COLUMN image_url TEXT;
