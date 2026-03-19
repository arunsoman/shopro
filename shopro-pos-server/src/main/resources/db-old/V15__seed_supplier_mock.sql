-- V15__seed_supplier_mock.sql
INSERT INTO supplier (id, company_name, contact_name, contact_email, contact_phone, lead_time_days, created_at, updated_at, version, vendor_rating, lead_time_variance, reliability_score, min_order_value, bid_eligible, payment_terms)
VALUES
('c0000000-0000-0000-0000-000000000001', 'Global Food Systems', 'John Doe', 'john@globalfoods.com', '+1-555-0101', 1, '2026-03-13T16:54:47.696Z', '2026-03-13T16:54:47.696Z', 0, 88.00, 0.00, 100.00, 0.00, true, NULL)
ON CONFLICT (id) DO NOTHING;
