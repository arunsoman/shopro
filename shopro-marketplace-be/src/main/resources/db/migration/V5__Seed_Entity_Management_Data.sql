-- V5 Seed More Mock Data for Management Screens

-- More Restaurants
INSERT INTO restaurant (id, name, category, volume, verification_status, trust_score, city, members_count, image_url, created_at, updated_at) VALUES
('02222222-2222-2222-2222-222222222222', 'The Urban Bean', 'Cafe', 240500.00, 'ACTIVE', 98, 'Dubai', 4, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', NOW(), NOW()),
('03333333-3333-3333-3333-333333333333', 'Salt Waterfront', 'Casual Dining', 512200.00, 'ACTIVE', 92, 'Dubai', 12, 'https://images.unsplash.com/photo-1552566626-52f8b828add9', NOW(), NOW()),
('04444444-4444-4444-4444-444444444444', 'Fire & Ice Grill', 'Fine Dining', 1200000.00, 'SUSPENDED', 64, 'Abu Dhabi', 24, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', NOW(), NOW()),
('05555555-5555-5555-5555-555555555555', 'Pops & Hops', 'Bistro', 82100.00, 'PENDING', 0, 'Sharjah', 2, 'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72', NOW(), NOW());

-- More Suppliers
INSERT INTO supplier (id, name, category, volume, verification_status, trust_score, fulfillment_rate, image_url, created_at, updated_at) VALUES
('a2222222-2222-2222-2222-222222222222', 'Global Coffee Traders', 'Beverages', 1400000.00, 'VERIFIED', 99, 99.8, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', NOW(), NOW()),
('a3333333-3333-3333-3333-333333333333', 'Fresh Dairy Solutions', 'Dairy', 840500.00, 'VERIFIED', 94, 96.2, 'https://images.unsplash.com/photo-1563636619-e910cf493996', NOW(), NOW()),
('a4444444-4444-4444-4444-444444444444', 'Prime Meat Co.', 'Provisions', 320100.00, 'PENDING', 0, 0, 'https://images.unsplash.com/photo-1551028150-64b9f398f678', NOW(), NOW()),
('a5555555-5555-5555-5555-555555555555', 'Baker''s Secret', 'Pantry', 120400.00, 'VERIFIED', 88, 84.5, 'https://images.unsplash.com/photo-1509440159596-0249088772ff', NOW(), NOW());
