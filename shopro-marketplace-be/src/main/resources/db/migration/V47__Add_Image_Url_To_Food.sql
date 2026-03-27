-- V47: Add image_url to food table to support product imagery
ALTER TABLE food ADD COLUMN IF NOT EXISTS image_url VARCHAR(1024);
