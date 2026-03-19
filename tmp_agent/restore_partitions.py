import re

file_path = "/home/arun/IdeaProjects/shopro-pos/shopro-pos-server/src/main/resources/db/migration/V1__init_schema.sql"

with open(file_path, 'r') as f:
    content = f.read()

# I will replace the non-partitioned versions with the partitioned ones I salvaged from previous tool outputs.

# 1. inventory_transaction
it_stmt = """CREATE TABLE inventory_transaction (
    id UUID NOT NULL,
    ingredient_id UUID NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    quantity_delta NUMERIC(12,4) NOT NULL,
    unit_cost_at_time NUMERIC(10,4),
    reason VARCHAR(256),
    reference_id UUID,
    metadata JSONB,
    created_by_id UUID,
    transacted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    PRIMARY KEY (id, transacted_at)
) PARTITION BY RANGE (transacted_at);"""

# 2. purchase_order
po_stmt = """CREATE TABLE purchase_order (
    id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    generated_by_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    total_value NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    expected_delivery_date DATE,
    approved_by_id UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);"""

# 3. kds_ticket
kds_stmt = """CREATE TABLE kds_ticket (
    id UUID NOT NULL,
    order_ticket_id UUID NOT NULL,
    station_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    fired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    bumped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);"""

def replace_stmt(content, table_name, new_stmt):
    # Regex to find the whole CREATE TABLE stmt for this table and replace it
    pattern = re.compile(r'CREATE TABLE (?:IF NOT EXISTS )?' + table_name + r'\s*\([^;]+;', re.IGNORECASE | re.DOTALL)
    if pattern.search(content):
        print(f"Replacing {table_name} definition...")
        return pattern.sub(new_stmt, content)
    else:
        print(f"Warning: {table_name} not found in script.")
        # If not found, add it before Indexes
        return content.replace("-- Indexes", new_stmt + "\n\n-- Indexes")

content = replace_stmt(content, "inventory_transaction", it_stmt)
content = replace_stmt(content, "purchase_order", po_stmt)
content = replace_stmt(content, "kds_ticket", kds_stmt)

# Also ensure partitions are at the bottom of the Tables section
with open(file_path, 'w') as f:
    f.write(content)

print("Restored partitioned table definitions.")
