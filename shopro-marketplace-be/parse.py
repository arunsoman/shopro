
import json
import re

# Read the JSON file
with open('Food.json', 'r') as f:
    content = f.read()

# Parse the JSON lines (each line is a separate JSON object)
foods = []
for line in content.strip().split('\n'):
    if line.strip():
        try:
            foods.append(json.loads(line))
        except json.JSONDecodeError:
            continue  # Skip malformed lines

# Function to escape SQL strings
def escape_sql(value):
    if value is None:
        return 'NULL'
    # Convert to string and escape single quotes
    value_str = str(value)
    # Escape single quotes by doubling them
    value_str = value_str.replace("'", "''")
    # Replace newlines and carriage returns with spaces
    value_str = value_str.replace('\n', ' ').replace('\r', ' ')
    # Replace tabs with spaces
    value_str = value_str.replace('\t', ' ')
    # Remove any other problematic characters but keep unicode
    value_str = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', value_str)
    return f"'{value_str}'"

# Generate SQL INSERT statements
sql_lines = []

# Add header comment
sql_lines.append("-- Food Database Insert Statements")
sql_lines.append(f"-- Generated from Food.json")
sql_lines.append(f"-- Total records: {len(foods)}")
sql_lines.append("")

# Create table statement
sql_lines.append("-- Create table if not exists")
sql_lines.append("CREATE TABLE IF NOT EXISTS food (")
sql_lines.append("    id INTEGER PRIMARY KEY,")
sql_lines.append("    name VARCHAR(255),")
sql_lines.append("    name_scientific VARCHAR(255),")
sql_lines.append("    description TEXT,")
sql_lines.append("    food_group VARCHAR(100),")
sql_lines.append("    food_subgroup VARCHAR(100)")
sql_lines.append(");")
sql_lines.append("")
sql_lines.append("-- Insert statements")
sql_lines.append("")

# Generate INSERT statements
for food in foods:
    id_val = food.get("id")
    name = food.get("name")
    name_scientific = food.get("name_scientific")
    description = food.get("description")
    food_group = food.get("food_group")
    food_subgroup = food.get("food_subgroup")
    
    insert_stmt = f"INSERT INTO food (id, name, name_scientific, description, food_group, food_subgroup) VALUES ({id_val}, {escape_sql(name)}, {escape_sql(name_scientific)}, {escape_sql(description)}, {escape_sql(food_group)}, {escape_sql(food_subgroup)});"
    
    sql_lines.append(insert_stmt)

# Write to food.sql file
output_path = 'food.sql'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"✅ SQL file generated successfully!")
print(f"📁 Location: {output_path}")
print(f"📊 Total INSERT statements: {len(foods)}")

# Show first 5 INSERT statements as preview
print("\n" + "="*80)
print("PREVIEW: First 5 INSERT statements")
print("="*80 + "\n")

# Find first 5 insert statements
insert_count = 0
for line in sql_lines:
    if line.startswith("INSERT INTO"):
        insert_count += 1
        # Truncate long descriptions for display
        if len(line) > 300:
            display_line = line[:300] + "..." + line[-50:]
        else:
            display_line = line
        print(f"-- Record {insert_count}")
        print(display_line)
        print()
        if insert_count >= 5:
            break

print(f"\n✅ Full SQL file saved with {len(foods)} INSERT statements")
