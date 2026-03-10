-- V29__add_version_to_notification_schema.sql
ALTER TABLE "notification_types" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "channels" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "notification_templates" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "recipient_groups" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "recipients" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "notification_type_channels" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "in_app_notifications" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "user_notification_preferences" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "notification_logs" ADD COLUMN "version" BIGINT NOT NULL DEFAULT 0;
