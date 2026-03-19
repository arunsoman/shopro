import re

file_path = "/home/arun/IdeaProjects/shopro-pos/shopro-pos-server/src/main/resources/db/migration/V1__init_schema.sql"

with open(file_path, 'r') as f:
    content = f.read()

# Split into statements
statements = re.split(r';\s*', content)

tables = {}
indexes = {}
constraints = []
triggers = []
other = []

table_name_regex = re.compile(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)', re.IGNORECASE)
index_name_regex = re.compile(r'CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)', re.IGNORECASE)

# Flexible regex for inline references
inline_ref_regex = re.compile(r'(\w+)\s+(\w+)(?:\s+(.*?))?\s+REFERENCES\s+(\w+)\s*\(([^)]+)\)(.*)', re.IGNORECASE)

for stmt in statements:
    stmt = stmt.strip()
    if not stmt or stmt.startswith("-- [AGENT RECOVERY]"):
        continue
    
    stmt_upper = stmt.upper()
    
    # Check for Tables
    table_match = table_name_regex.search(stmt)
    if table_match and stmt_upper.startswith("CREATE TABLE"):
        tname = table_match.group(1).lower()
        
        if "PARTITION OF" in stmt_upper:
            pass
        else:
            lines = stmt.split('\n')
            cleaned_lines = []
            for line in lines:
                m = inline_ref_regex.search(line)
                if m:
                    col_name = m.group(1)
                    col_type = m.group(2)
                    modifiers = m.group(3) or ""
                    target_table = m.group(4)
                    target_col = m.group(5)
                    extra = m.group(6) or ""
                    
                    # Add to constraints
                    constraints.append(f"ALTER TABLE {tname} ADD CONSTRAINT fk_{tname}_{col_name} FOREIGN KEY ({col_name}) REFERENCES {target_table}({target_col}){extra.strip()}")
                    
                    # Cleaned line: keep column but remove reference
                    cleaned_lines.append(f"    {col_name} {col_type} {modifiers},")
                else:
                    cleaned_lines.append(line)
            
            stmt = "\n".join(cleaned_lines)
            stmt = re.sub(r',\s*\)', r'\n)', stmt)
            
        tables[tname] = stmt
        continue

    # Other statements
    index_match = index_name_regex.search(stmt)
    if index_match and (stmt_upper.startswith("CREATE INDEX") or stmt_upper.startswith("CREATE UNIQUE INDEX")):
        indexes[index_match.group(1).lower()] = stmt
    elif stmt_upper.startswith("ALTER TABLE") and "ADD CONSTRAINT" in stmt_upper:
        constraints.append(stmt)
    elif stmt_upper.startswith("CREATE SEQUENCE") or stmt_upper.startswith("CREATE TYPE"):
        other.insert(0, stmt)
    elif stmt_upper.startswith("BEGIN") or stmt_upper.startswith("COMMIT"):
        continue
    else:
        other.append(stmt)

final_script = [
    "-- V1__init_schema.sql (Fully Refactored for Zero-Dependency Table Order)",
    "BEGIN;",
    "",
    "-- Types and Sequences",
    * [s + ";" for s in other if "CREATE SEQUENCE" in s.upper() or "CREATE TYPE" in s.upper()],
    "",
    "-- Tables",
    * [s + ";" for s in tables.values()],
    "",
    "-- Indexes",
    * [s + ";" for s in indexes.values()],
    "",
    "-- Constraints",
    * [s + ";" for s in constraints],
    "",
    "-- Triggers and Functions",
    * [s + ";" for s in triggers],
    "",
    "COMMIT;"
]

with open(file_path, 'w') as f:
    f.write("\n".join(final_script))

print(f"Refactored: {len(tables)} tables, {len(constraints)} constraints.")
