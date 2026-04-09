-- V73__seed_rfq_test_data.sql
-- Seed data specifically for RFQIntegrationTest to resolve "Seeded bid not found" errors
-- Use DO UPDATE to ensure clean state even if database is persistent between runs

-- 1. Ensure Supplier exists
INSERT INTO supplier (id, company_name, contact_name, contact_email, version, created_at, updated_at)
VALUES ('c0000000-0000-0000-0000-000000000001', 'Global Food Systems', 'Vince Vendor', 'vendor@globalfoods.com', 0, now(), now())
ON CONFLICT (id) DO UPDATE SET 
    company_name = EXCLUDED.company_name,
    contact_name = EXCLUDED.contact_name,
    contact_email = EXCLUDED.contact_email;

-- 2. Ensure Raw Ingredient exists
INSERT INTO raw_ingredient (id, name, unit_of_measure, cost_per_unit, yield_pct, current_stock, par_level, reorder_point, safety_level, critical_level, max_stock_level, auto_replenish, restocking_mode, shelf_life_days, storage_type, version, created_at, updated_at)
VALUES ('b0000000-0000-0000-0000-000000000002', 'Test Ingredient for RFQ', 'KG', 1.50, 1.00, 10, 50, 20, 10, 5, 100, true, 'BID', 30, 'DRY', 0, now(), now())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    restocking_mode = EXCLUDED.restocking_mode,
    current_stock = EXCLUDED.current_stock;

-- 3. RFQ
INSERT INTO rfq (id, ingredient_id, required_qty, status, bid_deadline, desired_delivery_date, version, created_at, updated_at)
VALUES ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 40.00, 'OPEN', now() + interval '2 hours', current_date + 2, 0, now(), now())
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    bid_deadline = EXCLUDED.bid_deadline;

-- 4. Purchase Order for RFQ (1:1 link)
INSERT INTO purchase_order (id, rfq_id, status, po_type, total_value, version, created_at, updated_at)
VALUES ('fba9810d-5e65-4112-96ab-9831421ae582', 'e0000000-0000-0000-0000-000000000001', 'DRAFT', 'INTERNAL_PROCUREMENT', 0, 0, now(), now())
ON CONFLICT (id) DO UPDATE SET
    rfq_id = EXCLUDED.rfq_id,
    status = EXCLUDED.status;

-- 5. Bid
INSERT INTO vendor_bid (id, rfq_id, supplier_id, unit_price, quantity_available, delivery_date, status, version, created_at, updated_at)
VALUES ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 8.20, 40.00, current_date + 1, 'SUBMITTED', 0, now(), now())
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    unit_price = EXCLUDED.unit_price;

-- 6. Supplier User
INSERT INTO supplier_user (id, supplier_id, email, password_hash, full_name, role, active, created_at, updated_at, version)
VALUES ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'vendor@globalfoods.com', '$2a$10$DkWN.f8uJam5vZoSgbnr3efSfHq2z4XFahxIEsO8d.6cORf5hssUK', 'Vendor Vince', 'SUPPLIER_ADMIN', true, now(), now(), 0)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
