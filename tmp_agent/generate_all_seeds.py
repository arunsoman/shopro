
import json
import os

OUTPUT_DIR = "/home/arun/IdeaProjects/shopro-pos/shopro-pos-server/src/main/resources/db/migration/"
STEPS_DIR = "/home/arun/.gemini/antigravity/brain/63e4faa3-bd7b-4129-adf2-7fa096f8370c/.system_generated/steps/"

DATA_MAP = [
    {"table": "countries", "type": "sys", "step": "1405"},
    {"table": "tax_rules", "type": "sys", "step": "1408"},
    {"table": "staff_roles", "type": "sys", "step": "1411"},
    {"table": "staff_permissions", "type": "sys", "step": "1414"},
    {"table": "role_permissions", "type": "sys", "step": "1418"},
    {"table": "notification_types", "type": "sys", "step": "1421"},
    {"table": "channels", "type": "sys", "data": [
        {"id": "11111111-1111-1111-1111-111111111111", "type": "IN_APP", "config": {}, "is_active": True, "name": "In-App Notifications"},
        {"id": "22222222-2222-2222-2222-222222222222", "type": "EMAIL", "config": {}, "is_active": True, "name": "Email Service"},
        {"id": "33333333-3333-3333-3333-333333333333", "type": "SMS", "config": {}, "is_active": True, "name": "SMS Gateway"},
        {"id": "44444444-4444-4444-4444-444444444444", "type": "PUSH", "config": {}, "is_active": True, "name": "Push Notifications"}
    ]},
    {"table": "notification_type_channels", "type": "sys", "step": "1431"},
    {"table": "kds_station", "type": "sys", "data": [
        {"id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e11", "name": "EXPO Aggregator", "station_type": "EXPO", "online": True},
        {"id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22", "name": "Grill Station", "station_type": "GRILL", "online": True},
        {"id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33", "name": "Fry Station", "station_type": "FRY", "online": True},
        {"id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e44", "name": "Bar Station", "station_type": "BAR", "online": True}
    ]},
    {"table": "kds_routing_rule", "type": "sys", "data": [
        {"id": "278e7b43-3685-4f2b-899a-e8e713a2b504", "station_id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33", "target_type": "CATEGORY", "target_id": "a1000000-0000-0000-0000-000000000001"},
        {"id": "3017440f-537b-4290-a013-8e7d90428b86", "station_id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22", "target_type": "CATEGORY", "target_id": "a1000000-0000-0000-0000-000000000002"},
        {"id": "5abf9250-e7ad-4715-83c3-bd9f47409e45", "station_id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22", "target_type": "CATEGORY", "target_id": "a1000000-0000-0000-0000-000000000003"},
        {"id": "542aa881-a447-4735-a22e-80443e306200", "station_id": "e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e44", "target_type": "CATEGORY", "target_id": "a1000000-0000-0000-0000-000000000004"}
    ]},
    {"table": "staff_member", "type": "sys", "data": [
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13", "full_name": "Hannah Host", "pin_hash": "$2a$10$DkWN.f8uJam5vZoSgbnr3efSfHq2z4XFahxIEsO8d.6cORf5hssUK", "active": True, "role_id": "00000000-0000-0000-0000-000000000105"},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14", "full_name": "Sam Server", "pin_hash": "$2a$10$nJnSnlQjK6xHIy6lt6STkuhHF0Tl9ivb1B9yj.b.DzCBryLa0xdp2", "active": True, "role_id": "00000000-0000-0000-0000-000000000101"},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15", "full_name": "Carlos Cashier", "pin_hash": "$2a$10$LXAT3Ev69vdJY/Sw8BwEDOrBGwJQf3kdfDoQqRvysRgaaJ4oCYZbO", "active": True, "role_id": "00000000-0000-0000-0000-000000000106"},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16", "full_name": "Brie Busser", "pin_hash": "$2a$10$uO3i1hJfgMvJ4nlqp0YZbO6sWCIZCzureSc3gEJE0n1R5rzvg/NIO", "active": True, "role_id": "00000000-0000-0000-0000-000000000107"},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "full_name": "Maria Manager", "pin_hash": "$2a$10$vwRlvaykjS3Je/7EJXlKkOLCIZGrAguY9nR8a1Daq66HHASRNer/.", "active": True, "role_id": "00000000-0000-0000-0000-000000000004"},
        {"id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "full_name": "Alex Owner", "pin_hash": "$2a$10$cuRLesBMc68B6FMcGLyfkeN11Qh4xjTKGhdQcLTXaZbjSMFx3R2W2", "active": True, "role_id": "00000000-0000-0000-0000-000000000001"}
    ]},
    {"table": "menu_category", "type": "mock", "data": [
        {"id": "a1000000-0000-0000-0000-000000000001", "name": "Starters", "display_order": 1, "default_course": 1},
        {"id": "a1000000-0000-0000-0000-000000000002", "name": "Burgers", "display_order": 2, "default_course": 2},
        {"id": "a1000000-0000-0000-0000-000000000003", "name": "Mains", "display_order": 3, "default_course": 2},
        {"id": "a1000000-0000-0000-0000-000000000004", "name": "Drinks", "display_order": 4, "default_course": 4}
    ]},
    {"table": "menu_item", "type": "mock", "step": "1447"},
    {"table": "inventory_location", "type": "mock", "data": [
        {"id": "f0000000-0000-0000-0000-000000000001", "name": "Walk-in Refrigerator", "storage_type": "COLD"},
        {"id": "f0000000-0000-0000-0000-000000000002", "name": "Main Freezer", "storage_type": "FROZEN"},
        {"id": "f0000000-0000-0000-0000-000000000003", "name": "Dry Storage Room", "storage_type": "DRY"},
        {"id": "f0000000-0000-0000-0000-000000000004", "name": "Counter Top", "storage_type": "AMBIENT"}
    ]}
]

