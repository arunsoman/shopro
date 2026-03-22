# Shopro Platform: Financial Controls — Manual Test Cases

This document outlines the manual test procedures for verifying multi-sig payout approvals, payment reconciliation, and tax compliance features.

## 📊 Test Case Summary

| Total Cases | Critical | High | Medium | Low | Positive | Negative | Security |
|-------------|----------|------|--------|-----|----------|----------|----------|
| 58          | 25       | 18   | 10     | 5   | 40       | 12       | 6        |

---

## 1. PAYOUT APPROVAL (VAULT)
Security-critical disbursement authorization for suppliers.

TC-FC-001 | Approve Single Payout
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: Logged in as FINANCE_OFFICER or SUPER_ADMIN.
Test Data    : Pending Payout ID: PAY-1002.

Steps:
  1. Navigate to /operator/payouts.
  2. Locate PAY-1002.
  3. Click the "Check" icon (Approve).
  4. Confirm in the dialog.

Expected Result: Payout disappears from the queue; status changes to "Processing" or "Paid".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-FC-002 | Batch Approval Processing
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Select multiple checkboxes in the Payout Queue.
  2. Click "Batch Authorize" or similar.

Expected Result: All selected payouts are approved simultaneously.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-FC-003 | Security: L3 Multi-sig Trigger ($50k+)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Test Data    : Payout amount: $55,000.

Steps:
  1. FINANCE_OFFICER attempts to approve a payout > $50,000.

Expected Result: System blocks immediate approval; status changes to "Awaiting L3 SIG" (requires second admin signature).
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-FC-004 | Security: Auto-Risk Block (>80 Risk)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Security
Pre-condition: Payout flagged with Risk Score 88/100.

Steps:
  1. Attempt to approve the high-risk payout.

Expected Result: System shows "Risk Lock Engaged"; action blocked unless "Override & Sign" is used (by root only).
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 2. PAYMENT RECONCILIATION
TC-FC-005 | Successful Payment Matching
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: Order O-1234 exists; external payment log matches amount/ID.
Steps:
  1. In /operator/reconciliation, click "Run Matcher".

Expected Result: Order status updates from "Awaiting Payment" to "Paid".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-FC-006 | Partial Match Flagging (Amount Mismatch)
──────────────────────────────────────────────
Priority     : HIGH
Type         : Negative
Test Data    : Order: $100 | Payment Log: $95.

Expected Result: Entry appears in Reconciliation list with "Flagged: Amount Mismatch" status.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 3. SETTLEMENT LOGS & AUDIT
TC-FC-007 | Filter Logs by Entity
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Steps:
  1. Navigate to /operator/settlement-logs.
  2. Filter by Supplier "Harvest Hub".

Expected Result: Only records involving Harvest Hub are visible.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-FC-008 | Export Settlement Ledger (CSV)
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Steps:
  1. Click "Export CSV".
  2. Open the downloaded file.

Expected Result: CSV contains accurate data (Entity, Amount, Status, Date, TxID).
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 4. CREDIT NOTE ISSUANCE
TC-FC-009 | Issue Credit Note for Correction
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Navigate to /operator/credit-notes.
  2. Click "+ New Credit Note".
  3. Enter Amount $50 and link to Order O-998.

Expected Result: Credit note generated; status "Issued".
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 5. TAX COMPLIANCE
TC-FC-010 | VAT Calculation Verification
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Open Statement of Accounts for a Restaurant.
  2. Verify VAT (e.g. 5%) is calculated correctly based on subtotal.

Expected Result: Math is accurate; tax lines are clearly demarcated.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

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
