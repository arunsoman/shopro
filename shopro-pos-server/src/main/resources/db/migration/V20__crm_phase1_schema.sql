-- =============================================================================
-- V20: CRM Phase 1 — Dietary Tags, Occasions, Loyalty Config, Bonus Events
-- =============================================================================

-- Add new columns to customer_profile
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS visit_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE customer_profile ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMPTZ;

-- Customer dietary tags (allergies/restrictions)
CREATE TABLE customer_dietary_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_profile_id UUID NOT NULL REFERENCES customer_profile(id) ON DELETE CASCADE,
    tag_type VARCHAR(30) NOT NULL,
    custom_description VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_customer_dietary_tag UNIQUE (customer_profile_id, tag_type)
);
CREATE INDEX idx_dietary_tag_customer ON customer_dietary_tag(customer_profile_id);

-- Customer occasions (birthday, anniversary)
CREATE TABLE customer_occasion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_profile_id UUID NOT NULL REFERENCES customer_profile(id) ON DELETE CASCADE,
    occasion_type VARCHAR(30) NOT NULL,
    occasion_month INTEGER NOT NULL CHECK (occasion_month BETWEEN 1 AND 12),
    occasion_day INTEGER NOT NULL CHECK (occasion_day BETWEEN 1 AND 31),
    occasion_year INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_customer_occasion UNIQUE (customer_profile_id, occasion_type)
);
CREATE INDEX idx_occasion_customer ON customer_occasion(customer_profile_id);

-- Loyalty program configuration (singleton row)
CREATE TABLE loyalty_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    earning_rate NUMERIC(6,2) NOT NULL DEFAULT 1.00,
    redemption_value NUMERIC(6,4) NOT NULL DEFAULT 0.0100,
    minimum_redemption_points INTEGER NOT NULL DEFAULT 100,
    point_expiration_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version BIGINT NOT NULL DEFAULT 0
);

-- Seed default loyalty config
INSERT INTO loyalty_config (id, earning_rate, redemption_value, minimum_redemption_points, point_expiration_days)
VALUES (gen_random_uuid(), 1.00, 0.01, 100, 0);

-- Bonus point events (time-limited multiplier events)
CREATE TABLE bonus_point_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    multiplier NUMERIC(3,1) NOT NULL DEFAULT 2.0 CHECK (multiplier >= 1.0 AND multiplier <= 5.0),
    scope VARCHAR(20) NOT NULL DEFAULT 'ALL',
    scope_reference_id UUID,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_bonus_event_dates CHECK (ends_at > starts_at)
);
CREATE INDEX idx_bonus_event_active ON bonus_point_event(is_active, starts_at, ends_at);

-- Add a type column to loyalty_transaction for EARN vs REDEEM vs BONUS tracking
ALTER TABLE loyalty_transaction ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) NOT NULL DEFAULT 'EARN';
ALTER TABLE loyalty_transaction ADD COLUMN IF NOT EXISTS bonus_event_id UUID REFERENCES bonus_point_event(id);
