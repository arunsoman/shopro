-- V7__add_sub_recipe_support_to_recipes.sql
-- Updates recipe_ingredient to allow linking to either a raw ingredient OR a sub-recipe.

-- 1. Make ingredient_id NULLABLE
ALTER TABLE recipe_ingredient ALTER COLUMN ingredient_id DROP NOT NULL;

-- 2. Add sub_recipe_id
ALTER TABLE recipe_ingredient ADD COLUMN sub_recipe_id UUID REFERENCES sub_recipe(id);

-- 3. Add constraint to ensure exactly one of ingredient_id or sub_recipe_id is present
ALTER TABLE recipe_ingredient ADD CONSTRAINT ck_recipe_ingredient_target 
    CHECK ((ingredient_id IS NOT NULL AND sub_recipe_id IS NULL) OR (ingredient_id IS NULL AND sub_recipe_id IS NOT NULL));

-- 4. Update unique constraint
-- Existing constraint was UNIQUE(recipe_id, ingredient_id)
-- We need to drop it and create a new one that handles both
ALTER TABLE recipe_ingredient DROP CONSTRAINT recipe_ingredient_recipe_id_ingredient_id_key;

-- We'll use a unique index to allow one null and one value
CREATE UNIQUE INDEX uq_recipe_ingredient_raw ON recipe_ingredient (recipe_id, ingredient_id) WHERE ingredient_id IS NOT NULL;
CREATE UNIQUE INDEX uq_recipe_ingredient_sub ON recipe_ingredient (recipe_id, sub_recipe_id) WHERE sub_recipe_id IS NOT NULL;
