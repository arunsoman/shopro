-- V27__seed_supplier_users.sql
-- Seed data for testing Supplier Portal auth (Pass: supplier123)

INSERT INTO supplier_user (id, supplier_id, email, password_hash, full_name, role, active, created_at, updated_at, version)
VALUES
(
    '10000000-0000-0000-0000-000000000001', 
    'c0000000-0000-0000-0000-000000000001', -- Global Food Systems
    'bob@globalfoods.com', 
    '$2a$10$jcAC0Tsw2GDKi14mNLuoTuTNibrFbO1EyTlfZa3VCSv9iw6NSOyJK', -- 'supplier123' hash
    'Bob Bidder', 
    'SUPPLIER_BIDDER', 
    true, 
    NOW(), 
    NOW(), 
    0
);
