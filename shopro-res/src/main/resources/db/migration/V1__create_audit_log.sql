-- V1__create_audit_log.sql
-- Creates the audit_log table for tracking API actions

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50),
    details VARCHAR(500),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_log_username ON audit_log(username);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_name ON audit_log(entity_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Composite index for common queries (date range + username)
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp_username ON audit_log(timestamp, username);

-- Composite index for entity-specific queries
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_timestamp ON audit_log(entity_name, timestamp);
