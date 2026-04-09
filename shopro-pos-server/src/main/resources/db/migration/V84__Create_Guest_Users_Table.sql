-- V84: Create Guest Users Table
-- Purpose: Independent identity system for the Sabz application (SSO + Password)

CREATE TABLE guest_users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(20),
    password_hash VARCHAR(255),  -- Nullable for SSO-only accounts
    sso_provider VARCHAR(50),    -- e.g., 'google', 'auth0'
    sso_id VARCHAR(255),          -- The 'sub' claim from the AS
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Unique indexes to prevent duplicate identity pairs
CREATE UNIQUE INDEX idx_guest_email ON guest_users(email) WHERE active = true;
CREATE UNIQUE INDEX idx_guest_phone ON guest_users(phone_number) WHERE active = true;
CREATE UNIQUE INDEX idx_guest_sso ON guest_users(sso_provider, sso_id) WHERE active = true;
