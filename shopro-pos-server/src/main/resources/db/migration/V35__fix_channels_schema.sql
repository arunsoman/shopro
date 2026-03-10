-- V35__fix_channels_schema.sql
-- Fix schema mismatch for channels table and seed values

-- Rename provider_config to config if it exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='channels' and column_name='provider_config')
  THEN
      ALTER TABLE "channels" RENAME COLUMN "provider_config" TO "config";
  END IF;
END $$;

-- Set default to {} and make NOT NULL
UPDATE "channels" SET "config" = '{}'::jsonb WHERE "config" IS NULL;
ALTER TABLE "channels" ALTER COLUMN "config" SET DEFAULT '{}'::jsonb;
ALTER TABLE "channels" ALTER COLUMN "config" SET NOT NULL;

-- Add name column
ALTER TABLE "channels" ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);

-- Update names based on type
UPDATE "channels" SET "name" = 'In-App Notifications' WHERE "type" = 'IN_APP';
UPDATE "channels" SET "name" = 'Email Service' WHERE "type" = 'EMAIL';
UPDATE "channels" SET "name" = 'SMS Gateway' WHERE "type" = 'SMS';
UPDATE "channels" SET "name" = 'Push Notifications' WHERE "type" = 'PUSH';

-- Make name NOT NULL
ALTER TABLE "channels" ALTER COLUMN "name" SET NOT NULL;
