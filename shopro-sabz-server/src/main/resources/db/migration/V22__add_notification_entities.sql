-- V22__add_notification_entities.sql
-- Schema for the real-time notification engine

CREATE TABLE notification_recipient_mapping (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL
);

CREATE TABLE in_app_notification (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    data JSONB,
    correlation_id VARCHAR(255),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_in_app_notification_recipient ON in_app_notification (recipient_type, recipient_id);
CREATE INDEX idx_in_app_notification_correlation ON in_app_notification (correlation_id);
