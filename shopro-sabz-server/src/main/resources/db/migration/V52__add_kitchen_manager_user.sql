-- V52__add_kitchen_manager_user.sql
-- Adds a default Kitchen Manager user for Expo and BOH management.

INSERT INTO "staff_member" ("id", "full_name", "pin_hash", "role", "role_id", "active", "version", "created_at", "updated_at")
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 
    'Kevin Kitchen', 
    '$2a$10$dIhthVRDnRBUCs8ofKiqmOWflej/ic2CX13AUAtkO7rlX0gg/EqTe', 
    'KITCHEN_MANAGER', 
    '00000000-0000-0000-0000-000000000008', 
    true, 
    0, 
    NOW(), 
    NOW()
);
