-- V12 Expansion for Marketplace Marketplace Portal Tests
-- Focus: Bid Invitations, Quotes (Signal Matrix), Finance Ledger, and Fulfillment Trajectories

-- 0. Ensure Required Categories Exist (Resilience against version conflicts)
INSERT INTO category (id, name, created_at, updated_at)
SELECT gen_random_uuid(), 'Dairy', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Dairy');

INSERT INTO category (id, name, created_at, updated_at)
SELECT gen_random_uuid(), 'Beverages', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Beverages');

INSERT INTO category (id, name, created_at, updated_at)
SELECT gen_random_uuid(), 'Other', NOW(), NOW() WHERE NOT EXISTS (SELECT 1 FROM category WHERE name = 'Other');

-- 1. Create a Primary Bid Invitation (Visible in Supplier Portal & Operator)
INSERT INTO bid_invitation (id, title, description, category_id, deadline, status, urgency, created_at, updated_at)
VALUES 
('d0000000-0000-0000-0000-000000000001', 'Dairy Supply - Q2', 'Quarterly bulk procurement for dairy nodes alpha.', (SELECT id FROM category WHERE name = 'Dairy' LIMIT 1), NOW() + INTERVAL '2 days', 'ACTIVE', 'HIGH', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO bid_item (id, bid_invitation_id, product_name, quantity, unit, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'Whole Milk V3', 1000, 'L', NOW(), NOW()),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'Unsalted Butter', 200, 'KG', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Mock Quotes/Bids (Signal Matrix - Needs at least 3 for TC-OB-003)
INSERT INTO quote (id, bid_invitation_id, supplier_id, total_amount, status, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', 'a0123456-7890-abcd-1111-0123456789ab', 12450.00, 'SUBMITTED', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', (SELECT id FROM supplier WHERE id != 'a0123456-7890-abcd-1111-0123456789ab' LIMIT 1), 11800.00, 'SUBMITTED', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), 'd0000000-0000-0000-0000-000000000001', (SELECT id FROM supplier WHERE id NOT IN ('a0123456-7890-abcd-1111-0123456789ab', (SELECT id FROM supplier WHERE id != 'a0123456-7890-abcd-1111-0123456789ab' LIMIT 1)) LIMIT 1), 13100.00, 'SUBMITTED', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

-- 3. Diverse Stock Products (Catalog Management)
INSERT INTO product (id, name, description, category_id, supplier_id, unit, base_price, stock_status, stock_quantity, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'Specialty Coffee Beans', 'Artisanal roasted beans node.', (SELECT id FROM category WHERE name = 'Beverages' LIMIT 1), 'a0123456-7890-abcd-1111-0123456789ab', 'KG', 45.00, 'LOW_STOCK', 5, NOW(), NOW()),
(gen_random_uuid(), 'Organic Flour Alpha', 'Grain-based signal core.', (SELECT id FROM category WHERE name = 'Other' LIMIT 1), 'a0123456-7890-abcd-1111-0123456789ab', 'PACK', 8.50, 'OUT_OF_STOCK', 0, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Fulfillment Trajectories (Live Tracking)
INSERT INTO purchase_order (id, reference_number, restaurant_id, total_amount, status, delivery_date, created_at, updated_at)
VALUES 
('e0000000-0000-0000-0000-000000000001', 'PO-9921', 'b0123456-7890-abcd-1111-0123456789ab', 12450.00, 'SHIPPED', CURRENT_DATE, NOW(), NOW()),
('e0000000-0000-0000-0000-000000000002', 'PO-9922', 'b0123456-7890-abcd-1111-0123456789ab', 4120.00, 'DELIVERED', CURRENT_DATE - 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO sub_order (id, purchase_order_id, supplier_id, total_amount, status, created_at, updated_at)
VALUES 
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'a0123456-7890-abcd-1111-0123456789ab', 12450.00, 'SHIPPED', NOW(), NOW()),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'a0123456-7890-abcd-1111-0123456789ab', 4120.00, 'DELIVERED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Financial Ledger (Invoices)
INSERT INTO invoice (id, sub_order_id, amount, status, issue_date, due_date, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'f0000000-0000-0000-0000-000000000002', 4120.00, 'PAID', CURRENT_DATE - 5, CURRENT_DATE - 5, NOW(), NOW()),
(gen_random_uuid(), 'f0000000-0000-0000-0000-000000000001', 12450.00, 'PENDING', CURRENT_DATE, CURRENT_DATE + 7, NOW(), NOW())
ON CONFLICT DO NOTHING;
