-- V8__add_shelf_life_and_purchase_order_expiry.sql
--
-- Adds expiry / shelf-life tracking at three levels:
--
-- 1. ingredient.shelf_life_days  — default shelf life for this ingredient
--    (from PurchaseUnit → received → expiry; used to auto-calculate expiry_date on GRN)
--
-- 2. supplier.default_shelf_life_days  — default shelf life for orders from this vendor
--    (vendor-level default; used when ingredient.shelf_life is null)
--
-- 3. purchase_order.required_by_date   — the delivery due date
--    purchase_order_line.expiry_date   — expiry date of THIS bulk delivery for THIS line item
--    (independent per line, because different items in the same PO expire at different times)
--
-- The pattern:  expiry_date of the received stock = required_by_date + shelf_life_days
-- This lets the system alert staff to use FEFO (First Expired First Out) before stock expires.
--
-- ── 1. ingredient.shelf_life_days ───────────────────────────────────────────
ALTER TABLE ingredient
  ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER DEFAULT NULL;
COMMENT ON COLUMN ingredient.shelf_life_days IS 'Default shelf life in days for this ingredient (from receipt to expiry). Used to auto-calculate expiry_date on GRN. Null means no expiry (shelf-stable or handled outside FIFO).';

-- ── 2. supplier.default_shelf_life_days ──────────────────────────────────────
ALTER TABLE supplier
  ADD COLUMN IF NOT EXISTS default_shelf_life_days INTEGER DEFAULT NULL;
COMMENT ON COLUMN supplier.default_shelf_life_days IS 'Default shelf life in days for orders from this vendor. Used when ingredient.shelf_life_days is null. Null = no default (ingredient-level shelf life takes priority).';

-- ── 3. purchase_order.required_by_date ───────────────────────────────────────
-- New table if it does not exist (some DBs may not have it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'purchase_order'
  ) THEN
    RAISE NOTICE 'purchase_order table not found — skipping PO columns.';
  ELSE
    -- Add required_by_date if column does not already exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'purchase_order' AND column_name = 'required_by_date'
    ) THEN
      ALTER TABLE purchase_order
        ADD COLUMN required_by_date DATE DEFAULT NULL;
    END IF;
  END IF;
END $$;

-- ── 4. purchase_order_line.expiry_date ───────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'purchase_order_line'
  ) THEN
    RAISE NOTICE 'purchase_order_line table not found — skipping POL columns.';
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'purchase_order_line' AND column_name = 'expiry_date'
    ) THEN
      ALTER TABLE purchase_order_line
        ADD COLUMN expiry_date DATE DEFAULT NULL;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'purchase_order_line' AND column_name = 'quantity'
    ) THEN
      -- quantity here = the quantity on the PO line (same as ordered_qty for now,
      -- but allows tracking partial shipments vs total ordered)
      ALTER TABLE purchase_order_line
        ADD COLUMN quantity DECIMAL(12,3) DEFAULT NULL;
    END IF;
  END IF;
END $$;

-- ── 5. inventory_ingredient_ledger.expiry_date ────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_ingredient_ledger' AND column_name = 'expiry_date'
  ) THEN
    ALTER TABLE inventory_ingredient_ledger
      ADD COLUMN expiry_date DATE DEFAULT NULL;
  END IF;
END $$;

