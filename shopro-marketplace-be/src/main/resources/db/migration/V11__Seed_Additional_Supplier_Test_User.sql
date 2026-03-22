-- V11 Seed Additional Supplier Test User
-- Password: 'password'
-- Hash: '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU'

INSERT INTO marketplace_supplier (id, email, password, full_name, supplier_id, enabled, created_at, updated_at)
VALUES
(gen_random_uuid(), 'vendor@harvest.internal', '$2a$10$wS8C/H6gP8zFf7qG9zXnU.zP8D5eH8YvK5v6G8m1c6j7w8qG9zXnU', 'Harvest Vendor', 'a0123456-7890-abcd-1111-0123456789ab', TRUE, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
