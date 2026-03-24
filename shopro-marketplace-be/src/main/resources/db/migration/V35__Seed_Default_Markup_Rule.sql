-- V35 Seed Default Markup Rule
INSERT INTO markup_rule (id, name, target_type, markup_value, markup_type, priority, is_active, created_at, updated_at)
VALUES (
    '00000000-0000-4000-a000-000000000000', 
    'System Default Plan', 
    'GLOBAL', 
    0.14, 
    'PERCENTAGE', 
    1, 
    TRUE, 
    NOW(), 
    NOW()
) ON CONFLICT (id) DO NOTHING;
