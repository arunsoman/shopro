# Accounting UI Requirements - Foolproof Design

## Core Principle: **Zero Accounting Knowledge Required**

Restaurant staff should **NEVER**:
- See debit/credit terminology
- Enter account numbers manually
- Know which accounts are affected
- Have direct access to the double-entry ledger

The ledger should **automatically mirror reality** based on business transactions.

---

## UI Modules (One Per Transaction Type)

### 1. **Daily Sales Recording** (Auto-generated from POS)
**Trigger:** End-of-day close  
**User Action:** Review and confirm  
**Ledger Impact:** (Automatic)
- Debit: Cash/Bank
- Credit: Sales Revenue
- Credit: Tax Payable
- Credit: Tips Payable

---

### 2. **Expense Entry** (Tabular Multi-Row)
**Trigger:** Any business expense  
**User Action:** Select expense type, enter amount, add multiple rows, post/draft

**UI Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  Add Expenses                                    [Save Draft]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Date: [2026-04-20]          Paid By: [Cash ▼]              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Expense Type          │ Description    │ Amount      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ [Rent Expense      ▼] │ [April Rent  ] │ [$3,000.00] │ + │
│  │ [Utilities       ▼] │ [Electricity ] │ [$450.00  ] │ + │
│  │ [Internet        ▼] │ [Monthly     ] │ [$120.00  ] │ + │
│  │ [Add Row         ] │                │             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Total: $3,570.00                                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Draft Expenses (3)                                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Rent Expense      | $3,000.00 | [Remove]             │   │
│  │ Utilities         | $450.00   | [Remove]             │   │
│  │ Internet          | $120.00   | [Remove]             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│                     [Cancel]  [Post to Ledger]               │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic - User Never Sees This)
- Debit: Expense Account (selected from dropdown)
- Credit: Cash/Bank (selected from "Paid By")

---

### 3. **Cash Management**
**Trigger:** Cash deposits, withdrawals, transfers  
**User Actions:**

#### 3a. Deposit Cash to Bank
```
┌─────────────────────────────────────────┐
│  Deposit Cash to Bank                   │
├─────────────────────────────────────────┤
│  From: Cash - General                   │
│  To:   [Bank - Operating Account ▼]     │
│  Amount: [$500.00]                      │
│  Date: [2026-04-20]                     │
│                                         │
│              [Cancel]  [Record Transfer]│
└─────────────────────────────────────────┘
```

#### 3b. Withdraw from Bank
```
┌─────────────────────────────────────────┐
│  Withdraw from Bank                     │
├─────────────────────────────────────────┤
│  From: [Bank - Operating Account ▼]     │
│  To:   Cash - General                   │
│  Amount: [$200.00]                      │
│  Date: [2026-04-20]                     │
│                                         │
│              [Cancel]  [Record Transfer]│
└─────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic)
- Deposit: Debit Bank, Credit Cash
- Withdraw: Debit Cash, Credit Bank

---

### 4. **Supplier Invoice Payment**
**Trigger:** Pay supplier invoice  
**User Action:** Select invoice, choose payment method, confirm

```
┌─────────────────────────────────────────────────────────────┐
│  Pay Supplier Invoice                                       │
├─────────────────────────────────────────────────────────────┤
│  Supplier: [Sysco Foods ▼]                                  │
│                                                              │
│  Outstanding Invoices:                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Invoice #  │ Date       │ Due      │ Amount  │ [Pay]│     │
│  ├────────────────────────────────────────────────────┤     │
│  │ INV-001    │ 2026-04-01 │ 2026-05-01│ $500.00│ [Pay]│     │
│  │ INV-002    │ 2026-04-05 │ 2026-05-05│ $350.00│ [Pay]│     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Payment Method: [Bank - Operating Account ▼]               │
│  Reference: [Check #1234]                                   │
│                                                              │
│                     [Cancel]  [Process Payment]              │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic)
- Debit: Accounts Payable
- Credit: Cash/Bank

---

