-- V24__multi_channel_notification_system.sql
-- Drop old tables
DROP TABLE IF EXISTS "notification_logs" CASCADE;
DROP TABLE IF EXISTS "notification_recipient_mappings" CASCADE;
DROP TABLE IF EXISTS "in_app_notifications" CASCADE;
DROP TABLE IF EXISTS "notification_types" CASCADE;

-- 1. Create notification_types
CREATE TABLE "notification_types" (
    "id" UUID PRIMARY KEY,
    "code" VARCHAR(100) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_notification_type_code_v24" ON "notification_types"("code");

-- 2. Create channels
CREATE TABLE "channels" (
    "id" UUID PRIMARY KEY,
    "type" VARCHAR(50) NOT NULL,
    "provider_config" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create notification_templates
CREATE TABLE "notification_templates" (
    "id" UUID PRIMARY KEY,
    "notification_type_id" UUID NOT NULL REFERENCES "notification_types"("id") ON DELETE CASCADE,
    "channel_id" UUID NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
    "subject_template" VARCHAR(255),
    "body_template" TEXT NOT NULL,
    "action_url_template" VARCHAR(255),
    "language" VARCHAR(10) DEFAULT 'en',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("notification_type_id", "channel_id", "language")
);

-- 4. Create groups and recipients
CREATE TABLE "recipient_groups" (
    "id" UUID PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "role_code" VARCHAR(50) UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "recipients" (
    "id" UUID PRIMARY KEY,
    "group_id" UUID NOT NULL REFERENCES "recipient_groups"("id") ON DELETE CASCADE,
    "user_id" UUID,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "device_token" VARCHAR(255),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create notification_type_channels (Routing Matrix)
CREATE TABLE "notification_type_channels" (
    "id" UUID PRIMARY KEY,
    "notification_type_id" UUID NOT NULL REFERENCES "notification_types"("id") ON DELETE CASCADE,
    "channel_id" UUID NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
    "recipient_group_id" UUID REFERENCES "recipient_groups"("id") ON DELETE SET NULL,
    "fallback_channel_id" UUID REFERENCES "channels"("id") ON DELETE SET NULL,
    "is_active" BOOLEAN DEFAULT true,
    "priority_override" VARCHAR(20),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("notification_type_id", "channel_id", "recipient_group_id")
);

-- 6. Create in_app_notifications (Time-Series, typically partitioned in prod)
CREATE TABLE "in_app_notifications" (
    "id" UUID PRIMARY KEY,
    "recipient_id" UUID NOT NULL,
    "type_code" VARCHAR(100) NOT NULL,
    "correlation_id" VARCHAR(255),
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN DEFAULT false,
    "is_dismissed" BOOLEAN DEFAULT false,
    "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_in_app_notif_recipient_v24" ON "in_app_notifications"("recipient_id", "is_dismissed", "created_at" DESC);

-- 7. Create user_notification_preferences (Opt-outs)
CREATE TABLE "user_notification_preferences" (
    "id" UUID PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "notification_type_id" UUID NOT NULL REFERENCES "notification_types"("id") ON DELETE CASCADE,
    "channel_id" UUID NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
    "is_muted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("user_id", "notification_type_id", "channel_id")
);

-- 8. Create notification_logs (Audit/Webhooks)
CREATE TABLE "notification_logs" (
    "id" UUID PRIMARY KEY,
    "dispatch_id" UUID NOT NULL,
    "notification_type_id" UUID REFERENCES "notification_types"("id") ON DELETE SET NULL,
    "channel_id" UUID REFERENCES "channels"("id") ON DELETE SET NULL,
    "recipient_identifier" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "error_message" TEXT,
    "attempt_count" INT DEFAULT 0,
    "sent_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "idx_notification_logs_dispatch_id_v24" ON "notification_logs"("dispatch_id");


-- ==========================================
-- SEED DATA
-- ==========================================

-- A. Insert Channels
INSERT INTO "channels" ("id", "type", "is_active") VALUES
('11111111-1111-1111-1111-111111111111', 'IN_APP', true),
('22222222-2222-2222-2222-222222222222', 'EMAIL', true),
('33333333-3333-3333-3333-333333333333', 'SMS', true),
('44444444-4444-4444-4444-444444444444', 'PUSH', true);

-- B. Insert Notification Types
INSERT INTO "notification_types" ("id", "code", "name", "category", "severity") VALUES
('10000000-0000-0000-0000-000000000001', 'SYSTEM_WARNING', 'System Warning', 'SYSTEM', 'WARNING'),
('10000000-0000-0000-0000-000000000002', 'STOCK_CRITICAL', 'Critical Stock', 'INVENTORY', 'CRITICAL'),
('10000000-0000-0000-0000-000000000003', 'PO_APPROVAL', 'Purchase Order Approval', 'PURCHASING', 'INFO'),
('10000000-0000-0000-0000-000000000004', 'NEW_ORDER', 'New Online Order', 'KDS', 'INFO');

-- C. Insert Recipient Groups
INSERT INTO "recipient_groups" ("id", "name", "role_code") VALUES
('99999999-9999-9999-9999-999999999991', 'Managers', 'ROLE_MANAGER'),
('99999999-9999-9999-9999-999999999992', 'Head Chefs', 'ROLE_HEAD_CHEF'),
('99999999-9999-9999-9999-999999999993', 'SysAdmins', 'ROLE_ADMIN');

-- D. Insert Routing Matrix (NotificationTypeChannel)
-- Managers get In-App for System Warnings
INSERT INTO "notification_type_channels" ("id", "notification_type_id", "channel_id", "recipient_group_id") VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999991'),
-- Head chefs get In-App for Stock Critical
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999992'),
-- SysAdmins get Email for System Warnings
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999993');
