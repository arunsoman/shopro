-- V48__fix_loyalty_config_schema.sql
-- Add missing columns to loyalty_config table

ALTER TABLE loyalty_config ADD COLUMN IF NOT EXISTS default_sms_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE loyalty_config ADD COLUMN IF NOT EXISTS default_email_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE loyalty_config ADD COLUMN IF NOT EXISTS feedback_window_hours INTEGER NOT NULL DEFAULT 24;
ALTER TABLE loyalty_config ADD COLUMN IF NOT EXISTS sms_gateway_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE loyalty_config ADD COLUMN IF NOT EXISTS email_gateway_enabled BOOLEAN NOT NULL DEFAULT FALSE;
