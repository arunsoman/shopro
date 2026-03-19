import re

file_path = "/home/arun/IdeaProjects/shopro-pos/shopro-pos-server/src/main/resources/db/migration/V1__init_schema.sql"

with open(file_path, 'r') as f:
    lines = f.readlines()

protected_patterns = [
    re.compile(r'^TRUNCATE TABLE', re.IGNORECASE),
    re.compile(r'^DELETE FROM', re.IGNORECASE),
    re.compile(r'RENAME TO .*_old', re.IGNORECASE),
    re.compile(r'DROP TABLE .*_old', re.IGNORECASE),
    re.compile(r'DROP TABLE IF EXISTS .*_old', re.IGNORECASE),
    re.compile(r'ALTER TABLE .* DROP CONSTRAINT', re.IGNORECASE),
    re.compile(r'ALTER TABLE .*_old', re.IGNORECASE)
]

new_lines = []
for line in lines:
    clean_line = line.strip()
    if clean_line.startswith("-- [AGENT RECOVERY]"):
        new_lines.append(line)
        continue
        
    if any(p.search(clean_line) for p in protected_patterns):
        new_lines.append("-- [AGENT RECOVERY] " + line)
    else:
        new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print("Refined cleaning for ALTER TABLE DROP CONSTRAINT.")
