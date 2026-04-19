-- Menu Engineering Settings Table
CREATE TABLE IF NOT EXISTS menu_engineering_settings (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL UNIQUE,
    popularity_threshold_factor DECIMAL(5,2) NOT NULL DEFAULT 0.70,
    food_cost_warning_threshold DECIMAL(5,2) NOT NULL DEFAULT 35.00,
    min_contribution_margin DECIMAL(10,2) NOT NULL DEFAULT 2.00,
    default_daypart VARCHAR(20) DEFAULT 'ALL',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mes_restaurant ON menu_engineering_settings(restaurant_id);
