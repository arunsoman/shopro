-- V10 Seed Requested Test Users
-- Password for all: 'password' (matching common seed)

-- 1. Seed Organizations if missing
INSERT INTO restaurant (id, name, verification_status, created_at, updated_at)
VALUES ('b0123456-7890-abcd-1111-0123456789ab', 'Bistro Hub', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO supplier (id, name, verification_status, created_at, updated_at)
VALUES ('a0123456-7890-abcd-1111-0123456789ab', 'Harvest Hub', 'VERIFIED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Operators
INSERT INTO operator (id, email, password, full_name, role, enabled, created_at, updated_at) 
VALUES
(gen_random_uuid(), 'root@shopro.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Root Admin', 'SUPER_ADMIN', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'ops@shopro.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Operations Manager', 'OPS_MANAGER', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'finance@shopro.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Finance Boss', 'FINANCE_OFFICER', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'logistics@shopro.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Logistics Lead', 'PROCUREMENT_OFFICER', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'evaluator@shopro.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Bid Evaluator', 'AUDITOR', TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Marketplace Users
-- Buyer (linked to Bistro Hub)
INSERT INTO marketplace_buyer (id, email, password, full_name, restaurant_id, enabled, created_at, updated_at)
VALUES
(gen_random_uuid(), 'owner@bistro.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Bistro Owner', 'b0123456-7890-abcd-1111-0123456789ab', TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Supplier (linked to Harvest Hub)
INSERT INTO marketplace_supplier (id, email, password, full_name, supplier_id, enabled, created_at, updated_at)
VALUES
(gen_random_uuid(), 'admin@harvest.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Harvest Admin', 'a0123456-7890-abcd-1111-0123456789ab', TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
