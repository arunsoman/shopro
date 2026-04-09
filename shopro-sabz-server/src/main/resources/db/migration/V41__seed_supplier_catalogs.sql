-- V41__seed_supplier_catalogs.sql
-- Seeds the supplier_ingredient_pricing table for Global Food Systems
-- This ensures the supplier portal shows relevant data in the demo.

INSERT INTO supplier_ingredient_pricing (id, supplier_id, ingredient_id, unit_price, vendor_sku, last_updated_at, created_at, updated_at, version)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001', -- Global Food Systems
    '00000000-1000-0000-0000-000000000002', -- Salmon Fillet
    0.9500, -- Custom contract price (standard is 0.98)
    'GFS-SAL-001',
    NOW(),
    NOW(),
    NOW(),
    0
),
(
    'e0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001', -- Global Food Systems
    '00000000-1000-0000-0000-000000000001', -- Ribeye Steak
    1.3200, -- Custom contract price (standard is 1.35)
    'GFS-BEEF-RIB',
    NOW(),
    NOW(),
    NOW(),
    0
)
ON CONFLICT (supplier_id, ingredient_id) DO NOTHING;
