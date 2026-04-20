# 📋 Shopro Accounting Project Tracking

## 🚀 Project Status: In Progress
**Subproject:** `shopro-accounting` & `shopro-accounting-web`
**Tech Stack:** Spring Boot 3.4, Java 21, React 19, TS, Material-UI, Radix UI, TanStack Query

---

## ✅ Completed
- [x] **Project Infrastructure**
  - [x] Backend project structure created
  - [x] Frontend project structure created
  - [x] Base configuration (`build.gradle`, `application.yml`, `package.json`)
- [x] **Core Data Model (Backend)**
  - [x] `ChartOfAccounts` Entity
  - [x] `LedgerEntry` Entity (Double-Entry System)
  - [x] `SalaryDisbursement` Entity
  - [x] `TaxConfig` Entity (Global Ready)
  - [x] `Invoice` Entity
- [x] **Core Backend Logic**
  - [x] `LedgerService` (Double-entry enforcement, Daily Sales recording)
  - [x] `TaxService` (Priority-based Global Tax Engine)
  - [x] `ExpenseService` (Draft/Post workflow)
- [x] **Repositories**
  - [x] `ChartOfAccountsRepository`
  - [x] `LedgerEntryRepository`
  - [x] `TaxConfigRepository`
- [x] **Foolproof UI - Stage 1**
  - [x] `ExpenseEntryScreen` (Tabular, Draft/Post, zero-accounting-knowledge design)
  - [x] Expense REST API (Controllers & DTOs)

---

## 🏗️ In Progress
- [ ] **Global Tax Configuration UI** (Current Task)
  - [ ] Tax Rule Management Screen
  - [ ] Tax Priority & Category Mapping
  - [ ] Country/State/City Defaults Setup
- [ ] **Payroll & Salary Disbursement**
  - [ ] Salary Disbursement REST API
  - [ ] Payroll Processing Logic (Tax withholdings, Net pay)
  - [ ] Payroll UI (Hours entry, review, confirm)

---

## ⏳ Pending
- [ ] **Cash & Bank Management**
  - [ ] Deposit/Withdrawal UI
  - [ ] Bank Transfer Logic
- [ ] **Supplier Invoice Management**
  - [ la ] Invoice Payment UI
  - [ ] Accounts Payable Ledger integration
- [ ] **Financial Reporting & Analytics**
  - [ ] P&L Statement Generator
  - [ la ] Balance Sheet Generator
  - [ ] Cash Flow Statement
  - [ la ] Dashboard with KPIs (Burn rate, Revenue vs Expense)
- [ ] **Audit & Security**
  - [ ] Transaction Approval Workflow (threshold-based)
  - [ ] Role-based access control (RBAC) for accounting
  - [ ] Audit logs for all ledger changes
- [ ] **Testing & Validation**
  - [ ] Full E2E tests for the accounting pipeline
  - [ ] Double-entry sum validation tests
  - [ la ] Global tax calculation unit tests
