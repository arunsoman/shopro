-- V36__add_description_to_recipient_groups.sql
-- Fix schema mismatch: add missing description column to recipient_groups table

ALTER TABLE "recipient_groups" ADD COLUMN IF NOT EXISTS "description" TEXT;
