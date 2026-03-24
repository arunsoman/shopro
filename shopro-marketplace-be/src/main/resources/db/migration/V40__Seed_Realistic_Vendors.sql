-- V40: Seed realistic vendors and their products with idempotency
-- 1. Insert 7 Suppliers into the 'supplier' table
INSERT INTO supplier (id, name, business_details, bank_details, verification_status, category, kyc_vetted, rating, trust_score, fulfillment_rate, vetting_date, created_at, updated_at)
VALUES 
('88888888-8888-4888-8888-888888888001', 'Green Harvest Produce', 'Specialist in organic vegetables and fresh fruits. Locally sourced from sustainable farms.', 'Bank of Agriculture, Acc: 123456789, BSB: 012-345', 'VERIFIED', 'PRODUCE', true, 5.0, 100, 1.00, NOW(), NOW(), NOW()),
('88888888-8888-4888-8888-888888888002', 'Ocean''s Best Seafood', 'Premium supplier of fresh and frozen aquatic foods. Sustainable fishing certified.', 'Coastal Marine Bank, Acc: 234567890, BSB: 234-567', 'VERIFIED', 'SEAFOOD', true, 5.0, 100, 1.00, NOW(), NOW(), NOW()),
('88888888-8888-4888-8888-888888888003', 'Prime Choice Meats', 'High-quality meat, poultry, and fresh eggs. Hormone-free and humanely raised.', 'Metropolitan Finance, Acc: 345678901, BSB: 345-678', 'VERIFIED', 'MEAT', true, 5.0, 100, 1.00, NOW(), NOW(), NOW()),
('88888888-8888-4888-8888-888888888004', 'Valley Dairy & Co', 'Regional leader in milk, cheeses, and dairy products. Farm fresh daily.', 'Farmers Mutual Bank, Acc: 456789012, BSB: 456-789', 'VERIFIED', 'DAIRY', true, 5.0, 100, 1.00, NOW(), NOW(), NOW()),
('88888888-8888-4888-8888-888888888005', 'Stone Mill Bakeries', 'Traditional baker providing premium grains, flours, and artisanal baked goods.', 'Grain Union Bank, Acc: 567890123, BSB: 567-890', 'VERIFIED', 'GRAINS', true, 5.0, 100, 1.00, NOW(), NOW(), NOW()),
('88888888-8888-4888-8888-888888888006', 'Global Spice & Pantry', 'Importer of exotic spices, quality condiments, and essential pantry oils.', 'International Commerce, Acc: 678901234, BSB: 678-901', 'VERIFIED', 'SPICES', true, 5.0, 100, 1.00, NOW(), NOW(), NOW()),
('88888888-8888-4888-8888-888888888007', 'Elite Beverage Group', 'Specialist in coffee, premium tea blends, and wholesale restaurant beverages.', 'Brewers Investment Bank, Acc: 789012345, BSB: 789-012', 'VERIFIED', 'BEVERAGES', true, 5.0, 100, 1.00, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Marketplace User Accounts for these vendors (using distinct emails as unique key for ON CONFLICT)
-- Note: marketplace_supplier doesn't have a unique constraint on email in V1, but usually it does. 
-- In this case we'll just use the ID if we can generate deterministic ones, otherwise we skip ON CONFLICT for this simple seed.
INSERT INTO marketplace_supplier (id, email, password, full_name, supplier_id, enabled, created_at, updated_at)
VALUES 
('99999999-9999-4999-9999-999999999001', 'sales@greenharvest.com', '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.', 'John Gardener', '88888888-8888-4888-8888-888888888001', true, NOW(), NOW()),
('99999999-9999-4999-9999-999999999002', 'info@oceansbest.com', '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.', 'Captain Hook', '88888888-8888-4888-8888-888888888002', true, NOW(), NOW()),
('99999999-9999-4999-9999-999999999003', 'orders@primechoice.com', '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.', 'Butch Cassidy', '88888888-8888-4888-8888-888888888003', true, NOW(), NOW()),
('99999999-9999-4999-9999-999999999004', 'contact@valleydairy.com', '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.', 'Daisy Cowley', '88888888-8888-4888-8888-888888888004', true, NOW(), NOW()),
('99999999-9999-4999-9999-999999999005', 'bakery@stonemill.com', '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.', 'Peter Pan', '88888888-8888-4888-8888-888888888005', true, NOW(), NOW()),
('99999999-9999-4999-9999-999999999006', 'pantry@globalspice.com', '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.', 'Saffron Miller', '88888888-8888-4888-8888-888888888006', true, NOW(), NOW()),
('99999999-9999-4999-9999-999999999007', 'wholesale@elitebeverages.com', '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.', 'Gus Guzzler', '88888888-8888-4888-8888-888888888007', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Supply List for all food items (exactly 3 suppliers each)
INSERT INTO supply_list (id, supplier_id, food_id, name, description, price, stock_qty, is_available, auto_response_mode, offer_count, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    s.id,
    f.id,
    f.name,
    COALESCE(f.description, 'High quality ' || f.name || ' sourced directly from our premium network.'),
    ROUND(CAST(5 + (MOD(f.id * 13, 50) + RANDOM()) AS numeric), 2),
    ROUND(CAST(250 + MOD(f.id * 17, 750) AS numeric), 2),
    true,
    true,
    (MOD(f.id, 5) + 1), -- realistic initial offer count
    NOW(),
    NOW()
FROM food f
JOIN (
    SELECT '88888888-8888-4888-8888-888888888001'::uuid as id, 0 as mod_val UNION ALL
    SELECT '88888888-8888-4888-8888-888888888002'::uuid, 1 UNION ALL
    SELECT '88888888-8888-4888-8888-888888888003'::uuid, 2 UNION ALL
    SELECT '88888888-8888-4888-8888-888888888004'::uuid, 3 UNION ALL
    SELECT '88888888-8888-4888-8888-888888888005'::uuid, 4 UNION ALL
    SELECT '88888888-8888-4888-8888-888888888006'::uuid, 5 UNION ALL
    SELECT '88888888-8888-4888-8888-888888888007'::uuid, 6
) s ON (
    MOD(f.id, 7) = s.mod_val OR
    MOD(f.id + 2, 7) = s.mod_val OR
    MOD(f.id + 4, 7) = s.mod_val
)
ON CONFLICT (supplier_id, food_id) DO NOTHING;
