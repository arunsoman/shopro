-- V3 Seed Mock Data
-- Password for all users is 'password' (BCrypt: $2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU)
-- Note: The BCrypt hash below is for 'password'

-- 1. Seed Operators
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'PENDING';

INSERT INTO operator (id, email, password, full_name, role, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'amara@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Amara Okoro', 'SUPER_ADMIN', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'chen.w@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Chen Wei', 'AUDITOR', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 's.jenkins@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Sarah Jenkins', 'CATALOG_MANAGER', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'marco@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Marco Rossi', 'SUPPORT_LEAD', NOW(), NOW());

-- 2. Seed Restaurants
INSERT INTO restaurant (id, name, verification_status, created_at, updated_at) VALUES
('55555555-5555-5555-5555-555555555555', 'Al Safadi Resto', 'ACTIVE', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'Bait Al Mandi', 'ACTIVE', NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'Operation Falafel', 'ACTIVE', NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'Zou Zou Restaurant', 'ACTIVE', NOW(), NOW()),
('99999999-9999-9999-9999-999999999999', 'Nusr-Et Steakhouse', 'PENDING', NOW(), NOW());

-- 3. Seed Marketplace Buyers
INSERT INTO marketplace_buyer (id, email, password, full_name, restaurant_id, created_at, updated_at) VALUES
('b0111111-1111-1111-1111-111111111111', 'buyer@alsafadi.com', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Ahmed Safadi', '55555555-5555-5555-5555-555555555555', NOW(), NOW());

-- 4. Seed Suppliers
INSERT INTO supplier (id, name, verification_status, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Global Foods Co.', 'VERIFIED', NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Farm Fresh Dubai', 'VERIFIED', NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Elite Wholesale', 'VERIFIED', NOW(), NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Prime Cuts', 'VERIFIED', NOW(), NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Wagyu Prime', 'PENDING', NOW(), NOW());

-- 5. Seed Marketplace Suppliers
INSERT INTO marketplace_supplier (id, email, password, full_name, supplier_id, created_at, updated_at) VALUES
('a0111111-1111-1111-1111-111111111111', 'sales@globalfoods.com', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Sales Team', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW(), NOW());

-- 6. Seed Categories
INSERT INTO category (id, name, created_at, updated_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'Bio-Packaging', NOW(), NOW()),
('f2222222-2222-2222-2222-222222222222', 'Frozen', NOW(), NOW()),
('f3333333-3333-3333-3333-333333333333', 'Perishable', NOW(), NOW());

-- 7. Seed Products
INSERT INTO product (id, name, description, base_price, supplier_id, category_id, stock_status, unit, created_at, updated_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'Biodegradable Container', '500ml cornstarch based bowl', 0.45, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f1111111-1111-1111-1111-111111111111', 'IN_STOCK', 'PACK', NOW(), NOW()),
('a2222222-2222-2222-2222-222222222222', 'Frozen Chicken Wings', 'IQF 1kg pack', 15.00, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f2222222-2222-2222-2222-222222222222', 'IN_STOCK', 'KG', NOW(), NOW()),
('a3333333-3333-3333-3333-333333333333', 'Fresh Tomatoes', 'Local greenhouse Grade A', 4.20, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'f3333333-3333-3333-3333-333333333333', 'IN_STOCK', 'KG', NOW(), NOW()),
('a4444444-4444-4444-4444-444444444444', 'Wagyu Ribeye', 'A5 Grade Japanese Wagyu', 450.00, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'f3333333-3333-3333-3333-333333333333', 'IN_STOCK', 'KG', NOW(), NOW());

-- 8. Seed Purchase Orders
INSERT INTO purchase_order (id, reference_number, restaurant_id, total_amount, status, delivery_date, created_at, updated_at) VALUES
('a0111111-1111-1111-1111-100000000001', 'PO-2401', '55555555-5555-5555-5555-555555555555', 12450.00, 'PENDING', CURRENT_DATE + 2, NOW(), NOW()),
('a0222222-2222-2222-2222-100000000002', 'PO-2402', '66666666-6666-6666-6666-666666666666', 4120.00, 'COMPLETED', CURRENT_DATE - 1, NOW(), NOW()),
('a0333333-3333-3333-3333-100000000003', 'PO-2403', '77777777-7777-7777-7777-777777777777', 8900.00, 'PENDING', CURRENT_DATE + 1, NOW(), NOW()),
('a0444444-4444-4444-4444-100000000004', 'PO-2404', '88888888-8888-8888-8888-888888888888', 21050.00, 'COMPLETED', CURRENT_DATE - 3, NOW(), NOW()),
('a0555555-5555-5555-5555-100000000005', 'PO-2405', '99999999-9999-9999-9999-999999999999', 45200.00, 'PENDING', CURRENT_DATE + 5, NOW(), NOW());

-- 9. Seed Sub Orders
INSERT INTO sub_order (id, purchase_order_id, supplier_id, total_amount, status, created_at, updated_at) VALUES
('a0011111-1111-1111-1111-000000000001', 'a0111111-1111-1111-1111-100000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 12450.00, 'ACK_PENDING', NOW(), NOW()),
('a0022222-2222-2222-2222-000000000002', 'a0222222-2222-2222-2222-100000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4120.00, 'DELIVERED', NOW(), NOW());

-- 10. Seed Audit Logs
INSERT INTO audit_log (id, action, operator_user, target_module, timestamp, severity) VALUES
(gen_random_uuid(), 'Order #PO-2401 Route Modified', 'Admin (Amara)', 'Logistics', NOW() - INTERVAL '2 minutes', 'low'),
(gen_random_uuid(), 'Supplier Wagyu Prime Payout Delayed', 'System', 'Finance', NOW() - INTERVAL '15 minutes', 'high'),
(gen_random_uuid(), 'New Bid Template Published', 'Ops (Sarah)', 'Marketplace', NOW() - INTERVAL '1 hour', 'low'),
(gen_random_uuid(), 'Category Bio-Packaging Added', 'Content Admin', 'Catalog', NOW() - INTERVAL '3 hours', 'low');
