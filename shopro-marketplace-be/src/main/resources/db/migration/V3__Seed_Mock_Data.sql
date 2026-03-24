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

