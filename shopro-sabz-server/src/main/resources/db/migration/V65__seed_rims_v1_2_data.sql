-- V62: Seed data for RIMS v1.2
-- Populates locations, updates ingredient metadata, and creates sample batches for FIFO testing.

-- 1. Seed Inventory Locations
INSERT INTO inventory_location (id, name, storage_type, temperature_target, humidity_target)
VALUES
('f0000000-0000-0000-0000-000000000001', 'Walk-in Refrigerator', 'COLD', 4.0, 85.0),
('f0000000-0000-0000-0000-000000000002', 'Main Freezer', 'FROZEN', -18.0, 20.0),
('f0000000-0000-0000-0000-000000000003', 'Dry Storage Room', 'DRY', 20.0, 40.0),
('f0000000-0000-0000-0000-000000000004', 'Counter Top', 'AMBIENT', 25.0, 50.0)
ON CONFLICT (name) DO NOTHING;

-- 2. Update Raw Ingredients with v1.2 Metadata
UPDATE raw_ingredient SET 
    category = 'Proteins', 
    storage_type = 'COLD', 
    restocking_mode = 'BID',
    shelf_life_days = 7
WHERE name IN ('Ribeye Steak', 'Salmon Fillet', 'Chicken Breast');

UPDATE raw_ingredient SET 
    category = 'Dairy', 
    storage_type = 'COLD', 
    restocking_mode = 'AUTO',
    shelf_life_days = 30
WHERE name IN ('Unsalted Butter', 'Heavy Cream', 'Cheddar Cheese');

UPDATE raw_ingredient SET 
    category = 'Produce', 
    storage_type = 'COLD', 
    restocking_mode = 'MANUAL',
    daily_restock_enrolled = true,
    shelf_life_days = 5
WHERE name IN ('Romaine Lettuce', 'Asparagus', 'Tomato (roma)');

UPDATE raw_ingredient SET 
    category = 'Pantry', 
    storage_type = 'DRY', 
    restocking_mode = 'AUTO',
    shelf_life_days = 365
WHERE name IN ('Pasta (fettuccine)', 'All-Purpose Flour', 'Frying Oil');

-- 3. Create initial batches for test ingredients (FIFO validation)
-- Ribeye Steak (id: ...0001)
INSERT INTO inventory_batch (id, ingredient_id, location_id, supplier_id, batch_number, received_quantity, current_quantity, cost_at_receipt, received_date, expiry_date, status)
VALUES
('b0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'BAT-RIB-001', 100, 40, 1.35, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000002', '00000000-1000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'BAT-RIB-002', 200, 200, 1.40, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE');

-- Salmon Fillet (id: ...0002)
INSERT INTO inventory_batch (id, ingredient_id, location_id, supplier_id, batch_number, received_quantity, current_quantity, cost_at_receipt, received_date, expiry_date, status)
VALUES
('b0000000-0000-0000-0000-000000000003', '00000000-1000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'BAT-SAL-001', 50, 50, 0.98, NOW(), NOW() + INTERVAL '3 days', 'ACTIVE');
