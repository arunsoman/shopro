
import os
import re

ENTITY_DIR = "/home/arun/IdeaProjects/shopro-pos/shopro-pos-server/src/main/java/mls/sho/dms/"
OUTPUT_FILE = "/home/arun/IdeaProjects/shopro-pos/shopro-pos-server/src/main/resources/db/migration/V1__init_schema.sql"

JAVA_TO_PG_TYPES = {
    "UUID": "uuid",
    "Instant": "timestamp with time zone",
    "LocalDateTime": "timestamp with time zone",
    "String": "character varying",
    "Long": "bigint",
    "Integer": "integer",
    "int": "integer",
    "Boolean": "boolean",
    "boolean": "boolean",
    "BigDecimal": "numeric(19,4)",
    "Double": "double precision",
    "float": "real",
    "byte[]": "bytea",
    "Map": "jsonb",
    "Set": "jsonb",
    "List": "jsonb"
}

def remove_comments(text):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    text = re.sub(r'//.*', '', text)
    return text

def parse_java_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Preliminary check for @Entity
    if "@Entity" not in content:
        return None

    content = remove_comments(content)

    # Extract class name and parent class
    class_match = re.search(r"class\s+(\w+)(?:\s+extends\s+(\w+))?", content)
    if not class_match:
        return None
    
    class_name = class_match.group(1)
    extends_name = class_match.group(2)
    
    # Extract table name with multi-line support
    table_match = re.search(r'@Table\(\s*name\s*=\s*"([^"]+)"', content, re.DOTALL)
    if table_match:
        table_name = table_match.group(1)
    else:
        # Better fallback: KDSStation -> kds_station, AIInsight -> ai_insight
        table_name = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', class_name).lower()

    fields = []
    
    # BaseEntity fields
    if extends_name == "BaseEntity":
        fields.extend([
            {"name": "id", "type": "uuid", "is_nullable": False, "is_pk": True, "default": "gen_random_uuid()"},
            {"name": "created_at", "type": "timestamp with time zone", "is_nullable": False, "default": "now()"},
            {"name": "updated_at", "type": "timestamp with time zone", "is_nullable": False, "default": "now()"},
            {"name": "version", "type": "bigint", "is_nullable": False, "default": "0"}
        ])

    # Find declarations with annotations (allowing for optional initialization like = false)
    decl_pattern = re.compile(r'((?:@[A-Za-z0-9_\(\)\s,.="]+(?:\n\s*)*)*)\s*(?:private|protected|public)\s+([\w<>\[\],\s]+)\s+(\w+)(?:\s*=[^;]+)?\s*;', re.DOTALL)
    
    unique_constraints_match = re.search(r'uniqueConstraints\s*=\s*\{([^}]+)\}', content, re.DOTALL)
    table_unique_cols = []
    if unique_constraints_match:
        inner = unique_constraints_match.group(1)
        # Find all columnNames = "name" or columnNames = {"name1", "name2"}
        cols_match = re.findall(r'columnNames\s*=\s*(?:\{([^}]+)\}|"([^"]+)")', inner)
        for c1, c2 in cols_match:
            if c1:
                table_unique_cols.append([c.strip().strip('"') for c in c1.split(',')])
            else:
                table_unique_cols.append([c2])

    for match in decl_pattern.finditer(content):
        annotations = match.group(1).strip()
        j_type_raw = match.group(2).strip()
        j_name = match.group(3).strip()
        
        j_type = re.sub(r'<.*>', '', j_type_raw)

        if j_name in [f['name'] for f in fields]:
            continue
            
        if annotations.find("@Id") == -1 and not annotations:
             continue
             
        # Skip collection fields that are just for JPA mapping
        if ("@OneToMany" in annotations or "@ManyToMany" in annotations) and ("@Column" not in annotations):
            continue

        col_name_match = re.search(r'name\s*=\s*"([^"]+)"', annotations, re.DOTALL)
        col_name = col_name_match.group(1) if col_name_match else re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', j_name).lower()
        
        # Prevent duplication of columns (e.g. if entity redeclares BaseEntity fields)
        if col_name in [f['name'] for f in fields]:
            continue

        is_fk = "@JoinColumn" in annotations or "@ManyToOne" in annotations or "@OneToOne" in annotations
        pg_type = JAVA_TO_PG_TYPES.get(j_type, "character varying")
        
        # If it's a foreign key, it must be a UUID in this system
        if is_fk:
            pg_type = "uuid"
            
        if "SqlTypes.JSON" in annotations or "columnDefinition\s*=\s*\"jsonb\"" in annotations:
            pg_type = "jsonb"
            
        is_nullable = "nullable = false" not in annotations
        is_unique = "unique = true" in annotations
        length_match = re.search(r'length\s*=\s*(\d+)', annotations)
        length = length_match.group(1) if length_match else None
        
        if length and pg_type == "character varying":
            pg_type = f"character varying({length})"
        
        if "@Enumerated" in annotations:
             pg_type = "character varying(50)"

        fields.append({
            "name": col_name,
            "type": pg_type,
            "is_nullable": is_nullable,
            "is_unique": is_unique,
            "is_fk": is_fk,
            "is_pk": "@Id" in annotations
        })

    jointables = []
    jt_matches = re.finditer(r'@JoinTable\(\s*name\s*=\s*"([^"]+)"\s*,\s*joinColumns\s*=\s*@JoinColumn\(name\s*=\s*"([^"]+)"\)\s*,\s*inverseJoinColumns\s*=\s*@JoinColumn\(name\s*=\s*"([^"]+)"\)\s*\)', content, re.DOTALL)
    for jt in jt_matches:
        # Check if already added
        if not any(j['table_name'] == jt.group(1) for j in jointables):
            jointables.append({
                "table_name": jt.group(1),
                "join_col": jt.group(2),
                "inverse_join_col": jt.group(3)
            })

    return {
        "class_name": class_name,
        "table_name": table_name,
        "fields": fields,
        "unique_constraints": table_unique_cols,
        "jointables": jointables
    }

