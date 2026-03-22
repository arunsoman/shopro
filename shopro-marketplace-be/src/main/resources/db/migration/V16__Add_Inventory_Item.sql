CREATE TABLE IF NOT EXISTS inventory_item (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    restaurant_id UUID NOT NULL,
    food_id INTEGER NOT NULL REFERENCES food(id),
    quantity DOUBLE PRECISION DEFAULT 0.0,
    unit VARCHAR(20) DEFAULT 'unit',
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    UNIQUE(restaurant_id, food_id)
);
