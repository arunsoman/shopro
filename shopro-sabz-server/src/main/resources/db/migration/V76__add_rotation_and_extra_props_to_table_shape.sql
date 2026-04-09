-- Add rotation and extra_props to table_shape to support Layout Studio features
ALTER TABLE table_shape ADD COLUMN rotation INTEGER NOT NULL DEFAULT 0;
ALTER TABLE table_shape ADD COLUMN extra_props JSONB;
