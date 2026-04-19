-- V7__add_supplier_payment_mode_and_preferred_supplier.sql
--
-- Adds two new columns to support supplier financials and ingredient sourcing:
--   1. supplier.payment_mode  — supplier's credit/payment terms
--   2. ingredient.preferred_supplier_id — back-links ingredient to its preferred vendor
--
-- Payment modes:
--   NET_15   — Net 15 days
--   NET_30   — Net 30 days
--   NET_60   — Net 60 days
--   COD      — Cash on Delivery
--   WIRE     — Wire Transfer in Advance
--   CARD     — Card Payment / Credit Card
--
-- Preferred supplier: each ingredient can have one preferred supplier.
-- Multiple suppliers can be entered per ingredient in real-world (competitor bidding),
-- but for seed data each ingredient maps to exactly one primary supplier.

-- ── 1. Add payment_mode to supplier ───────────────────────────────────────
ALTER TABLE supplier
  ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(20) DEFAULT 'NET_30'
                  CHECK (payment_mode IN ('NET_15','NET_30','NET_60','COD','WIRE','CARD'));

ALTER TABLE supplier
  ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(255) DEFAULT NULL;  -- free text e.g. "2% 10 Net 30"

ALTER TABLE supplier
  ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 2;

ALTER TABLE supplier
  ADD COLUMN IF NOT EXISTS minimum_order_value DECIMAL(10,2) DEFAULT 0.00;

-- ── 2. Add preferred_supplier_id to ingredient ────────────────────────────
ALTER TABLE ingredient
  ADD COLUMN IF NOT EXISTS preferred_supplier_id BIGINT DEFAULT NULL;

-- FK: preferred_supplier_id → supplier.id
-- Note: This FK is deferrable in case supplier isn't created yet during raw SQL loads.
-- Hibernate/JPA will enforce it at runtime.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_ingredient_preferred_supplier'
  ) THEN
    ALTER TABLE ingredient
      ADD CONSTRAINT fk_ingredient_preferred_supplier
      FOREIGN KEY (preferred_supplier_id)
      REFERENCES supplier(id)
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
END $$;

COMMENT ON COLUMN supplier.payment_mode IS
  'Payment terms: NET_15 | NET_30 | NET_60 | COD | WIRE | CARD';
COMMENT ON COLUMN supplier.payment_terms IS
  'Full terms description, e.g. ''2% 10 Net 30'' (2% discount if paid within 10 days, net 30)';
COMMENT ON COLUMN supplier.lead_time_days IS
  'Typical delivery lead time in business days';
COMMENT ON COLUMN supplier.minimum_order_value IS
  'Minimum dollar value per purchase order (set to 0 if no minimum)';
COMMENT ON COLUMN ingredient.preferred_supplier_id IS
  'Primary supplier for this ingredient (FK → supplier.id). Used for auto-PO generation.';

-- ── 3. Back-populate supplier payment modes for all existing suppliers ─────
--   (no-op for new installs; populates data for restaurants seeded by earlier migrations)
-- V6 (The Market Table) suppliers:
--   101: Hudson Valley Purveyors    → NET_30, 2-day lead, no min
--   102: Prime Meats NYC           → NET_15, 1-day lead, $200 min
--   103: Fresh Catch Seafood        → NET_15, 1-day lead, $300 min
--   104: Gotham Dairy Supply        → COD,    same-day/next-day, no min
--   105: Empire Dry Goods          → NET_30, 3-5 day lead, $100 min
UPDATE supplier SET payment_mode = 'NET_30', lead_time_days = 2, minimum_order_value = 0.00
WHERE id = 101;
UPDATE supplier SET payment_mode = 'NET_15', lead_time_days = 1, minimum_order_value = 200.00
WHERE id = 102;
UPDATE supplier SET payment_mode = 'NET_15', lead_time_days = 1, minimum_order_value = 300.00
WHERE id = 103;
UPDATE supplier SET payment_mode = 'COD',    lead_time_days = 1, minimum_order_value = 0.00
WHERE id = 104;
UPDATE supplier SET payment_mode = 'NET_30', lead_time_days = 4, minimum_order_value = 100.00
WHERE id = 105;

-- ── 4. Back-populate preferred_supplier_id for The Market Table ingredients ──
-- Map each ingredient to its most relevant supplier:
-- PRODUCE  → Hudson Valley Purveyors     (101)
-- MEAT/POULTRY → Prime Meats NYC         (102)
-- SEAFOOD  → Fresh Catch Seafood         (103)
-- DAIRY    → Gotham Dairy Supply         (104)
-- DRY_GOODS/GROCERY → Empire Dry Goods   (105)
UPDATE ingredient SET preferred_supplier_id = 101
WHERE restaurant_id = 3 AND category = 'PRODUCE';
UPDATE ingredient SET preferred_supplier_id = 102
WHERE restaurant_id = 3 AND category IN ('MEAT', 'POULTRY');
UPDATE ingredient SET preferred_supplier_id = 103
WHERE restaurant_id = 3 AND category = 'SEAFOOD';
UPDATE ingredient SET preferred_supplier_id = 104
WHERE restaurant_id = 3 AND category = 'DAIRY';
UPDATE ingredient SET preferred_supplier_id = 105
WHERE restaurant_id = 3 AND category IN ('DRY_GOODS', 'GROCERY_DRY_GOODS');
