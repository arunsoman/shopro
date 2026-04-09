-- Add preparation_time_minutes to menu_item
ALTER TABLE menu_item ADD COLUMN preparation_time_minutes INTEGER NOT NULL DEFAULT 10;
