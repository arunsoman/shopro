CREATE TABLE markup_rule (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value VARCHAR(255),
    subgroup_value VARCHAR(255),
    markup_value DECIMAL(19, 4) NOT NULL,
    markup_type VARCHAR(50) NOT NULL,
    priority INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a comment to explain the hierarchy
COMMENT ON COLUMN markup_rule.priority IS 'Priority level: 4=ITEM, 3=SUBGROUP, 2=GROUP, 1=GLOBAL';
