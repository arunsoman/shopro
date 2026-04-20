# Accounting Data Model Documentation

## Overview

This document describes all database tables related to accounting in Shopro POS, including their structure, purpose, and relationships.

---

## Table of Contents

1. [Core POS Tables (Source Data)](#core-pos-tables)
2. [Accounting Module Tables](#accounting-module-tables)
3. [Ledger Entry Flow](#ledger-entry-flow)

---

## Core POS Tables (Source Data)

These tables are the **source of truth** for accounting transactions. They are NOT part of the accounting module but feed into it.

### 1. `restaurant_order` - Order Header

**Purpose**: Records every customer order and payment

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `session_id` | BIGINT | Link to table session |
| `order_number` | VARCHAR | Unique order number (e.g., "ORD-00001") |
| `total_amount` | DECIMAL(12,2) | **Total collected including tax** |
| `tax_amount` | DECIMAL(12,2) | Tax amount collected |
| `tip_amount` | DECIMAL(12,2) | Tips collected |
| `discount_amount` | DECIMAL(12,2) | Discounts applied |
| `status` | VARCHAR | PENDING, PAID, CANCELLED |
| `created_at` | TIMESTAMP | Order creation time |
| `void_reason` | VARCHAR | Reason if voided |
| `void_employee_id` | BIGINT | Who voided the order |

**Accounting Relevance**: 
- When status = PAID, this becomes a source for daily sales recording
- `total_amount` = sales + tax (what customer paid)
- `total_amount - tax_amount` = actual sales revenue

---

### 2. `order_line` - Order Line Items

**Purpose**: Individual items ordered in each transaction

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `order_id` | BIGINT | FK to restaurant_order |
| `menu_item_id` | BIGINT | FK to menu_item |
| `quantity` | INTEGER | Quantity ordered |
| `unit_price` | DECIMAL(12,2) | Price per unit |
| `subtotal` | DECIMAL(12,2) | quantity × unit_price |

**Accounting Relevance**: 
- Used for category-based sales reporting (Food vs Beverage vs Alcohol)
- Links to `menu_cost_group` for category classification

---

### 3. `menu_item` - Menu Items

**Purpose**: Items sold at the restaurant

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `group_id` | BIGINT | FK to menu_cost_group (CATEGORY) |
| `pos_id` | VARCHAR | POS system ID |
| `name` | VARCHAR | Item name |
| `sell_price` | DECIMAL(12,2) | Selling price |
| `plate_cost` | DECIMAL(12,2) | Cost to make (for COGS) |

**Accounting Relevance**: 
- `group_id` links to category for sales breakdown
- `plate_cost` used for Cost of Goods Sold (COGS) calculation

---

### 4. `menu_cost_group` - Menu Categories

**Purpose**: Groups menu items by category

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `name` | VARCHAR | Category name (Food, Beverage, Alcohol) |
| `display_order` | INTEGER | Sort order |
| `target_food_cost_pct` | DECIMAL | Target food cost % |

**Accounting Relevance**: 
- Maps to revenue accounts in P&L
- Example: "Food" → Account 4100, "Alcohol" → Account 4210

---

### 5. `table_session` - Table Session

**Purpose**: Tracks table/guest session

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `table_id` | BIGINT | FK to table |
| `guest_count` | INTEGER | Number of guests |
| `started_at` | TIMESTAMP | When session started |
| `closed_at` | TIMESTAMP | When session ended |

**Accounting Relevance**: 
- `guest_count` used for per-person metrics (check average)

---

## Accounting Module Tables

These tables store all financial accounting data.

---

### 1. `accounting_chart_of_accounts` - Chart of Accounts

**Purpose**: Master list of all accounts (the "dictionary" of accounts)

| Column | Type | Description |
|--------|------|-------------|
| `account_id` | UUID | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `account_code` | VARCHAR(50) | Account number (e.g., "1000", "4100") |
| `account_name` | VARCHAR | Account name (e.g., "Cash - General") |
| `account_type` | VARCHAR | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| `account_sub_type` | VARCHAR | Sub-category (Cash, Bank, etc.) |
| `parent_account_id` | UUID | For hierarchical accounts |
| `description` | TEXT | Account description |
| `default_tax_rate` | DECIMAL | Default tax rate |
| `is_taxable` | BOOLEAN | Whether subject to tax |
| `is_active` | BOOLEAN | Account is active |
| `allow_manual_entry` | BOOLEAN | Can manually post to this |
| `balance` | DECIMAL | Current balance |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Key Restaurant Accounts**:

| Code | Name | Type |
|------|------|------|
| 1000 | Cash - General | ASSET |
| 1040 | Bank - Operating Account | ASSET |
| 1100 | Accounts Receivable | ASSET |
| 2000 | Accounts Payable | LIABILITY |
| 2200 | Sales Tax Payable | LIABILITY |
| 2300 | Tips Payable | LIABILITY |
| 2400 | Wages Payable | LIABILITY |
| 3000 | Owner Equity | EQUITY |
| 4100 | Food Sales | REVENUE |
| 4200 | Beverage Sales | REVENUE |
| 4210 | Alcohol Sales | REVENUE |
| 4300 | Takeout Sales | REVENUE |
| 5100 | Food Cost | EXPENSE |
| 5200 | Beverage Cost | EXPENSE |
| 6000 | Wages Expense | EXPENSE |
| 6100 | Payroll Tax Expense | EXPENSE |
| 6700 | Rent Expense | EXPENSE |
| 6710 | Utilities Expense | EXPENSE |

---

### 2. `accounting_ledger` - Double-Entry Ledger

**Purpose**: The heart of double-entry accounting. Every transaction creates TWO entries (debit and credit)

| Column | Type | Description |
|--------|------|-------------|
| `entry_id` | UUID | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `transaction_date` | DATE | Date of transaction |
| `entry_type` | VARCHAR | JOURNAL, ADJUSTMENT, etc. |
| `reference_number` | VARCHAR | External reference |
| `reference_id` | UUID | Link to source (e.g., order_id) |
| `reference_type` | VARCHAR | Source type (e.g., "ORDER") |
| `description` | TEXT | Transaction description |
| `account_id` | UUID | FK to chart_of_accounts |
| `account_code` | VARCHAR | Account number |
| `account_name` | VARCHAR | Account name (denormalized) |
| `debit_amount` | DECIMAL | Debit amount (if debiting this account) |
| `credit_amount` | DECIMAL | Credit amount (if crediting this account) |
| `tax_amount` | DECIMAL | Tax portion |
| `tax_rate` | DECIMAL | Tax rate applied |
| `currency` | VARCHAR | Currency code (USD) |
| `staff_id` | UUID | Staff involved |
| `staff_name` | VARCHAR | Staff name |
| `category` | VARCHAR | Category (SALES, EXPENSE, etc.) |
| `notes` | TEXT | Additional notes |
| `is_reconciled` | BOOLEAN | Has been reconciled |
| `created_by` | VARCHAR | Who created |
| `created_at` | TIMESTAMP | Creation time |

**Golden Rule**: For every transaction, sum(DEBIT) = sum(CREDIT)

**Example - Daily Sales Recording**:

| entry_id | account_code | debit_amount | credit_amount | description |
|----------|--------------|--------------|---------------|-------------|
| xxx-001 | 1000 (Cash) | 1,100.00 | | Daily sales collected |
| xxx-002 | 4100 (Sales) | | 1,000.00 | Daily sales revenue |
| xxx-003 | 2200 (Tax Payable) | | 100.00 | Tax collected |
| xxx-004 | 2300 (Tips Payable) | | 150.00 | Tips collected |

**Debits = Credits**: 1,100 = 1,000 + 100 + 150 ✓

---

### 3. `accounting_salary_disbursement` - Salary Payments

**Purpose**: Tracks employee payroll and tax withholdings

| Column | Type | Description |
|--------|------|-------------|
| `disbursement_id` | UUID | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `staff_id` | UUID | FK to staff |
| `staff_name` | VARCHAR | Employee name |
| `pay_period_start` | DATE | Pay period start |
| `pay_period_end` | DATE | Pay period end |
| `pay_date` | DATE | Date paid |
| `hourly_rate` | DECIMAL | Hourly rate |
| `total_hours` | DECIMAL | Hours worked |
| `gross_pay` | DECIMAL | Total before taxes |
| `federal_tax` | DECIMAL | Federal income tax |
| `state_tax` | DECIMAL | State income tax |
| `local_tax` | DECIMAL | Local income tax |
| `social_security_tax` | DECIMAL | SS tax (6.2%) |
| `medicare_tax` | DECIMAL | Medicare (1.45%) |
| `other_deductions` | DECIMAL | Other deductions |
| `total_tax` | DECIMAL | Total all taxes |
| `net_pay` | DECIMAL | Take-home pay |
| `payment_method` | VARCHAR | CASH, CHECK, BANK |
| `payment_reference` | VARCHAR | Check/transfer ref |
| `status` | VARCHAR | PENDING, PROCESSED, DISBURSED |
| `ledger_entry_id` | UUID | Link to ledger entries |
| `notes` | TEXT | Notes |
| `approved_by` | VARCHAR | Who approved |
| `approved_at` | TIMESTAMP | Approval time |
| `created_by` | VARCHAR | Who created |
| `created_at` | TIMESTAMP | Creation time |

**Ledger Entries for Payroll**:

| account_code | debit_amount | credit_amount | description |
|--------------|--------------|---------------|-------------|
| 6000 (Wages Expense) | 2,000.00 | | Record wages expense |
| 6100 (Payroll Tax Exp) | 200.00 | | Record employer tax expense |
| 1000 (Cash) | | 1,500.00 | Pay employee |
| 2200 (Fed Tax Payable) | | 300.00 | Withheld federal tax |
| 2200 (State Tax Payable) | | 200.00 | Withheld state tax |
| 2100 (SS Payable) | | 124.00 | SS tax withheld |
| 2100 (Medicare Payable) | | 29.00 | Medicare withheld |

---

### 4. `accounting_tax_config` - Tax Configuration

**Purpose**: Configurable tax rates by location

| Column | Type | Description |
|--------|------|-------------|
| `tax_config_id` | UUID | Primary key |
| `restaurant_id` | BIGINT | Restaurant (null = global) |
| `country_code` | VARCHAR | Country (US, CA, etc.) |
| `state_code` | VARCHAR | State/Province |
| `local_code` | VARCHAR | City/County |
| `tax_name` | VARCHAR | Tax name (e.g., "State Sales Tax") |
| `tax_type` | VARCHAR | SALES, INCOME, PAYROLL |
| `tax_rate` | DECIMAL | Rate (e.g., 9.3 for 9.3%) |
| `tax_applies_to` | VARCHAR | What it applies to |
| `is_active` | BOOLEAN | Is active |
| `priority` | INTEGER | Priority if multiple |
| `effective_from` | TIMESTAMP | Start date |
| `effective_to` | TIMESTAMP | End date |
| `description` | TEXT | Description |
| `account_code` | VARCHAR | Liability account |
| `created_at` | TIMESTAMP | Creation time |

**Example US Restaurant Configuration**:

| tax_name | tax_type | tax_rate | account_code |
|----------|----------|----------|--------------|
| Federal Income Tax | INCOME | 10-24% (progressive) | 2200 |
| State Tax (CA) | INCOME | 9.3% | 2200 |
| State Tax (NY) | INCOME | 6.85% | 2200 |
| State Tax (TX) | INCOME | 0% | 2200 |
| Social Security | PAYROLL | 6.2% | 2100 |
| Medicare | PAYROLL | 1.45% | 2100 |
| Federal Unemployment | PAYROLL | 0.6% | 2100 |
| Sales Tax (CA) | SALES | 7.25% | 2200 |

---

### 5. `accounting_invoice` - Accounts Payable Invoices

**Purpose**: Tracks supplier invoices and payments

| Column | Type | Description |
|--------|------|-------------|
| `invoice_id` | UUID | Primary key |
| `restaurant_id` | BIGINT | Restaurant identifier |
| `invoice_number` | VARCHAR | Supplier invoice # |
| `supplier_id` | UUID | FK to supplier |
| `supplier_name` | VARCHAR | Supplier name |
| `invoice_date` | DATE | Invoice date |
| `due_date` | DATE | Payment due date |
| `invoice_type` | PURCHASE, EXPENSE | Type |
| `status` | VARCHAR | PENDING, PAID, OVERDUE |
| `subtotal` | DECIMAL | Before tax |
| `tax_amount` | DECIMAL | Tax amount |
| `discount_amount` | DECIMAL | Discount |
| `total_amount` | DECIMAL | Total due |
| `paid_amount` | DECIMAL | Amount paid |
| `currency` | VARCHAR | Currency |
| `description` | TEXT | Description |
| `notes` | TEXT | Notes |
| `payment_terms` | VARCHAR | Net 30, etc. |
| `reference_number` | VARCHAR | PO number |
| `ledger_entry_id` | UUID | Link to ledger |
| `approved_by` | VARCHAR | Who approved |
| `approved_at` | TIMESTAMP | Approval time |
| `created_by` | VARCHAR | Who created |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

---

## Ledger Entry Flow

### Daily Sales Recording Flow

```
┌─────────────────────┐
│  restaurant_order   │
│  (status = PAID)    │
└──────────┬──────────┘
           │
           │ 1. Query all orders where status='PAID' 
           │    and transaction_date = X
           │
           ▼
┌─────────────────────────┐
│  Aggregate totals:      │
│  - sum(total_amount)    │──► Debit: Cash/Bank
│  - sum(tax_amount)      │──► Credit: Tax Payable  
│  - sum(tip_amount)      │──► Credit: Tips Payable
│  - sum(total-tax)       │──► Credit: Sales Revenue
└──────────┬──────────────┘
           │
           │ 2. Create 4 ledger entries
           │
           ▼
┌─────────────────────┐
│  accounting_ledger  │
│  (double-entry)     │
└─────────────────────┘
```

### Accounts Payable (Supplier Invoice) Flow

```
┌─────────────────────┐
│ accounting_invoice  │
│ (created from PO/GRN)│
└──────────┬──────────┘
           │
           │ 1. When invoice received
           │
           ▼
┌─────────────────────┐
│  Ledger Entries:    │
│  Dr: Expense (5100)  │
│  Cr: AP (2000)      │
└──────────┬──────────┘
           │
           │ 2. When paid
           │
           ▼
┌─────────────────────┐
│  Ledger Entries:    │
│  Dr: AP (2000)      │
│  Cr: Cash (1000)    │
└─────────────────────┘
```

### Payroll Flow

```
┌─────────────────────────┐
│ accounting_salary_     │
│ disbursement           │
└──────────┬──────────────┘
           │
           │ 1. Process payroll
           │
           ▼
┌─────────────────────────┐
│  Ledger Entries:       │
│  Dr: Wages Exp (6000)  │
│  Dr: Payroll Tax (6100)│
│  Cr: Cash (1000)       │
│  Cr: Tax Payable (2200)│
│  Cr: SS Payable (2100) │
└─────────────────────────┘
```

---

## Summary: Ledger Entry Types

| Transaction | # Entries | Accounts Affected |
|-------------|----------|-------------------|
| Daily Sales | 4 | Cash, Sales Revenue, Tax Payable, Tips Payable |
| Pay Supplier Invoice | 4 | Expense, AP, Cash (twice) |
| Pay Employee | 6+ | Wages Exp, Tax Exp, Cash, Tax Payables |
| Record Expense | 2 | Expense, Cash/Bank |
| Deposit to Bank | 2 | Bank, Cash |
| Withdraw from Bank | 2 | Cash, Bank |

---

## Important Notes

1. **Double-Entry Rule**: Every transaction MUST have equal debits and credits
2. **Source of Truth**: POS tables (restaurant_order, etc.) are the source - accounting_ledger is derived
3. **No Duplicate Counting**: If entries are created at order payment time, don't recreate in "Record Sales"
4. **Man in the Loop**: Consider manual review before posting to ledger for control

---

*Document generated: April 2024*
*Project: Shopro POS - Restaurant Management System*

---

# APPENDIX: Complete Chart of Accounts & Money Transfer Flows

## Part 1: Complete Chart of Accounts (110+ Accounts)

### ASSETS (1000-1999)

#### Cash & Bank (1000-1099)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 1000 | Cash - General | Asset | Main operating cash |
| 1010 | Cash - Payroll | Asset | Dedicated payroll account |
| 1020 | Cash - Change Fund | Asset |Drawer change fund |
| 1030 | Petty Cash | Asset | Small expenses |
| 1040 | Bank - Operating Account | Asset | Primary checking |
| 1050 | Bank - Savings Account | Asset | Savings |
| 1060 | Bank - Payroll Account | Asset | Payroll专用账户 |
| 1070 | Money Market | Asset | Short-term investments |
| 1080 | Cash Over/Short | Asset | Track overages/shortages |
| 1090 | Bank - Credit Card Processing | Asset | Merchant account |

#### Accounts Receivable (1100-1199)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 1100 | Accounts Receivable | Asset | Money owed TO us |
| 1110 | AR - Catering | Asset | Catering receivables |
| 1120 | AR - Banquet | Asset | Banquet deposits |
| 1130 | AR - Loyalty Program | Asset | Loyalty points liability |
| 1140 | AR - Gift Cards | Asset | Unredeemed gift cards |
| 1150 | Allowance for Bad Debts | Asset | Doubtful accounts |

#### Inventory (1200-1299)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 1200 | Inventory - Food | Asset | Food supplies |
| 1210 | Inventory - Beverage | Asset | Drinks inventory |
| 1220 | Inventory - Alcohol | Asset | Liquor inventory |
| 1230 | Inventory - Paper/Supplies | Asset | Paper goods |
| 1240 | Inventory - Cleaning | Asset | Cleaning supplies |
| 1250 | Inventory - Maintenance | Asset | Maint. supplies |
| 1260 | Inventory - Uniforms | Asset | Staff uniforms |
| 1270 | Inventory - Reserved | Asset | Reserved |
| 1280 | Inventory - Reserved | Asset | Reserved |
| 1290 | Inventory Obsolescence Reserve | Asset | Spoilage reserve |

#### Prepaid Expenses (1300-1399)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 1300 | Prepaid Rent | Asset | Rent paid ahead |
| 1310 | Prepaid Insurance | Asset | Insurance paid ahead |
| 1320 | Prepaid Licenses | Asset | Licenses prepaid |
| 1330 | Deposits - Utility | Asset | Utility deposits |
| 1340 | Deposits - Landlord | Asset | Security deposits |
| 1350 | Deposits - Vendor | Asset | Vendor deposits |

#### Fixed Assets (1400-1499)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 1400 | Furniture & Fixtures | Asset | Tables, chairs, etc. |
| 1410 | Kitchen Equipment | Asset | Ovens, fridges |
| 1420 | POS Equipment | Asset | Registers, terminals |
| 1430 | Computer Equipment | Asset | Computers, tablets |
| 1440 | Vehicles | Asset | Delivery vehicles |
| 1450 | Leasehold Improvements | Asset | Building improvements |
| 1460 | Accumulated Depreciation | Asset (Contra) | Depreciation |
| 1470 | Construction in Progress | Asset | renovations |

#### Intangible Assets (1500-1599)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 1500 | Goodwill | Asset | Purchase goodwill |
| 1510 | Trademarks | Asset | Brand marks |
| 1520 | Patents | Asset | Intellectual property |
| 1530 | Software | Asset | Software licenses |

---

### LIABILITIES (2000-2999)

#### Accounts Payable (2000-2099)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 2000 | Accounts Payable | Liability | Money owed TO vendors |
| 2010 | AP - Food Vendors | Liability | Food supplier pay |
| 2020 | AP - Beverage Vendors | Liability | Drink supplier pay |
| 2030 | AP - Maintenance | Liability | Maint. vendors |
| 2040 | AP - Marketing | Liability | Marketing vendors |
| 2050 | AP - Professional Services | Liability | Consultants, lawyers |

#### Accrued Expenses (2100-2199)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 2100 | Accrued - Payroll Taxes | Liability | Employer taxes owed |
| 2110 | Accrued - Federal Unemployment | Liability | FUTA |
| 2120 | Accrued - State Unemployment | Liability | SUTA |
| 2130 | Accrued - Workers Comp | Liability | WC insurance |
| 2140 | Accrued - Health Insurance | Liability | Employer health |
| 2150 | Accrued - 401k | Liability | Retirement contrib |
| 2160 | Accrued - Pension | Liability | Pension liability |

#### Sales Tax & VAT (2200-2299)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 2200 | Sales Tax Payable | Liability | Sales tax collected |
| 2210 | State Sales Tax Payable | Liability | State portion |
| 2220 | Local Sales Tax Payable | Liability | City/county |
| 2230 | Alcohol Tax Payable | Liability | Liquor taxes |
| 2240 | VAT Input Tax | Liability | VAT on purchases |
| 2250 | VAT Output Tax | Liability | VAT on sales |

#### Employee Liabilities (2300-2399)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 2300 | Tips Payable | Liability | Tips owed to staff |
| 2310 | Gratuities Payable | Liability | Service charges |
| 2320 | Wages Payable | Liability | Unpaid wages |
| 2330 | Bonus Payable | Liability | Earned bonuses |
| 2340 | Vacation Payable | Liability | Accrued vacation |
| 2350 | Sick Leave Payable | Liability | Accrued sick |

#### Deferred Revenue (2400-2499)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 2400 | Deferred Revenue | Liability | Unearned income |
| 2410 | Gift Cards Liability | Liability | Unredeemed cards |
| 2420 | Loyalty Points Liability | Liability | Unused points |
| 2430 | Advanced Deposits | Liability | Event deposits |
| 2440 | Deferred Catering Revenue | Liability | Unfulfilled catering |

#### Long-Term Liabilities (2500-2599)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 2500 | Notes Payable | Liability | Bank loans |
| 2510 | Mortgage Payable | Liability | Building loan |
| 2520 | Equipment Loans | Liability | Equipment financing |
| 2530 | Line of Credit | Liability | Credit line |

---

### EQUITY (3000-3999)

| Code | Name | Type | Purpose |
|------|------|------|---------|
| 3000 | Owner Equity | Equity | Owner investment |
| 3010 | Common Stock | Equity | Corporate stock |
| 3020 | Preferred Stock | Equity | Preferred shares |
| 3100 | Additional Paid-in Capital | Equity | Premium on stock |
| 3200 | Retained Earnings | Equity | Accumulated profit |
| 3300 | Treasury Stock | Equity | Repurchased shares |
| 3400 | Owner's Drawing | Equity | Withdrawals |
| 3500 | Capital Reserves | Equity | Capital surplus |
| 3600 | Unrealized Gains/Losses | Equity | Investment gains |
| 3700 | Foreign Currency Translation | Equity | FX adjustments |
| 3800 | Prior Year Adjustments | Equity | PY corrections |
| 3900 | Income Summary | Equity | P&L clearing |

---

### REVENUE (4000-4999)

#### Sales Revenue (4100-4199)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 4100 | Food Sales | Revenue | Dine-in food |
| 4110 | Food - Dine-In | Revenue | Restaurant |
| 4120 | Food - Takeout | Revenue | Takeout |
| 4130 | Food - Delivery | Revenue | Delivery |
| 4140 | Food - Drive-Thru | Revenue | Drive-through |
| 4150 | Food - Catering | Revenue | Catering |
| 4160 | Food - Banquet | Revenue | Events |
| 4170 | Food - Room Service | Revenue | Hotel service |
| 4180 | Food - Vending | Revenue | Vending machines |

#### Beverage Revenue (4200-4299)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 4200 | Non-Alcoholic Beverages | Revenue | Drinks |
| 4210 | Alcohol - Beer | Revenue | Beer sales |
| 4220 | Alcohol - Wine | Revenue | Wine sales |
| 4230 | Alcohol - Spirits | Revenue | Liquor sales |
| 4240 | Alcohol - Cocktails | Revenue | Mixed drinks |
| 4250 | Alcohol - Happy Hour | Revenue | HH specials |
| 4260 | Beverage - Smoothies | Revenue | Smoothies |
| 4270 | Beverage - Coffee/Tea | Revenue | Coffee service |
| 4280 | Beverage - fountain | Revenue | Soda fountain |

#### Other Revenue (4300-4999)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 4300 | Takeout/Delivery Revenue | Revenue | Delivery fees |
| 4310 | Catering Revenue | Revenue | Catering |
| 4320 | Banquet Revenue | Revenue | Events |
| 4330 | Service Charges | Revenue | Auto-gratuity |
| 4340 | Cover Charges | Revenue | Entry fees |
| 4350 | Entertainment Revenue | Revenue | Live music, etc. |
| 4400 | Rental Revenue | Revenue | Venue rental |
| 4500 | Commission Revenue | Revenue | Affiliate sales |
| 4600 | Interest Income | Revenue | Bank interest |
| 4700 | Dividend Income | Revenue | Investments |
| 4800 | Gain on Asset Sale | Revenue | Asset disposal |
| 4900 | Miscellaneous Revenue | Revenue | Other income |

---

### COST OF GOODS SOLD (5000-5999)

| Code | Name | Type | Purpose |
|------|------|------|---------|
| 5100 | Food Cost | COGS | Cost of food sold |
| 5110 | Food Cost - Dine-In | COGS | Restaurant |
| 5120 | Food Cost - Takeout | COGS | Takeout |
| 5130 | Food Cost - Catering | COGS | Catering |
| 5140 | Food Cost - Banquet | COGS | Events |
| 5200 | Beverage Cost | COGS | Cost of drinks |
| 5210 | Beverage Cost - Non-Alcohol | COGS | Soft drinks |
| 5220 | Beverage Cost - Beer | COGS | Beer cost |
| 5230 | Beverage Cost - Wine | COGS | Wine cost |
| 5240 | Beverage Cost - Spirits | COGS | Liquor cost |
| 5250 | Beverage Cost - Coffee/Tea | COGS | Coffee cost |
| 5300 | Supplies Cost | COGS | Paper, containers |
| 5400 | Direct Labor | COGS | Kitchen labor |
| 5500 | Restaurant | COGS | Labor |

---

### OPERATING EXPENSES (6000-7999)

#### Labor Expenses (6000-6199)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6000 | Wages - Kitchen | Expense | Cook wages |
| 6010 | Wages - Front of House | Expense | Server wages |
| 6020 | Wages - Management | Expense | Mgr salaries |
| 6030 | Wages - Admin | Expense | Office staff |
| 6040 | Wages - Delivery | Expense | Drivers |
| 6050 | Wages - Part-Time | Expense | PT wages |
| 6060 | Wages - Overtime | Expense | OT premium |
| 6070 | Bonus Expense | Expense | Bonuses |
| 6080 | Stock Compensation | Expense | Equity comp |
| 6100 | Payroll Tax Expense | Expense | Employer taxes |
| 6110 | Social Security Expense | Expense | SS match |
| 6120 | Medicare Expense | Expense | Medicare match |
| 6130 | FUTA Expense | Expense | Federal unemployment |
| 6140 | SUTA Expense | Expense | State unemployment |
| 6150 | Workers Comp Expense | Expense | WC insurance |
| 6160 | Health Insurance Expense | Expense | Medical benefits |
| 6170 | 401k Expense | Expense | Retirement match |
| 6180 | Other Benefits | Expense | Other perks |
| 6190 | Training/Development | Expense | Staff training |

#### Rent & Occupancy (6200-6299)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6200 | Rent Expense | Expense | Base rent |
| 6210 | Property Tax | Expense | Property taxes |
| 6220 | Insurance - Property | Expense | Building insurance |
| 6230 | Common Area Maintenance | Expense | CAM charges |
| 6240 | Parking Lot Maintenance | Expense | Parking |
| 6250 | Security Expense | Expense | Security services |
| 6260 | Pest Control | Expense | Pest management |
| 6270 | Cleaning Services | Expense | Janitorial |
| 6280 | Trash Removal | Expense | Waste management |
| 6290 | Utilities Allocation | Expense | Shared utilities |

#### Utilities (6300-6399)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6300 | Electricity | Expense | Power |
| 6310 | Gas | Expense | Heating, cooking |
| 6320 | Water | Expense | Water |
| 6330 | Sewer | Expense | Sewage |
| 6340 | Phone | Expense | Telephone |
| 6350 | Internet | Expense | WiFi |
| 6360 | Cable/Satellite | Expense | TV |
| 6370 | Alarm System | Expense | Security monitoring |

#### Repairs & Maintenance (6400-6499)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6400 | Repairs - Equipment | Expense | Equipment repair |
| 6410 | Repairs - Building | Expense | Facility repair |
| 6420 | Repairs - Furniture | Expense | Fixtures repair |
| 6430 | Repairs - Vehicles | Expense | Auto repair |
| 6440 | Maintenance Contracts | Expense | Service contracts |
| 6450 | Supplies - Maintenance | Expense | Maint. supplies |
| 6460 | Painting | Expense | Paint/decor |
| 6470 | Landscaping | Expense | Grounds keeping |
| 6480 | Pool/Maintenance | Expense | Pool service |
| 6490 | HVAC Service | Expense | Climate control |

#### Professional Services (6500-6599)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6500 | Accounting Fees | Expense | CPA |
| 6510 | Legal Fees | Expense | Attorney |
| 6520 | Consulting Fees | Expense | Advisors |
| 6530 | Banking Fees | Expense | Bank charges |
| 6540 | Credit Card Fees | Expense | Processing fees |
| 6550 | Insurance - General | Expense | Liability ins |
| 6560 | Insurance - Workers Comp | Expense | WC |
| 6570 | Insurance - Health | Expense | Health |
| 6580 | Insurance - Auto | Expense | Vehicle |

#### Marketing & Advertising (6600-6699)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6600 | Advertising | Expense | Ads |
| 6610 | Marketing | Expense | Campaigns |
| 6620 | Social Media | Expense | FB, IG, etc. |
| 6630 | Website | Expense | Web hosting |
| 6640 | SEO/SEM | Expense | Online marketing |
| 6650 | Public Relations | Expense | PR |
| 6660 | Promotions | Expense | Discounts, deals |
| 6670 | Loyalty Program | Expense | Rewards |
| 6680 | Printing | Expense | Menus, flyers |
| 6690 | Signage | Expense | Signs |

#### Administrative & General (6700-6799)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6700 | Office Supplies | Expense | Paper, pens |
| 6710 | Postage | Expense | Shipping |
| 6720 | Travel | Expense | Business travel |
| 6730 | Meals - Business | Expense | Client meals |
| 6740 | Dues & Subscriptions | Expense | Memberships |
| 6750 | Licenses & Permits | Expense | Business licenses |
| 6760 | Taxes - Other | Expense | Misc taxes |
| 6770 | Charitable Contributions | Expense | Donations |
| 6780 | Miscellaneous | Expense | Other |
| 6790 | Contingency | Expense | Emergency fund |

#### Depreciation (6800-6899)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6800 | Depreciation - Furniture | Expense | Depreciation |
| 6810 | Depreciation - Equipment | Expense | Depreciation |
| 6820 | Depreciation - Vehicles | Expense | Depreciation |
| 6830 | Depreciation - Building | Expense | Depreciation |
| 6840 | Depreciation - Software | Expense | Amortization |
| 6850 | Amortization | Expense | Intangibles |

#### Other Expenses (6900-7999)
| Code | Name | Type | Purpose |
|------|------|------|---------|
| 6900 | Inventory Shortage | Expense | Shrinkage |
| 6910 | Spoilage | Expense | Waste |
| 6920 | Theft/Loss | Expense | Pilferage |
| 6930 | Cash Over/Short | Expense | Variance |
| 7000 | Equipment Rental | Expense | Rentals |
| 7100 | Uniforms | Expense | Staff uniforms |
| 7200 | Laundry | Expense | Linens, uniforms |
| 7300 | Music/Entertainment | Expense | Background music |
| 7400 | Guest Complaints | Expense | Refunds, comps |
| 7500 | Loyalty Reward Expense | Expense | Points redemption |

---

## Part 2: Money Transfer Flows (Complete Examples)

### Scenario 1: Daily Sales Recording

**Situation**: End of day, record $1,100 in sales (includes $100 tax) and $150 tips

**Source**: restaurant_order table (status = PAID)

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Daily Sales                                    │
├─────────────────────────────────────────────────────────────┤
│ From: restaurant_order (total_amount, tax_amount, tip)    │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - total_amount (all orders): $1,100.00                   │
│   - tax_amount:           $100.00                         │
│   - tip_amount:           $150.00                          │
│   - sales (net):          $1,000.00                       │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 1000 | Cash - General | $1,250.00 | | Money received (sales + tips) |
| 2 | 4100 | Food Sales | | $1,000.00 | Revenue earned |
| 3 | 2200 | Sales Tax Payable | | $100.00 | Tax collected, owed to gov |
| 4 | 2300 | Tips Payable | | $150.00 | Tips owed to staff |

**Debits = Credits**: $1,250 = $1,250 ✓

---

### Scenario 2: Pay Supplier Invoice

**Situation**: Pay Sysco Foods $500 for food supplies (invoice #INV-001)

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Pay Supplier Invoice                           │
├─────────────────────────────────────────────────────────────┤
│ From: accounting_invoice (status = PAID)                   │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - supplier: Sysco Foods                                   │
│   - amount: $500.00                                        │
│   - payment method: Bank - Operating Account (1040)       │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 2000 | Accounts Payable | $500.00 | | Reduce amount owed |
| 2 | 1040 | Bank - Operating Account | | $500.00 | Cash paid out |

**Debits = Credits**: $500 = $500 ✓

---

### Scenario 3: Payroll Processing

**Situation**: Pay employee $2,000 gross wages. Withhold: $300 federal, $200 state, $124 SS, $29 Medicare. Employer pays matching SS+Medicare.

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Process Payroll                                │
├─────────────────────────────────────────────────────────────┤
│ From: accounting_salary_disbursement (status = DISBURSED) │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - gross_pay:        $2,000.00                            │
│   - federal_tax:       $300.00                             │
│   - state_tax:          $200.00                             │
│   - social_security:    $124.00                             │
│   - medicare:           $29.00                             │
│   - net_pay:         $1,346.00                             │
│   - employer SS:        $124.00 (matching)                │
│   - employer Medicare:   $29.00 (matching)                │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 6000 | Wages - Kitchen | $2,000.00 | | Record wage expense |
| 2 | 6100 | Payroll Tax Expense | $153.00 | | Employer tax expense |
| 3 | 1040 | Bank - Operating Account | | $1,346.00 | Net pay to employee |
| 4 | 2200 | Accrued - Payroll Taxes | | $300.00 | Federal tax withheld |
| 5 | 2200 | Accrued - Payroll Taxes | | $200.00 | State tax withheld |
| 6 | 2100 | Accrued - Payroll Taxes | | $124.00 | SS tax withheld |
| 7 | 2100 | Accrued - Payroll Taxes | | $29.00 | Medicare withheld |

**Debits = Credits**: $2,153 = $2,153 ✓

---

### Scenario 4: Record Expense (Rent)

**Situation**: Pay monthly rent $3,000 via check

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Record Rent Expense                            │
├─────────────────────────────────────────────────────────────┤
│ From: UI Input (Expense Entry Page)                         │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - category: Rent                                          │
│   - amount: $3,000.00                                       │
│   - payment: Cash                                           │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 6720 | Rent Expense | $3,000.00 | | Record rent expense |
| 2 | 1000 | Cash - General | | $3,000.00 | Cash paid |

**Debits = Credits**: $3,000 = $3,000 ✓

---

### Scenario 5: Deposit Cash to Bank

**Situation**: Take $500 from cash register to bank

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Deposit to Bank                               │
├─────────────────────────────────────────────────────────────┤
│ From: UI Input (Cash Management Page)                       │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - from: Cash - General (1000)                            │
│   - to: Bank - Operating (1040)                           │
│   - amount: $500.00                                        │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 1040 | Bank - Operating Account | $500.00 | | Money deposited |
| 2 | 1000 | Cash - General | | $500.00 | Cash removed |

**Debits = Credits**: $500 = $500 ✓

---

### Scenario 6: Withdraw from Bank for Cash

**Situation**: Withdraw $200 from bank for petty cash

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Withdraw from Bank                             │
├─────────────────────────────────────────────────────────────┤
│ From: UI Input (Cash Management Page)                       │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - from: Bank - Operating (1040)                         │
│   - to: Petty Cash (1030)                                  │
│   - amount: $200.00                                        │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 1030 | Petty Cash | $200.00 | | Cash received |
| 2 | 1040 | Bank - Operating Account | | $200.00 | Bank withdrawal |

**Debits = Credits**: $200 = $200 ✓

---

### Scenario 7: Purchase Equipment (Fixed Asset)

**Situation**: Buy new oven for $5,000 via bank transfer

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Purchase Equipment                             │
├─────────────────────────────────────────────────────────────┤
│ From: UI Input (Asset Purchase)                             │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - asset: Kitchen Equipment                               │
│   - amount: $5,000.00                                       │
│   - payment: Bank - Operating Account                      │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 1410 | Kitchen Equipment | $5,000.00 | | Record asset |
| 2 | 1040 | Bank - Operating Account | | $5,000.00 | Cash paid |

**Debits = Credits**: $5,000 = $5,000 ✓

---

### Scenario 8: Pay Sales Tax to Government

**Situation**: Remit $500 sales tax to state

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Pay Sales Tax                                 │
├─────────────────────────────────────────────────────────────┤
│ From: accounting_ledger (Sales Tax Payable balance)        │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - from: Sales Tax Payable (2200)                         │
│   - to: Bank - Operating (1040)                            │
│   - amount: $500.00                                        │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 2200 | Sales Tax Payable | $500.00 | | Reduce tax owed |
| 2 | 1040 | Bank - Operating Account | | $500.00 | Tax paid |

**Debits = Credits**: $500 = $500 ✓

---

### Scenario 9: Distribute Tips to Employees

**Situation**: Distribute $150 tips to servers

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Distribute Tips                                │
├─────────────────────────────────────────────────────────────┤
│ From: accounting_ledger (Tips Payable balance)             │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - from: Tips Payable (2300)                              │
│   - to: Cash (1000)                                        │
│   - amount: $150.00                                        │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 2300 | Tips Payable | $150.00 | | Tips distributed |
| 2 | 1000 | Cash - General | | $150.00 | Cash paid |

**Debits = Credits**: $150 = $150 ✓

---

### Scenario 10: Owner Investment

**Situation**: Owner invests $10,000 cash into business

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Owner Investment                              │
├─────────────────────────────────────────────────────────────┤
│ From: UI Input (Owner Equity)                               │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - from: Owner (personal)                                 │
│   - to: Owner Equity (3000)                                │
│   - amount: $10,000.00                                     │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 1000 | Cash - General | $10,000.00 | | Cash received |
| 2 | 3000 | Owner Equity | | $10,000.00 | Capital contributed |

**Debits = Credits**: $10,000 = $10,000 ✓

---

### Scenario 11: Owner Withdrawal

**Situation**: Owner withdraws $2,000 cash for personal use

```
┌─────────────────────────────────────────────────────────────┐
│ TRANSACTION: Owner Withdrawal                              │
├─────────────────────────────────────────────────────────────┤
│ From: UI Input (Owner Equity)                               │
│ To:   accounting_ledger                                     │
├─────────────────────────────────────────────────────────────┤
│ INPUT DATA:                                                 │
│   - from: Owner Equity (3000)                              │
│   - to: Cash (1000)                                        │
│   - amount: $2,000.00                                      │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Entries Created**:

| # | Account Code | Account Name | Debit | Credit | Explanation |
|---|--------------|--------------|-------|--------|-------------|
| 1 | 3400 | Owner's Drawing | $2,000.00 | | Withdrawal |
| 2 | 1000 | Cash - General | | $2,000.00 | Cash taken |

**Debits = Credits**: $2,000 = $2,000 ✓

---

## Part 3: Quick Reference - Account Type Rules

### Debit vs Credit Rules:

| Account Type | Debit (Increases) | Credit (Decreases) |
|-------------|------------------|-------------------|
| Assets | ✓ | |
| Expenses | ✓ | |
| Liabilities | | ✓ |
| Equity | | ✓ |
| Revenue | | ✓ |

### Normal Balance:

| Account Type | Normal Balance |
|-------------|---------------|
| Assets | Debit |
| Liabilities | Credit |
| Equity | Credit |
| Revenue | Credit |
| Expenses | Debit |

---

## Part 4: Summary - When to Use Each Account

| When You Need To... | Use These Accounts |
|--------------------|---------------------|
| Record daily sales | 1000, 4100, 2200, 2300 |
| Pay supplier | 2000, 1040 |
| Pay employees | 6000, 6100, 1040, 2100, 2200 |
| Pay rent | 6720, 1000/1040 |
| Deposit cash | 1040, 1000 |
| Withdraw cash | 1000, 1040 |
| Buy equipment | 1410, 1040 |
| Pay taxes | 2200, 1040 |
| Distribute tips | 2300, 1000 |
| Owner investment | 1000, 3000 |
| Owner withdrawal | 3400, 1000 |

---

*End of Appendix*
