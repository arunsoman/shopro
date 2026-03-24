-- V32 Add In-App Notifications table to Marketplace
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id UUID PRIMARY KEY,
    recipient_id UUID NOT NULL,
    type_code VARCHAR(100) NOT NULL,
    correlation_id VARCHAR(100),
    title VARCHAR(255),
    body TEXT,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_notification_recipient ON in_app_notifications(recipient_id);
CREATE INDEX idx_notification_unread ON in_app_notifications(recipient_id) WHERE is_read = FALSE;
