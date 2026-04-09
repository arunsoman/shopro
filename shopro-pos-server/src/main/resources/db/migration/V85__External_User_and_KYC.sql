-- V85: External User and KYC Schema
-- Purpose: Introduce the AAA layer for Sabz app customers aligned with FAPI 2.0 standards
-- and synchronous KYC tracking.

CREATE TABLE external_user (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE kyc_details (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    document_type VARCHAR(50), -- e.g., 'PASSPORT', 'NATIONAL_ID'
    document_number VARCHAR(100),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED', -- 'UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_kyc_details_user FOREIGN KEY (user_id) REFERENCES external_user(id) ON DELETE CASCADE
);

CREATE INDEX idx_external_user_phone On external_user(phone);
CREATE INDEX idx_external_user_email On external_user(email);
CREATE INDEX idx_kyc_details_status On kyc_details(verification_status);
