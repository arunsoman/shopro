-- V31__add_missing_columns_to_notification_types.sql
-- Adds missing 'is_active' and 'is_mutable' columns to notification_types table.
-- These columns are required by the JPA entity.

ALTER TABLE "notification_types" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "notification_types" ADD COLUMN "is_mutable" BOOLEAN NOT NULL DEFAULT true;
