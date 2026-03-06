-- V11__seed_inventory_suppliers.sql
-- ══════════════════════════════════════════════════════════════════
-- 1. DEFAULT SUPPLIER
-- ══════════════════════════════════════════════════════════════════
INSERT INTO supplier (id, company_name, contact_name, contact_email, contact_phone, lead_time_days, vendor_rating, created_at, updated_at, version)
VALUES ('c0000000-0000-0000-0000-000000000001', 'Global Food Systems', 'John Doe', 'john@globalfoods.com', '+1-555-0101', 1, 88.00, NOW(), NOW(), 0)
ON CONFLICT (id) DO NOTHING;
