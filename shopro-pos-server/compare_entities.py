import re
import os

def to_snake_case(name):
    # Handle acronyms like POSTerminal -> pos_terminal
    # But usually just regular snake_case conversion.
    # A better snake_case that handles acronyms.
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    return s2

sql_tables = set()
with open("src/main/resources/db/migration/V1__init_schema.sql", "r") as f:
    for line in f:
        match = re.search(r"CREATE TABLE (\w+)", line)
        if match:
            sql_tables.add(match.group(1))

# Also common mapping: plurals, etc. But if it's missing, it's missing.

entity_files = []
for root, dirs, files in os.walk("src/main/java/mls/sho/dms"):
    for file in files:
        if file.endswith(".java"):
            entity_files.append(os.path.join(root, file))

results = []
for file_path in entity_files:
    with open(file_path, "r") as f:
        content = f.read()
        if "@Entity" in content:
            class_match = re.search(r"public class (\w+)", content)
            if not class_match:
                continue
            class_name = class_match.group(1)
            
            table_name = None
            if "@Table" in content:
                table_start = content.find("@Table")
                # Look for name = "..." within the @Table annotation
                # Assuming the annotation ends before the next @ or public class
                search_region = content[table_start:table_start+500]
                # Match the first name = "..." after @Table
                name_match = re.search(r'name\s*=\s*"([^"]+)"', search_region)
                if name_match:
                    table_name = name_match.group(1)
            
            if not table_name:
                table_name = to_snake_case(class_name)
            
            exists = table_name in sql_tables
            results.append((class_name, table_name, exists, file_path))

for class_name, table_name, exists, file_path in sorted(results):
    status = "OK" if exists else "MISSING"
    print(f"{status} | {class_name} | {table_name} | {file_path}")
