-- V10__preferred_vendor_mapping.sql
-- ══════════════════════════════════════════════════════════════════════════
-- Creates preferred_vendor table to map ingredients to their preferred suppliers.
-- Supports multiple suppliers per ingredient for competitive sourcing.
-- ══════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════
-- STEP 1: CREATE preferred_vendor TABLE
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS preferred_vendor (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    is_preferred BOOLEAN NOT NULL DEFAULT true,
    unit_cost NUMERIC(10, 4),
    lead_time_days INTEGER,
    minimum_order_qty NUMERIC(10, 4),
    discount_pct NUMERIC(5, 4),
    notes VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_preferred_vendor_restaurant_ingredient_supplier 
        UNIQUE (restaurant_id, ingredient_id, supplier_id),
    CONSTRAINT fk_preferred_vendor_restaurant 
        FOREIGN KEY (restaurant_id) REFERENCES restaurant(id),
    CONSTRAINT fk_preferred_vendor_ingredient 
        FOREIGN KEY (ingredient_id) REFERENCES ingredient(id),
    CONSTRAINT fk_preferred_vendor_supplier 
        FOREIGN KEY (supplier_id) REFERENCES supplier(id)
);

COMMENT ON TABLE preferred_vendor IS 
    'Maps ingredients to preferred/preferred vendors. Supports multiple suppliers per ingredient for competitive sourcing.';
COMMENT ON COLUMN preferred_vendor.is_preferred IS 
    'True if this is the primary vendor for auto-PO generation.';
COMMENT ON COLUMN preferred_vendor.unit_cost IS 
    'Unit cost from this supplier (may differ from ingredient.purchase_unit_price).';
COMMENT ON COLUMN preferred_vendor.lead_time_days IS 
    'Supplier lead time for this ingredient.';
COMMENT ON COLUMN preferred_vendor.minimum_order_qty IS 
    'Minimum order quantity for this ingredient from this supplier.';
COMMENT ON COLUMN preferred_vendor.discount_pct IS 
    'Volume discount percentage for this ingredient from this supplier.';

CREATE INDEX idx_preferred_vendor_ingredient ON preferred_vendor(ingredient_id);
CREATE INDEX idx_preferred_vendor_supplier ON preferred_vendor(supplier_id);
CREATE INDEX idx_preferred_vendor_restaurant ON preferred_vendor(restaurant_id);

-- ══════════════════════════════════════════════════════════════════════════
-- STEP 2: MAP INGREDIENTS TO PREFERRED VENDORS
-- ══════════════════════════════════════════════════════════════════════════
-- Supplier mapping:
--   101 - Hudson Valley Purveyors (PRODUCE, BEVERAGES)
--   102 - Prime Meats NYC (MEAT, POULTRY)
--   103 - Fresh Catch Seafood (SEAFOOD)
--   104 - Gotham Dairy Supply (DAIRY)
--   105 - Empire Dry Goods (DRY GOODS, GROCERY, LIQUOR, BAR, WINE, BEER)
-- ══════════════════════════════════════════════════════════════════════════

INSERT INTO preferred_vendor
  (restaurant_id, ingredient_id, supplier_id, is_preferred, unit_cost, lead_time_days, minimum_order_qty, discount_pct, notes, is_active, created_at, updated_at)
