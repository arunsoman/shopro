-- V57__create_tax_tables.sql
-- Implements the 7-table schema for the Taxes & Compliance module.
-- Refactored to use UUIDs for all IDs to align with Shopro BaseEntity standard.

-- 1. countries
CREATE TABLE countries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code        VARCHAR(10)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    currency_code   CHAR(3)      NOT NULL,
    currency_symbol VARCHAR(5)   NOT NULL,
    tax_model       VARCHAR(30)  NOT NULL
        CHECK (tax_model IN ('VAT_INCLUSIVE','TAX_EXCLUSIVE','GST')),
    tax_included    BOOLEAN      NOT NULL DEFAULT FALSE,
    notes           TEXT,
    version         BIGINT       NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 2. tax_rules
CREATE TABLE tax_rules (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id           UUID         NOT NULL REFERENCES countries(id),
    rule_code            VARCHAR(50)  NOT NULL,
    rule_name            VARCHAR(150) NOT NULL,
    tax_type             VARCHAR(50)  NOT NULL
        CHECK (tax_type IN ('VAT','GST','SALES_TAX','STATE_EXCISE','EXCISE','LEVY','SERVICE_CHARGE')),
    default_rate         NUMERIC(6,4) NOT NULL,
    min_allowed_rate     NUMERIC(6,4) NOT NULL,
    max_allowed_rate     NUMERIC(6,4) NOT NULL,
    applies_to_dine_in   BOOLEAN      NOT NULL DEFAULT TRUE,
    applies_to_takeaway  BOOLEAN      NOT NULL DEFAULT TRUE,
    applies_to_hot       BOOLEAN,
    applies_to_cold      BOOLEAN,
    applies_to_alcohol   BOOLEAN      NOT NULL DEFAULT FALSE,
    item_category        VARCHAR(50),
    price_threshold_min  NUMERIC(12,2),
    price_threshold_max  NUMERIC(12,2),
    is_cascading         BOOLEAN      NOT NULL DEFAULT FALSE,
    cascade_on_rule_id   UUID         REFERENCES tax_rules(id),
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order           INT          NOT NULL DEFAULT 0,
    description          TEXT,
    version              BIGINT       NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, rule_code),
    CHECK (min_allowed_rate <= max_allowed_rate),
    CHECK (default_rate >= min_allowed_rate AND default_rate <= max_allowed_rate)
);
CREATE INDEX idx_tax_rules_country        ON tax_rules(country_id);
CREATE INDEX idx_tax_rules_active         ON tax_rules(country_id, is_active);
CREATE INDEX idx_tax_rules_cascade        ON tax_rules(cascade_on_rule_id);

-- 3. venue_country_assignments
CREATE TABLE venue_country_assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id    UUID         NOT NULL UNIQUE,
    country_id  UUID         NOT NULL REFERENCES countries(id),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    version     BIGINT       NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    assigned_by UUID         NOT NULL,
    assigned_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 4. venue_tax_configs (overrides)
CREATE TABLE venue_tax_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID         NOT NULL,
    tax_rule_id     UUID         NOT NULL REFERENCES tax_rules(id),
    override_rate   NUMERIC(6,4) NOT NULL,
    override_reason TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    version         BIGINT       NOT NULL DEFAULT 0,
    created_by      UUID         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (venue_id, tax_rule_id)
);
CREATE INDEX idx_venue_tax_configs_venue  ON venue_tax_configs(venue_id);

-- 5. item_tax_tags
CREATE TABLE item_tax_tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id    UUID        NOT NULL UNIQUE,
    temperature     VARCHAR(10)
        CHECK (temperature IN ('HOT','COLD')),
    item_category   VARCHAR(50) NOT NULL
        CHECK (item_category IN ('FOOD','BEVERAGE','ALCOHOL','TOBACCO')),
    is_basic_staple BOOLEAN     NOT NULL DEFAULT FALSE,
    version         BIGINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. tax_audit_logs
CREATE TABLE tax_audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID         NOT NULL,
    tax_rule_id     UUID         REFERENCES tax_rules(id),
    action          VARCHAR(30)  NOT NULL
        CHECK (action IN ('OVERRIDE_SET','OVERRIDE_REMOVED','COUNTRY_CHANGED','COUNTRY_ASSIGNED')),
    old_rate        NUMERIC(6,4),
    new_rate        NUMERIC(6,4),
    changed_by      UUID         NOT NULL,
    changed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    change_reason   TEXT,
    ip_address      INET,
    version         BIGINT       NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tax_audit_logs_venue     ON tax_audit_logs(venue_id, changed_at DESC);

-- 7. tax_calculation_results
CREATE TABLE tax_calculation_results (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id        UUID         NOT NULL,
    ticket_item_id   UUID         NOT NULL,
    tax_rule_id      UUID         NOT NULL REFERENCES tax_rules(id),
    rule_code        VARCHAR(50)  NOT NULL,
    base_amount      NUMERIC(12,2) NOT NULL,
    tax_rate         NUMERIC(6,4)  NOT NULL,
    tax_amount       NUMERIC(12,2) NOT NULL,
    order_type       VARCHAR(20)   NOT NULL
        CHECK (order_type IN ('DINE_IN','TAKEAWAY','DELIVERY')),
    item_temperature VARCHAR(10),
    calculated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version          BIGINT       NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tax_calc_ticket          ON tax_calculation_results(ticket_id);
