-- V32__add_table_and_staff_to_ledger.sql
-- Adds table_id and staff_id columns to inventory_ingredient_ledger for better traceability

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_ingredient_ledger' AND column_name = 'table_id'
    ) THEN
        ALTER TABLE inventory_ingredient_ledger
        ADD COLUMN table_id BIGINT REFERENCES dining_table(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_ingredient_ledger' AND column_name = 'staff_id'
    ) THEN
        ALTER TABLE inventory_ingredient_ledger
        ADD COLUMN staff_id UUID REFERENCES staff(staff_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Indexes for performance (only if they don't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'inventory_ingredient_ledger' AND indexname = 'idx_ledger_table'
    ) THEN
        CREATE INDEX idx_ledger_table ON inventory_ingredient_ledger(table_id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'inventory_ingredient_ledger' AND indexname = 'idx_ledger_staff'
    ) THEN
        CREATE INDEX idx_ledger_staff ON inventory_ingredient_ledger(staff_id);
    END IF;
END $$;

-- Comments
COMMENT ON COLUMN inventory_ingredient_ledger.table_id IS 'Table where the order was served (for dine-in orders)';
COMMENT ON COLUMN inventory_ingredient_ledger.staff_id IS 'Staff member who served the order (from table_staff_map)';