VALUES
  -- PRODUCE (Supplier 101: Hudson Valley Purveyors)
  (3, 301, 101, true, 0.80, 1, 10.00, 0.00, 'Avocados - case pricing', true, '2026-04-01', '2026-04-01'),
  (3, 302, 101, true, 2.49, 1, 20.00, 0.00, 'Roma Tomatoes', true, '2026-04-01', '2026-04-01'),
  (3, 303, 101, true, 1.29, 1, 50.00, 0.00, 'Yellow Onions', true, '2026-04-01', '2026-04-01'),
  (3, 304, 101, true, 4.99, 1, 5.00, 0.00, 'Fresh Arugula', true, '2026-04-01', '2026-04-01'),
  (3, 306, 101, true, 5.99, 1, 15.00, 0.00, 'Free-Range Eggs', true, '2026-04-01', '2026-04-01'),
  (3, 307, 101, true, 2.99, 1, 10.00, 0.00, 'Fresh Herbs', true, '2026-04-01', '2026-04-01'),
  (3, 302, 101, true, 2.49, 1, 20.00, 0.00, 'Roma Tomatoes (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 303, 101, true, 1.29, 1, 50.00, 0.00, 'Yellow Onions (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 304, 101, true, 4.99, 1, 5.00, 0.00, 'Fresh Arugula (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 335, 101, true, 4.99, 1, 10.00, 0.00, 'Grapefruit Juice (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 336, 101, true, 3.99, 1, 5.00, 0.00, 'Jalapeño Peppers (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 338, 101, true, 4.99, 1, 10.00, 0.00, 'Mixed Berries (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 339, 101, true, 0.49, 1, 50.00, 0.00, 'Fresh Lemons (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 345, 101, true, 5.99, 1, 10.00, 0.00, 'Baby Arugula (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 351, 101, true, 4.99, 1, 10.00, 0.00, 'Orange Juice (V9)', true, '2026-04-01', '2026-04-01'),

  -- MEAT (Supplier 102: Prime Meats NYC)
  (3, 308, 102, true, 24.99, 2, 20.00, 0.05, 'Beef Tenderloin - bulk discount 5%', true, '2026-04-01', '2026-04-01'),
  (3, 309, 102, true, 18.99, 2, 15.00, 0.00, 'Lamb Rack', true, '2026-04-01', '2026-04-01'),
  (3, 311, 102, true, 6.99, 2, 30.00, 0.00, 'Heritage Pork Belly', true, '2026-04-01', '2026-04-01'),
  (3, 312, 102, true, 9.99, 2, 20.00, 0.00, 'Free-Range Duck Breast', true, '2026-04-01', '2026-04-01'),
  (3, 307, 102, true, 24.99, 2, 20.00, 0.05, 'Beef Tenderloin (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 308, 102, true, 18.99, 2, 15.00, 0.00, 'Lamb Rack (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 321, 102, true, 4.49, 2, 12.00, 0.00, 'Whole Chicken (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 341, 102, true, 8.99, 2, 20.00, 0.00, 'Beef Short Rib (V9)', true, '2026-04-01', '2026-04-01'),

  -- SEAFOOD (Supplier 103: Fresh Catch Seafood)
  (3, 310, 103, true, 12.99, 1, 15.00, 0.00, 'Atlantic Salmon', true, '2026-04-01', '2026-04-01'),
  (3, 309, 103, true, 12.99, 1, 15.00, 0.00, 'Atlantic Salmon (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 310, 103, true, 22.99, 1, 10.00, 0.00, 'Yellowfin Tuna (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 325, 103, true, 9.99, 1, 10.00, 0.00, 'Jumbo Shrimp (V9)', true, '2026-04-01', '2026-04-01'),

  -- DAIRY (Supplier 104: Gotham Dairy Supply)
  (3, 313, 104, true, 5.50, 1, 20.00, 0.00, 'Unsalted Butter', true, '2026-04-01', '2026-04-01'),
  (3, 314, 104, true, 8.99, 1, 10.00, 0.00, 'Heavy Cream', true, '2026-04-01', '2026-04-01'),
  (3, 315, 104, true, 6.99, 1, 10.00, 0.00, 'Burrata Cheese', true, '2026-04-01', '2026-04-01'),
  (3, 330, 104, true, 4.49, 1, 10.00, 0.00, 'Labneh (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 337, 104, true, 4.99, 1, 15.00, 0.00, 'Cream Cheese (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 366, 104, true, 4.99, 1, 8.00, 0.00, 'Whole Milk (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 367, 104, true, 6.99, 1, 12.00, 0.00, 'Oat Milk (V9)', true, '2026-04-01', '2026-04-01'),

  -- DRY GOODS & GROCERY (Supplier 105: Empire Dry Goods)
  (3, 316, 105, true, 0.56, 3, 100.00, 0.10, 'Flour - bulk discount 10%', true, '2026-04-01', '2026-04-01'),
  (3, 317, 105, true, 0.79, 3, 100.00, 0.05, 'Cane Sugar', true, '2026-04-01', '2026-04-01'),
  (3, 318, 105, true, 12.99, 3, 12.00, 0.00, 'Extra Virgin Olive Oil', true, '2026-04-01', '2026-04-01'),
  (3, 319, 105, true, 8.49, 3, 15.00, 0.00, 'Tahini', true, '2026-04-01', '2026-04-01'),
  (3, 320, 105, true, 24.99, 3, 10.00, 0.00, 'Maple Syrup', true, '2026-04-01', '2026-04-01'),
  (3, 305, 105, true, 5.99, 3, 15.00, 0.00, 'Free-Range Eggs (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 306, 105, true, 2.99, 1, 10.00, 0.00, 'Fresh Herbs (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 316, 105, true, 0.56, 3, 100.00, 0.10, 'All-Purpose Flour (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 317, 105, true, 0.79, 3, 100.00, 0.05, 'Cane Sugar (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 318, 105, true, 12.99, 3, 12.00, 0.00, 'Extra Virgin Olive Oil (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 319, 105, true, 8.49, 3, 15.00, 0.00, 'Tahini (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 320, 105, true, 24.99, 3, 10.00, 0.00, 'Maple Syrup (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 322, 105, true, 1.89, 3, 20.00, 0.00, 'Rigatoni Pasta (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 326, 105, true, 2.49, 3, 25.00, 0.00, 'Polenta (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 327, 105, true, 7.99, 3, 12.00, 0.00, 'Hot Honey (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 328, 105, true, 8.99, 3, 6.00, 0.00, 'Nori/Seaweed Powder (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 329, 105, true, 6.49, 3, 8.00, 0.00, 'Smoked Paprika (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 331, 105, true, 1.29, 3, 24.00, 0.00, 'Chickpeas (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 332, 105, true, 3.49, 1, 12.00, 0.00, 'Pita Bread (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 333, 105, true, 5.99, 3, 8.00, 0.00, 'Kalamata Olives (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 342, 105, true, 3.99, 3, 4.00, 0.00, 'Prepared Horseradish (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 343, 105, true, 2.99, 3, 8.00, 0.00, 'Cocktail Sauce (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 344, 105, true, 4.49, 3, 4.00, 0.00, 'Dijon Mustard (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 346, 105, true, 2.99, 1, 12.00, 0.00, 'Flatbread (V9)', true, '2026-04-01', '2026-04-01'),

  -- BAR LIQUOR (Supplier 105: Empire Dry Goods as distributor)
  (3, 323, 105, true, 11.99, 5, 6.00, 0.00, 'Vodka (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 324, 105, true, 22.99, 5, 6.00, 0.00, 'Mezcal (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 334, 105, true, 12.99, 5, 6.00, 0.00, 'Aperol (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 340, 105, true, 8.99, 5, 6.00, 0.00, 'Seedlip Garden (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 347, 105, true, 18.99, 5, 5.00, 0.00, 'Espresso Beans (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 348, 105, true, 14.99, 5, 6.00, 0.00, 'Coffee Liqueur (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 349, 105, true, 15.99, 5, 6.00, 0.00, 'Tequila Blanco (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 359, 105, true, 6.99, 5, 6.00, 0.00, 'Simple Syrup (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 360, 105, true, 7.99, 5, 6.00, 0.00, 'Agave Nectar (V9)', true, '2026-04-01', '2026-04-01'),

  -- WINE (Supplier 105: Empire Dry Goods as distributor)
  (3, 350, 105, true, 9.99, 5, 12.00, 0.00, 'House Wine Rosé (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 361, 105, true, 8.99, 5, 12.00, 0.00, 'House Wine Red (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 362, 105, true, 8.99, 5, 12.00, 0.00, 'House Wine White (V9)', true, '2026-04-01', '2026-04-01'),

  -- BEER (Supplier 105: Empire Dry Goods as distributor)
  (3, 363, 105, true, 85.00, 7, 2.00, 0.00, 'Draft Beer Lager (V9) - 1/2 bbl', true, '2026-04-01', '2026-04-01'),
  (3, 364, 105, true, 95.00, 7, 2.00, 0.00, 'Draft Beer IPA (V9) - 1/2 bbl', true, '2026-04-01', '2026-04-01'),
  (3, 365, 105, true, 28.00, 7, 24.00, 0.00, 'Bottled Beer (V9) - case', true, '2026-04-01', '2026-04-01'),

  -- BEVERAGES (Supplier 101: Hudson Valley for produce-based, 105 for others)
  (3, 352, 105, true, 8.99, 3, 24.00, 0.00, 'Soda Water (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 353, 105, true, 9.99, 3, 18.00, 0.00, 'Tonic Water (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 354, 105, true, 10.99, 3, 18.00, 0.00, 'Ginger Beer (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 355, 105, true, 8.99, 5, 8.00, 0.00, 'Black Tea (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 356, 105, true, 12.99, 5, 6.00, 0.00, 'Green Tea (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 357, 105, true, 29.99, 5, 4.00, 0.00, 'Matcha Powder (V9)', true, '2026-04-01', '2026-04-01'),
  (3, 358, 105, true, 3.99, 3, 12.00, 0.00, 'Coconut Milk (V9)', true, '2026-04-01', '2026-04-01')
ON CONFLICT (restaurant_id, ingredient_id, supplier_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════
-- STEP 3: UPDATE EXISTING preferred_supplier_id ON ingredient TABLE
-- ══════════════════════════════════════════════════════════════════════════
-- Sync the old column with new table for backward compatibility

UPDATE ingredient ing
SET preferred_supplier_id = pv.supplier_id
FROM preferred_vendor pv
WHERE pv.restaurant_id = ing.restaurant_id
  AND pv.ingredient_id = ing.id
  AND pv.is_preferred = true
  AND ing.preferred_supplier_id IS NULL;

-- ══════════════════════════════════════════════════════════════════════════
-- SUMMARY
-- ══════════════════════════════════════════════════════════════════════════
-- Created table: preferred_vendor (ingredient-supplier mapping)
-- Mapped ingredients to preferred vendors:
--   - Supplier 101 (Hudson Valley Purveyors): 15 ingredients (produce)
--   - Supplier 102 (Prime Meats NYC): 8 ingredients (meat, poultry)
--   - Supplier 103 (Fresh Catch Seafood): 4 ingredients (seafood)
--   - Supplier 104 (Gotham Dairy Supply): 7 ingredients (dairy)
--   - Supplier 105 (Empire Dry Goods): 43 ingredients (dry goods, liquor, wine, beer, beverages)
-- Total: 77 ingredient-supplier mappings
-- Updated ingredient.preferred_supplier_id for backward compatibility
-- ══════════════════════════════════════════════════════════════════════════
