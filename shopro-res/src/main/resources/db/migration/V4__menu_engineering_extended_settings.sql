-- Menu Engineering Settings Extended Configuration
-- V4: Add extended settings for Phase 10

ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS restaurant_type VARCHAR(20) DEFAULT 'CASUAL';
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS winner_popularity_threshold DECIMAL(5,2) DEFAULT 0.70;
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS winner_margin_threshold DECIMAL(10,2) DEFAULT 3.00;
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS auto_generate_recommendations BOOLEAN DEFAULT true;
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER DEFAULT 3;
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS notification_emails VARCHAR(500);
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS target_winner_pct DECIMAL(5,2) DEFAULT 20.00;
ALTER TABLE menu_engineering_settings ADD COLUMN IF NOT EXISTS target_loser_pct DECIMAL(5,2) DEFAULT 10.00;

-- Restaurant Types Enum Reference:
-- FINE_DINING, CASUAL, FAST_CASUAL, QSR (Quick Service Restaurant), CAFE, BISTRO, BUFFET, FOOD_TRUCK
