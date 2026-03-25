#!/bin/bash

# Shopro POS Database Cleanup Script
# This script truncates all transactional data while preserving:
# - Floor Plan (Sections & Tables)
# - Staff & Authentication
# - Menu Categories, Items & Modifiers
# - Tax Rules & Regional Settings
# - Master Data (Suppliers, Ingredients, Recipes)

# Database Configuration
DB_NAME=${DB_NAME:-shopro_pos}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "--- Shopro POS Database Cleanup Started ---"
echo "Target: $DB_NAME on $DB_HOST:$DB_PORT"

# SQL Command to truncate transactional tables and reset table status
SQL_COMMAND=$(cat <<EOF
-- Reset Table Statuses to AVAILABLE
UPDATE table_shape SET status = 'AVAILABLE';

-- Truncate Transactional Tables
TRUNCATE TABLE 
    -- Orders & Payments
    order_ticket, order_item, order_item_modifier, order_audit_log, 
    payment, tax_calculation_results, tax_audit_logs,
    -- KDS
    kds_ticket, kds_ticket_item,
    -- Front of House
    waitlist_entry, reservation, tableside_session, guest_cart_item,
    -- Customers & Loyalty
    customer_profile, loyalty_transaction, 
    -- Inventory Transactions & Procurement
    inventory_transaction, purchase_order, purchase_order_line, 
    sub_order, bid_invitation, bid_item, quote, quote_item,
    -- Marketplace & Analytics
    financial_transaction, invoice, platform_transaction, transit_event, 
    quality_audit, platform_holding, ledger_entry, ai_insight,
    -- System Logs
    in_app_notification, audit_log, notification_recipient_mapping
CASCADE;

-- Optional: Reset sequences if any exist for manual ID fields
-- (Most Shopro tables use UUIDs so this is usually not required)
EOF
)

# Execute SQL via psql
export PGPASSWORD=${PGPASSWORD:-password}

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$SQL_COMMAND"

if [ $? -eq 0 ]; then
    echo "--- Cleanup Completed Successfully ---"
    echo "Table statuses reset to AVAILABLE, and all transactional data cleared."
else
    echo "--- Cleanup Failed ---"
    echo "Please check your database connectivity and credentials."
    exit 1
fi
