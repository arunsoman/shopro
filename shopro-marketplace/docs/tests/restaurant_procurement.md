# Shopro Platform: Restaurant Procurement — Manual Test Cases

This document outlines the manual test procedures for verifying product discovery, purchase order creation, and bid evaluation within the Restaurant Portal.

---

## 🔐 TEST DATA & CREDENTIALS
Use the following credentials for internal manual testing:

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Restaurant Owner** | `owner@bistro.internal` | `password` | Bistro Hub |

---

## 📊 Test Case Summary

| Total Cases | Critical | High | Medium | Low | Positive | Negative | Security |
|-------------|----------|------|--------|-----|----------|----------|----------|
| 30          | 10       | 10   | 8      | 2   | 24       | 4        | 2        |

---

## 1. PRODUCT DISCOVERY (CATALOG)
TC-RP-001 | Browse Catalog Nodes
1. Log in as Restaurant Owner.
2. Navigate to Marketplace Catalog.
3. Verify categorization (Produce, Dairy, etc.).
4. Verify search functionality works for SKUs.

---

## 2. PURCHASE ORDER (PO) CREATION
TC-RP-002 | Create Multi-Item PO
1. Add multiple items to the procurement cart.
2. Click "Finalize PO".
3. Verify that the system generates a draft PO with correct pricing.

---

## 3. ORDER AMENDMENT
TC-RP-003 | Amend PO Quantity (Pre-Dispatch)
Priority     : HIGH
Type         : Positive
Pre-condition: PO status is "Pending Review" or "Audited".
Steps:
  1. Click "Amend Order".
  2. Increase quantity of one item.
  3. Click "Save Edits".

Expected Result: PO reflects updated quantity; total amount recalculates.

TC-RP-004 | Block Amendment after Dispatch
Priority     : HIGH
Type         : Negative/Security
Pre-condition: PO status is "Dispatched" or "Out for Delivery".

Expected Result: "Amend Order" button is hidden or disabled.

---

## 📝 Test Execution Sign-off

| Field | Value |
| :--- | :--- |
| **Tester Name** | _________________________________ |
| **Date Executed** | _________________________________ |
| **Build/Version** | 1.0.0-PROD-MKT |
| **Total Pass** | _________________________________ |
| **Total Fail** | _________________________________ |
| **Overall Status** | □ Ready for release / □ Not ready |