### 5. **Payroll Processing**
**Trigger:** Pay period end  
**User Action:** Enter hours, review auto-calculated taxes, confirm payment

```
┌─────────────────────────────────────────────────────────────┐
│  Process Payroll                                            │
├─────────────────────────────────────────────────────────────┤
│  Employee: [John Doe ▼]                                     │
│  Pay Period: [2026-04-01] to [2026-04-15]                  │
│  Pay Date: [2026-04-20]                                     │
│                                                              │
│  Hourly Rate: [$15.00]                                      │
│  Total Hours: [80.00]                                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Earnings                                           │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ Gross Pay                          | $1,200.00     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Deductions (Auto-Calculated)                       │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ Federal Tax                        | $120.00       │     │
│  │ State Tax                          | $84.00        │     │
│  │ Social Security (6.2%)             | $74.40        │     │
│  │ Medicare (1.45%)                   | $17.40        │     │
│  │ Total Deductions                   | $295.80       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Net Pay: $904.20                                           │
│  Payment Method: [Bank - Operating Account ▼]               │
│                                                              │
│                     [Cancel]  [Process Payroll]              │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic - 6+ entries)
- Debit: Wages Expense (gross)
- Debit: Payroll Tax Expense (employer portion)
- Credit: Cash/Bank (net pay)
- Credit: Federal Tax Payable
- Credit: State Tax Payable
- Credit: Social Security Payable
- Credit: Medicare Payable

---

### 6. **Rent Payment**
**Trigger:** Monthly rent due  
**User Action:** Enter amount, select payment method, confirm

```
┌─────────────────────────────────────────┐
│  Pay Rent                               │
├─────────────────────────────────────────┤
│  Property: [Main Restaurant Location]   │
│  Period: [April 2026]                   │
│  Amount: [$3,000.00]                    │
│  Due Date: [2026-04-01]                 │
│                                         │
│  Payment Method: [Bank - Operating ▼]   │
│  Check #: [1234]                        │
│                                         │
│              [Cancel]  [Record Payment] │
└─────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic)
- Debit: Rent Expense
- Credit: Cash/Bank

---

### 7. **Tax Remittance**
**Trigger:** Tax payment due  
**User Action:** Review calculated taxes, confirm payment

```
┌─────────────────────────────────────────────────────────────┐
│  Remit Sales Tax                                            │
├─────────────────────────────────────────────────────────────┤
│  Tax Period: [Q1 2026]                                      │
│  Due Date: [2026-04-15]                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Tax Liability                                      │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ Sales Tax Collected                | $5,420.00     │     │
│  │ Less: Tax Paid on Purchases        | $1,230.00     │     │
│  │ Net Tax Due                        | $4,190.00     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Payment Method: [Bank - Operating Account ▼]               │
│  Tax ID: [XX-XXXXXXX]                                       │
│                                                              │
│                     [Cancel]  [Submit Payment]               │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic)
- Debit: Sales Tax Payable
- Credit: Cash/Bank

---

### 8. **Tip Distribution**
**Trigger:** Tip payout to staff  
**User Action:** Enter tip pool, distribute to employees

```
┌─────────────────────────────────────────────────────────────┐
│  Distribute Tips                                            │
├─────────────────────────────────────────────────────────────┤
│  Date: [2026-04-20]                                         │
│  Total Tips Collected: $1,250.00                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Employee          │ Hours │ % Share │ Amount      │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ Jane Smith        │ 40    │ 25%     │ $312.50    │     │
│  │ John Doe          │ 32    │ 20%     │ $250.00    │     │
│  │ Bob Wilson        │ 40    │ 25%     │ $312.50    │     │
│  │ Alice Brown       │ 24    │ 15%     │ $187.50    │     │
│  │ Manager Reserve   │ -     │ 15%     │ $187.50    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Payment Method: [Cash - General ▼]                         │
│                                                              │
│                     [Cancel]  [Distribute Tips]              │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic)
- Debit: Tips Payable
- Credit: Cash

