-- Flyway migration for menu engineering recommendations table
-- Version: V3__menu_engineering_recommendations.sql

CREATE TABLE IF NOT EXISTS menu_engineering_recommendation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id BIGINT NOT NULL,
    menu_item_id BIGINT,
    period_id BIGINT NOT NULL,
    classification VARCHAR(20) NOT NULL,
    recommendation_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    title VARCHAR(500) NOT NULL,
    description VARCHAR(2000),
    action_plan VARCHAR(2000),
    projected_impact_revenue DECIMAL(10, 2),
    projected_impact_profit DECIMAL(10, 2),
    projected_impact_margin DECIMAL(5, 2),
    estimated_implementation_cost DECIMAL(10, 2),
    assigned_to VARCHAR(100),
    due_date TIMESTAMP,
    comment VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP,
    dismissed_reason VARCHAR(500)
);

-- Indexes for common queries (idempotent — IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_recommendation_restaurant_period ON menu_engineering_recommendation(restaurant_id, period_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_status ON menu_engineering_recommendation(status);
CREATE INDEX IF NOT EXISTS idx_recommendation_classification ON menu_engineering_recommendation(classification);
CREATE INDEX IF NOT EXISTS idx_recommendation_menu_item ON menu_engineering_recommendation(menu_item_id);