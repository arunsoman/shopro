-- V39: Add super_group to food table
ALTER TABLE food ADD COLUMN IF NOT EXISTS super_group VARCHAR(100);