---

### 9. **Owner Investment/Withdrawal**
**Trigger:** Owner adds/removes capital  
**User Action:** Enter amount, select type, confirm

```
┌─────────────────────────────────────────┐
│  Owner Transaction                      │
├─────────────────────────────────────────┤
│  Type: [○ Investment  ● Withdrawal]     │
│  Amount: [$2,000.00]                    │
│  Date: [2026-04-20]                     │
│  Description: [Personal withdrawal]     │
│                                         │
│  Payment Method: [Cash - General ▼]     │
│                                         │
│              [Cancel]  [Record]         │
└─────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic)
- Investment: Debit Cash, Credit Owner Equity
- Withdrawal: Debit Owner's Drawing, Credit Cash

---

### 10. **Asset Purchase**
**Trigger:** Buy equipment, furniture, etc.  
**User Action:** Select asset type, enter details, confirm

```
┌─────────────────────────────────────────────────────────────┐
│  Purchase Asset                                             │
├─────────────────────────────────────────────────────────────┤
│  Asset Type: [Kitchen Equipment ▼]                          │
│  Description: [New Convection Oven]                         │
│  Purchase Date: [2026-04-20]                                │
│  Amount: [$5,000.00]                                        │
│  Vendor: [Restaurant Supply Co]                             │
│                                                              │
│  Payment Method: [Bank - Operating Account ▼]               │
│  Check/Reference: [Check #5678]                             │
│                                                              │
│                     [Cancel]  [Record Purchase]              │
└─────────────────────────────────────────────────────────────┘
```

**Ledger Mapping:** (Automatic)
- Debit: Fixed Asset (Equipment)
- Credit: Cash/Bank

---

## Draft System

All transaction types support **Draft** mode:

```
┌─────────────────────────────────────────────────────────────┐
│  Draft Transactions                              [Filter ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Date       │ Type      │ Total    │ [Post] [Edit] │     │
│  ├────────────────────────────────────────────────────┤     │
│  │ 2026-04-19 │ Expenses  │ $1,250.00│ [Post] [Edit] │     │
│  │ 2026-04-18 │ Expenses  │ $890.00  │ [Post] [Edit] │     │
│  │ 2026-04-17 │ Payroll   │ $2,400.00│ [Post] [Edit] │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Selected: 0 transactions | Total: $0.00                    │
│                                                              │
│              [Delete Selected]  [Post All Selected]          │
└─────────────────────────────────────────────────────────────┘
```

---

## Approval Workflow (Optional)

For transactions > threshold:

```
┌─────────────────────────────────────────────────────────────┐
│  Pending Approval                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Transaction: Expense Batch                                 │
│  Amount: $5,420.00                                          │
│  Submitted By: Manager John                                 │
│  Date: 2026-04-20                                           │
│                                                              │
│  Details:                                                   │
│  - Rent Expense: $3,000.00                                  │
│  - Utilities: $1,200.00                                     │
│  - Insurance: $1,220.00                                     │
│                                                              │
│                     [Reject]  [Approve & Post]               │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Rules

| Role | Can Create | Can Post | Can Approve | Can View Ledger |
|------|------------|----------|-------------|-----------------|
| **Cashier** | Expenses (<$100) | No | No | No |
| **Manager** | All transactions | Yes (<$1,000) | No | Summary only |
| **Owner** | All transactions | Yes | Yes | Full access |
| **Accountant** | Adjustments | Yes | Yes | Full access |

---

## Summary: User Never Sees

❌ Debit/Credit terminology  
❌ Account numbers  
❌ Chart of accounts  
❌ Double-entry mechanics  
❌ Journal entry screens  

## Summary: User Always Sees

✅ Business-language labels (Rent, Utilities, Payroll)  
✅ Dropdown menus with familiar terms  
✅ Clear transaction descriptions  
✅ Running totals and confirmations  
✅ Draft/Post workflow  

---

**Golden Rule:** If a screen shows account numbers or debit/credit, it's a **failed design**.
