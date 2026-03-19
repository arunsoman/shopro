import json
import re
import os

cols_file = "/home/arun/.gemini/antigravity/brain/63e4faa3-bd7b-4129-adf2-7fa096f8370c/.system_generated/steps/758/output.txt"
keys_file = "/home/arun/.gemini/antigravity/brain/63e4faa3-bd7b-4129-adf2-7fa096f8370c/.system_generated/steps/761/output.txt"
output_file = "/home/arun/IdeaProjects/shopro-pos/shopro-pos-server/src/main/resources/db/migration/V1__init_schema.sql"

if not os.path.exists(cols_file) or not os.path.exists(keys_file):
    print("Error: Metadata files not found.")
    exit(1)

with open(cols_file, 'r') as f:
    cols_data = json.load(f)

with open(keys_file, 'r') as f:
    keys_data = json.load(f)

tables = {}
for col in cols_data:
    tname = col['table_name']
    if tname not in tables:
        tables[tname] = []
    tables[tname].append(col)

pks = {}
fks = {}
for key in keys_data:
    tname = key['table_name']
    if key['constraint_type'] == 'PRIMARY KEY':
        if tname not in pks: pks[tname] = set()
        pks[tname].add(key['column_name'])
    elif key['constraint_type'] == 'FOREIGN KEY':
        if tname not in fks: fks[tname] = []
        fks[tname].append(key)

partition_by = {
    "inventory_transaction": "RANGE (transacted_at)",
    "purchase_order": "HASH (id)",
    "kds_ticket": "HASH (id)"
}

skip_tables = [
    "inventory_transaction_y2024", "inventory_transaction_y2025",
    "purchase_order_p0", "purchase_order_p1", "purchase_order_p2", "purchase_order_p3",
    "kds_ticket_p0", "kds_ticket_p1", "kds_ticket_p2", "kds_ticket_p3"
]

sql = [
    "-- V1__init_schema.sql (Patched for Seed Data Compatibility)",
    "BEGIN;",
    "",
    "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";",
    ""
]

audit_columns = {'created_at', 'updated_at', 'version'}
# Common boolean flags that should default to true for seed compatibility
boolean_flags = {'is_active', 'is_mutable', 'is_enabled', 'is_visible', 'is_staff'}

# Specific overrides for seed data compatibility
defaults_overrides = {
    "channels": {
        "name": "'system'",
        "config": "'{}'::jsonb"
    }
}

# Known unique columns that information_schema might miss if they are unique indexes
unique_columns_map = {
    "notification_types": ["code"],
    "staff_roles": ["name"],
    "staff_permissions": ["name"],
    "countries": ["iso_code"]
}

for tname in sorted(tables.keys()):
    if tname in skip_tables or tname == 'flyway_schema_history':
        continue
    
    table_sql = [f"CREATE TABLE {tname} ("]
    col_lines = []
    
    table_pks = pks.get(tname, set())
    t_unique_cols = unique_columns_map.get(tname, [])
    
    for col in tables[tname]:
        cname = col['column_name']
        ctype = col['data_type']
        line = f"    {cname} {ctype}"
        if col['is_nullable'] == 'NO':
            line += " NOT NULL"
        
        default = col['column_default']
        if default:
            default = re.sub(r'::[a-z ]+', '', default)
            line += f" DEFAULT {default}"
        elif tname in defaults_overrides and cname in defaults_overrides[tname]:
             line += f" DEFAULT {defaults_overrides[tname][cname]}"
        elif cname in audit_columns:
            if cname == 'version':
                line += " DEFAULT 0"
            else:
                line += " DEFAULT now()"
        elif cname in boolean_flags and ctype.lower() == 'boolean':
            line += " DEFAULT TRUE"
        elif cname in table_pks and ctype.lower() == 'uuid':
            line += " DEFAULT gen_random_uuid()"
        
        col_lines.append(line)
    
    if tname in pks:
        pk_cols = list(pks[tname])
        if tname == 'inventory_transaction' and 'transacted_at' not in pk_cols:
            pk_cols.append('transacted_at')
        col_lines.append(f"    PRIMARY KEY ({', '.join(sorted(pk_cols))})")
    
    if tname in unique_columns_map:
        for uc in unique_columns_map[tname]:
            col_lines.append(f"    CONSTRAINT uk_{tname}_{uc} UNIQUE ({uc})")
    
    table_sql.append(",\n".join(col_lines))
    
    if tname in partition_by:
        table_sql.append(f") PARTITION BY {partition_by[tname]};")
    else:
        table_sql.append(");")
    
    sql.append("\n".join(table_sql))
    sql.append("")

# Partitions
sql.append("-- Partitions")
sql.append("CREATE TABLE inventory_transaction_y2024 PARTITION OF inventory_transaction FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');")
sql.append("CREATE TABLE inventory_transaction_y2025 PARTITION OF inventory_transaction FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');")
for i in range(4):
    sql.append(f"CREATE TABLE purchase_order_p{i} PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER {i});")
for i in range(4):
    sql.append(f"CREATE TABLE kds_ticket_p{i} PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER {i});")
sql.append("")

# Foreign Keys
sql.append("-- Foreign Keys")
for tname in sorted(fks.keys()):
    if tname in skip_tables: continue
    for fk in sorted(fks[tname], key=lambda x: x['column_name']):
        sql.append(f"ALTER TABLE {tname} ADD CONSTRAINT fk_{tname}_{fk['column_name']} FOREIGN KEY ({fk['column_name']}) REFERENCES {fk['foreign_table_name']}({fk['foreign_column_name']});")

sql.append("\nCOMMIT;")

with open(output_file, 'w') as f:
    f.write("\n".join(sql))

print(f"Generated {output_file} with seed data compatibility defaults and named unique constraints.")
