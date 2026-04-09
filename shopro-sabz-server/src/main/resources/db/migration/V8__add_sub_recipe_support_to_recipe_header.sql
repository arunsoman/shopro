-- V8__add_sub_recipe_support_to_recipe_header.sql
-- Updates recipe table to allow linking to either a menu item OR a sub-recipe.

-- 1. Make menu_item_id NULLABLE
ALTER TABLE recipe ALTER COLUMN menu_item_id DROP NOT NULL;

-- 2. Add sub_recipe_id
ALTER TABLE recipe ADD COLUMN sub_recipe_id UUID REFERENCES sub_recipe(id);

-- 3. Add constraint to ensure exactly one of menu_item_id or sub_recipe_id is present
ALTER TABLE recipe ADD CONSTRAINT ck_recipe_target 
    CHECK ((menu_item_id IS NOT NULL AND sub_recipe_id IS NULL) OR (menu_item_id IS NULL AND sub_recipe_id IS NOT NULL));

-- 4. Update unique constraint
-- Existing constraint was UNIQUE(menu_item_id, recipe_version)
ALTER TABLE recipe DROP CONSTRAINT recipe_menu_item_id_recipe_version_key;

-- New unique constraints
CREATE UNIQUE INDEX uq_recipe_menu_item_version ON recipe (menu_item_id, recipe_version) WHERE menu_item_id IS NOT NULL;
CREATE UNIQUE INDEX uq_recipe_sub_recipe_version ON recipe (sub_recipe_id, recipe_version) WHERE sub_recipe_id IS NOT NULL;