def format_val(val):
    if val is None:
        return "NULL"
    if isinstance(val, (dict, list)):
        return f"'{json.dumps(val)}'::jsonb"
    if isinstance(val, str):
        # Escape single quotes
        safe_str = val.replace("'", "''")
        return f"'{safe_str}'"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    return str(val)

def generate_sql(table, data, type_suffix, version):
    if not data:
        return
    
    cols = sorted(data[0].keys())
    filename = f"V{version}__{table}_{type_suffix}.sql"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    sql = [f"-- Seed data for {table} ({type_suffix})", "BEGIN;"]
    
    for row in data:
        vals = [format_val(row.get(c)) for c in cols]
        
        # Determine the conflict target
        conflict_target = "(id)"
        if "id" not in row:
             if table == 'role_permissions':
                  conflict_target = "(role_id, permission_id)"
             elif table == 'notification_type_channels':
                  conflict_target = "(notification_type_id, channel_id)"
             else:
                  # Fallback to DO NOTHING without target if no ID
                  conflict_target = ""
        else:
             if table in ['staff_roles', 'staff_permissions', 'notification_types']:
                  conflict_target = "(code)" if table == 'notification_types' else "(name)"
        
        conflict_clause = f"ON CONFLICT {conflict_target} DO NOTHING" if conflict_target else "ON CONFLICT DO NOTHING"
        if not conflict_target and table in ['role_permissions', 'notification_type_channels']:
             # These should have been caught above, but just in case
             pass

        insert = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(vals)}) {conflict_clause};"
        sql.append(insert)
        
    sql.append("COMMIT;")
    
    with open(filepath, 'w') as f:
        f.write("\n".join(sql))
    print(f"Generated {filename}")

def main():
    version = 2
    for item in DATA_MAP:
        data = None
        if "data" in item:
            data = item["data"]
        elif "step" in item:
            step_file = os.path.join(STEPS_DIR, item["step"], "output.txt")
            if os.path.exists(step_file):
                with open(step_file, 'r') as f:
                    try:
                        data = json.load(f)
                    except:
                        print(f"Error loading JSON from {step_file}")
            else:
                print(f"Step file {step_file} not found")
        
        if data:
            generate_sql(item["table"], data, item["type"], version)
            version += 1

if __name__ == "__main__":
    main()
