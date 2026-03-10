-- V21__crm_phase2_campaigns_feedback.sql
-- Creates tables for Phase 2 CRM features: Segments, Promos, Automated Campaigns, Feedback

-- 1. Customer Segments
CREATE TABLE customer_segment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Segment Rules
CREATE TABLE segment_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID NOT NULL REFERENCES customer_segment(id) ON DELETE CASCADE,
    field VARCHAR(50) NOT NULL,    -- LTV, LAST_VISIT, TIER, TAG
    operator VARCHAR(50) NOT NULL, -- GREATER_THAN, EQUALS, IN, LESS_THAN
    rule_value VARCHAR(255) NOT NULL,   -- e.g. '1000', 'GOLD', 'VEGAN'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_segment_rule_segment_id ON segment_rule(segment_id);

-- 3. Promo Codes
CREATE TABLE promo_code (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INT,
    current_uses INT NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    segment_id UUID REFERENCES customer_segment(id) ON DELETE SET NULL, -- Optional segment restriction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_promo_code_code ON promo_code(code);

-- 4. Automated Campaigns
CREATE TABLE automated_campaign (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    trigger_event VARCHAR(50) NOT NULL, -- BIRTHDAY, ANNIVERSARY, INACTIVE_30_DAYS
    delay_hours INT NOT NULL DEFAULT 0,
    template_id UUID, -- References marketing_campaign (can be null in prototype)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Guest Feedback
CREATE TABLE guest_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profile(id) ON DELETE CASCADE,
    order_id VARCHAR(50), -- Optional POS integration
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    sentiment VARCHAR(20),  -- POSITIVE, NEUTRAL, NEGATIVE
    source VARCHAR(20) NOT NULL, -- EMAIL, SMS, APP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_guest_feedback_customer_id ON guest_feedback(customer_id);