def main():
    all_entities = []
    all_jointables = []
    for root, dirs, files in os.walk(ENTITY_DIR):
        for file in files:
            if file.endswith(".java") and file != "BaseEntity.java":
                res = parse_java_file(os.path.join(root, file))
                if res and res['fields']:
                    all_entities.append(res)
                    if res.get("jointables"):
                        all_jointables.extend(res["jointables"])
    
    all_entities.sort(key=lambda x: x['table_name'])
    
    sql = [
        "-- V1__init_schema.sql (Pure Extraction from JPA Entities)",
        "BEGIN;",
        "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";",
        ""
    ]
    
    processed_tables = set()

    for entity in all_entities:
        tname = entity['table_name']
        if tname in processed_tables: continue
        processed_tables.add(tname)
        
        sql.append(f"CREATE TABLE {tname} (")
        col_lines = []
        for f in entity['fields']:
            line = f"    {f['name']} {f['type']}"
            if not f['is_nullable']:
                line += " NOT NULL"
            if "default" in f:
                line += f" DEFAULT {f['default']}"
            if f.get('is_unique'):
                line += " UNIQUE"
            col_lines.append(line)
        
        pk_cols = [f['name'] for f in entity['fields'] if f.get('is_pk')]
        if not pk_cols: pk_cols = ["id"]
        
        # Partitioning requirement: PK must include partition key
        if tname == "inventory_transaction":
            if "transacted_at" not in pk_cols:
                pk_cols.append("transacted_at")
            
            sql.append(",\n".join(col_lines + [f"    PRIMARY KEY ({', '.join(pk_cols)})"]))
            sql.append(") PARTITION BY RANGE (transacted_at);")
        elif tname in ["purchase_order", "kds_ticket"]:
            # Hash partitioned by ID, PK (id) is valid
            sql.append(",\n".join(col_lines + [f"    PRIMARY KEY ({', '.join(pk_cols)})"]))
            sql.append(f") PARTITION BY HASH ({pk_cols[0]});")
        else:
            # Add table-level unique constraints
            constraint_lines = []
            for u_cols in entity.get("unique_constraints", []):
                constraint_lines.append(f"    UNIQUE ({', '.join(u_cols)})")
            
            final_lines = col_lines + constraint_lines + [f"    PRIMARY KEY ({', '.join(pk_cols)})"]
            sql.append(",\n".join(final_lines))
            sql.append(");")
        sql.append("")

    # Generate Join Tables
    jt_seen = set()
    # Merge both sources of join tables
    combined_jt = all_jointables[:]
    for entry in all_entities:
        combined_jt.extend(entry.get("jointables", []))

    for jt in combined_jt:
        if jt["table_name"] in jt_seen:
            continue
        jt_seen.add(jt["table_name"])
        sql.append(f"CREATE TABLE {jt['table_name']} (")
        sql.append(f"    {jt['join_col']} uuid NOT NULL,")
        sql.append(f"    {jt['inverse_join_col']} uuid NOT NULL,")
        sql.append(f"    PRIMARY KEY ({jt['join_col']}, {jt['inverse_join_col']})")
        sql.append(");")
        sql.append("")

    sql.append("-- Partitions")
    sql.append("CREATE TABLE inventory_transaction_y2024 PARTITION OF inventory_transaction FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');")
    sql.append("CREATE TABLE inventory_transaction_y2025 PARTITION OF inventory_transaction FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');")
    for i in range(4):
        sql.append(f"CREATE TABLE purchase_order_p{i} PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER {i});")
    for i in range(4):
        sql.append(f"CREATE TABLE kds_ticket_p{i} PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER {i});")
    sql.append("")

    sql.append("-- Foreign Keys (Heuristic)")
    for entity in all_entities:
        tname = entity['table_name']
        for f in entity['fields']:
            if f.get('is_fk') and f['name'].endswith('_id'):
                target_table = f['name'][:-3]
                if any(e['table_name'] == target_table for e in all_entities):
                    sql.append(f"ALTER TABLE {tname} ADD CONSTRAINT fk_{tname}_{f['name']} FOREIGN KEY ({f['name']}) REFERENCES {target_table}(id);")

    sql.append("\nCOMMIT;")
    
    with open(OUTPUT_FILE, 'w') as f:
        f.write("\n".join(sql))
    print(f"Generated {OUTPUT_FILE} from {len(all_entities)} entities.")

if __name__ == "__main__":
    main()
