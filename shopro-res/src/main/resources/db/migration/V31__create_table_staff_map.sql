-- V31__create_table_staff_map.sql
-- Creates the table_staff_map table for tracking staff-to-table assignments

CREATE TABLE table_staff_map (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    table_id BIGINT NOT NULL REFERENCES dining_table(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) NOT NULL DEFAULT 'PRIMARY',
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    unassigned_at TIMESTAMP,
    unassigned_by UUID,
    unassigned_reason TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one assignment per staff-table-restaurant combination
    CONSTRAINT uk_table_staff_restaurant UNIQUE (restaurant_id, table_id, staff_id)
);

-- Indexes for performance
CREATE INDEX idx_table_staff_restaurant ON table_staff_map(restaurant_id);
CREATE INDEX idx_table_staff_table ON table_staff_map(table_id);
CREATE INDEX idx_table_staff_staff ON table_staff_map(staff_id);
CREATE INDEX idx_table_staff_active ON table_staff_map(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE table_staff_map IS 'Maps staff members to tables they are assigned to serve';
COMMENT ON COLUMN table_staff_map.assignment_type IS 'PRIMARY: Main server, SECONDARY: Backup server, SUPPORT: Helper staff';
