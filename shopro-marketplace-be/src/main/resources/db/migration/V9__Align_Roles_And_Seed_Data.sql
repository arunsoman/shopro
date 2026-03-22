-- V9 Align Roles and Seed Building Blocks

-- 1. Remove old mock operators to avoid role mismatch if any (optional but safer for dev)
DELETE FROM operator WHERE email IN ('amara@shopro.ae', 'chen.w@shopro.ae', 's.jenkins@shopro.ae', 'marco@shopro.ae');

-- 2. Seed 7 Operators (one for each role)
-- Password: 'password'
INSERT INTO operator (id, email, password, full_name, role, enabled, created_at, updated_at) VALUES
(gen_random_uuid(), 'admin@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Super Admin User', 'SUPER_ADMIN', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'ops@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Ops Manager User', 'OPS_MANAGER', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'procurement@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Procurement Officer', 'PROCUREMENT_OFFICER', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'finance@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Finance Officer', 'FINANCE_OFFICER', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'relations@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Supplier Relations', 'SUPPLIER_RELATIONS', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'support@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Support Agent', 'SUPPORT_AGENT', TRUE, NOW(), NOW()),
(gen_random_uuid(), 'auditor@shopro.ae', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Platform Auditor', 'AUDITOR', TRUE, NOW(), NOW());

-- 3. Seed 7 Primary Marketplace Categories
-- Ensure they don't already exist or just add new ones
INSERT INTO category (id, name, created_at, updated_at) VALUES
(gen_random_uuid(), 'Produce', NOW(), NOW()),
(gen_random_uuid(), 'Dairy', NOW(), NOW()),
(gen_random_uuid(), 'Dry Goods', NOW(), NOW()),
(gen_random_uuid(), 'Meat & Seafood', NOW(), NOW()),
(gen_random_uuid(), 'Beverages', NOW(), NOW()),
(gen_random_uuid(), 'Packaging', NOW(), NOW()),
(gen_random_uuid(), 'Other', NOW(), NOW());
