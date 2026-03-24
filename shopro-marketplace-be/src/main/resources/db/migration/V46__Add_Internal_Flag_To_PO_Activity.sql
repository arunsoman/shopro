-- V46__Add_Internal_Flag_To_PO_Activity.sql

ALTER TABLE po_activity
ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;
