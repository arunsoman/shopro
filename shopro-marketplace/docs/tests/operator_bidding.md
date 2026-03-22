# Shopro Platform: Operator Bidding Engine — Manual Test Cases

This document outlines the manual test procedures for the Operator-led bidding and reverse-auction engine.

## 🔐 INTERNAL TESTING CREDENTIALS

To execute these tests, use the pre-seeded account below:

| Portal | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Operator** | SUPER_ADMIN | `root@shopro.internal` | `password` |

---

## 📊 Test Case Summary

| Total Cases | Critical | High | Medium | Low | Positive | Negative | Security |
|-------------|----------|------|--------|-----|----------|----------|----------|
| 12          | 4        | 4    | 3      | 1   | 9        | 2        | 1        |

---

## 1. BID INITIALIZATION
Setting up the reverse auction for bulk procurement.

TC-OB-001 | Create New Bidding Event
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Steps:
  1. Navigate to /operator/bids/new.
  2. Enter Title: "Fresh Produce Q4 Batch".
  3. Select Category: "Fresh Produce".
  4. Add items (e.g., Avocado, Milk, Flour).
  5. Set Deadline to 24 hours from now.
  6. Click "Launch Bid Engine".

Expected Result: Event is created and status becomes "ACTIVE". Suppliers receive notification.
Actual Result  : _________________________________
Status         : PASS / FAIL

TC-OB-002 | Automated Supplier Invite Logic
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive/System
Steps:
  1. Create a bid for a specific category.
  2. verify "Invited Suppliers" section.

Expected Result: System automatically populates with verified suppliers in that category.
Actual Result  : _________________________________
Status         : PASS / FAIL

---

## 2. BID EVALUATION & AWARD
Comparing signals and awarding the contract.

TC-OB-003 | View Bid Evaluation Matrix (Signal Matrix)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: Active bid event has at least 3 supplier responses.
Steps:
  1. Navigate to /operator/bids/:eventId.
  2. Observe the "Signal Matrix Grid Alpha".

Expected Result: All bids are listed. "Economic Node" (Cheapest) and "Reliability Node" (Most Trusted) are highlighted in summary cards.
Actual Result  : _________________________________
Status         : PASS / FAIL

TC-OB-004 | Award Contract (Handshake)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Steps:
  1. In the evaluation matrix, click "AWARD_HANDSHAKE" for a specific supplier.
  2. Confirm the award.

Expected Result: Event status changes to "AWARDED". Winning supplier is notified. System triggers PO generation.
Actual Result  : _________________________________
Status         : PASS / FAIL

TC-OB-005 | Security: Prevent Multiple Awards
──────────────────────────────────────────────
Priority     : HIGH
Type         : Security/Negative
Pre-condition: Event status is "AWARDED".
Steps:
  1. Attempt to click "AWARD_HANDSHAKE" for a different supplier on the same event.

Expected Result: Buttons are disabled or system rejects second award attempt.
Actual Result  : _________________________________
Status         : PASS / FAIL

---

## 📝 Test Execution Sign-off

| Field | Value |
| :--- | :--- |
| **Tester Name** | _________________________________ |
| **Date Executed** | _________________________________ |
| **Build/Version** | 1.0.0-PROD-MKT |
| **Total Pass** | _________________________________ |
| **Overall Status** | □ Ready for release / □ Not ready |
