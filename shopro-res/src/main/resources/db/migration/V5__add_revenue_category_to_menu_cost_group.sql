-- V5__add_revenue_category_to_menu_cost_group.sql
-- Maps MenuCostGroup rows to POS revenue categories for sales-mix breakdown in Prime Cost reports.
-- Allowed values: FOOD, SOFT_BEV, LIQUOR, BEER, WINE, MERCH
-- Existing rows default to FOOD.

-- Idempotent: only add column if it doesn't exist (V0 may already have it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'menu_cost_group' AND column_name = 'revenue_category') THEN
        ALTER TABLE menu_cost_group ADD COLUMN revenue_category VARCHAR(20) NOT NULL DEFAULT 'FOOD';
    END IF;
END$$;

COMMENT ON COLUMN menu_cost_group.revenue_category IS
  'POS revenue category: FOOD, SOFT_BEV, LIQUOR, BEER, WINE, MERCH';

-- Add FK guard (future-proofing for an enum table)
-- COMMENT ON CONSTRAINT ... FROM revenue_category TO future ref_table;