-- ── 6. Back-populate shelf_life_days for The Market Table ingredients ───────────
--
-- Realistic shelf life per ingredient (from delivery date → must-use-by date):
--
-- Category benchmarks:
--   Fresh herbs  : 3-5 days    (most fragile)
--   Seafood     : 2-3 days    (high risk)
--   Poultry     : 3-5 days
--   Meat        : 3-7 days     (red meat lasts longer than poultry)
--   Produce     : 5-7 days    (hardier than herbs/seafood)
--   Dairy       : 7-14 days   (pasteurized cream, sealed butter)
--   Dry Goods   : NULL        (shelf-stable, no expiry concern)
--
-- These are conservative shelf lives for full-service restaurant usage.
UPDATE ingredient SET shelf_life_days = 5
WHERE restaurant_id = 3 AND item_code = 'ING01';  -- Avocados (Hass): 5 days
UPDATE ingredient SET shelf_life_days = 5
WHERE restaurant_id = 3 AND item_code = 'ING02';  -- Roma Tomatoes: 5 days
UPDATE ingredient SET shelf_life_days = 7
WHERE restaurant_id = 3 AND item_code = 'ING03';  -- Yellow Onions: 7 days (dry, hardy)
UPDATE ingredient SET shelf_life_days = 3
WHERE restaurant_id = 3 AND item_code = 'ING04';  -- Fresh Arugula: 3 days (very perishable)
UPDATE ingredient SET shelf_life_days = 10
WHERE restaurant_id = 3 AND item_code = 'ING05';  -- Free-Range Eggs: 10 days
UPDATE ingredient SET shelf_life_days = 3
WHERE restaurant_id = 3 AND item_code = 'ING06';  -- Fresh Herbs: 3 days (fragile)
UPDATE ingredient SET shelf_life_days = 5
WHERE restaurant_id = 3 AND item_code = 'ING07';  -- Beef Tenderloin: 5 days
UPDATE ingredient SET shelf_life_days = 4
WHERE restaurant_id = 3 AND item_code = 'ING08';  -- Lamb Rack: 4 days
UPDATE ingredient SET shelf_life_days = 2
WHERE restaurant_id = 3 AND item_code = 'ING09';  -- Atlantic Salmon: 2 days (very perishable)
UPDATE ingredient SET shelf_life_days = 2
WHERE restaurant_id = 3 AND item_code = 'ING10';  -- Yellowfin Tuna: 2 days (sushi grade)
UPDATE ingredient SET shelf_life_days = 6
WHERE restaurant_id = 3 AND item_code = 'ING11';  -- Heritage Pork Belly: 6 days
UPDATE ingredient SET shelf_life_days = 4
WHERE restaurant_id = 3 AND item_code = 'ING12';  -- Duck Breast: 4 days
UPDATE ingredient SET shelf_life_days = 14
WHERE restaurant_id = 3 AND item_code = 'ING13';  -- Unsalted Butter: 14 days (sealed)
UPDATE ingredient SET shelf_life_days = 7
WHERE restaurant_id = 3 AND item_code = 'ING14';  -- Heavy Cream: 7 days (pasteurized)
UPDATE ingredient SET shelf_life_days = 5
WHERE restaurant_id = 3 AND item_code = 'ING15';  -- Burrata Cheese: 5 days (fresh, perishable)
-- ING16-ING20: Dry goods — shelf-stable, no expiry (leave as NULL)

-- ── 7. Back-populate supplier.default_shelf_life_days ────────────────────────
-- Each vendor's typical order frequency / delivery model:
--   101: Produce vendor — 2x/week delivery, max 5 days between orders
--   102: Meat vendor    — 3x/week delivery, max 3 days between orders
--   103: Seafood vendor — 4x/week (daily or every other day), max 2 days
--   104: Dairy vendor   — daily delivery, 2 days max between orders
--   105: Dry goods      — weekly delivery, 7 days max
UPDATE supplier SET default_shelf_life_days = 5
WHERE id = 101;  -- Hudson Valley Purveyors (PRODUCE)
UPDATE supplier SET default_shelf_life_days = 5
WHERE id = 102;  -- Prime Meats NYC (MEAT)
UPDATE supplier SET default_shelf_life_days = 2
WHERE id = 103;  -- Fresh Catch Seafood (SEAFOOD)
UPDATE supplier SET default_shelf_life_days = 2
WHERE id = 104;  -- Gotham Dairy Supply (DAIRY)
UPDATE supplier SET default_shelf_life_days = NULL
WHERE id = 105;  -- Empire Dry Goods (DRY GOODS) — shelf-stable, no expiry concern
