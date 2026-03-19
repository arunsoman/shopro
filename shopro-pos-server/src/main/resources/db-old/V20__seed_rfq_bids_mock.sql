-- V20__seed_rfq_bids_mock.sql
-- Test Supplier User
INSERT INTO supplier_user (id, supplier_id, email, password_hash, full_name, role, active, created_at, updated_at, version)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'vendor@globalfoods.com', '$2a$10$DkWN.f8uJam5vZoSgbnr3efSfHq2z4XFahxIEsO8d.6cORf5hssUK', 'Vendor Vince', 'SUPPLIER_ADMIN', true, now(), now(), 0);

-- RFQs for low stock ingredients
INSERT INTO rfq (id, ingredient_id, required_qty, status, bid_deadline, desired_delivery_date, version, created_at, updated_at)
VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 40.00, 'OPEN', now() + interval '2 hours', current_date + 2, 0, now(), now()),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 80.00, 'OPEN', now() + interval '2 hours', current_date + 2, 0, now(), now());

-- Bids for the first RFQ
INSERT INTO vendor_bid (id, rfq_id, supplier_id, unit_price, quantity_available, delivery_date, status, version, created_at, updated_at)
VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 8.20, 40.00, current_date + 1, 'SUBMITTED', 0, now(), now());
