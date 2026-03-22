# Shopro Platform: Order & Logistics Orchestration — Manual Test Cases

This document outlines the manual test procedures for verifying purchase order management, cluster-based splitting, and delivery orchestration features.

## 📊 Test Case Summary

| Total Cases | Critical | High | Medium | Low | Positive | Negative | Security |
|-------------|----------|------|--------|-----|----------|----------|----------|
| 52          | 22       | 18   | 9      | 3   | 36       | 14       | 2        |

---

## 1. PO INBOX & QUEUE MANAGEMENT
Core purchase order auditing and assignment.

TC-OLO-001 | Sort POs by Priority/Urgency
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: Multiple POs present in inbox at http://localhost:5173/operator/po/inbox.
Steps:
  1. Click the "Priority" column header.
  2. Verify sorting (Urgent > High > Medium > Low).

Expected Result: POs reorder according to business priority level.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-OLO-002 | Filter by Restaurant Name
──────────────────────────────────────────────
Priority     : MEDIUM
Type         : Positive
Test Data    : Restaurant: "Bistro Blue"

Steps:
  1. Use the Filter menu in PO Inbox.
  2. Select "Bistro Blue".

Expected Result: Only POs from Bistro Blue are displayed.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-OLO-003 | Global Search by PO ID
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Test Data    : PO ID: e.g. "PO-8821"

Steps:
  1. Enter PO ID into the search bar.
  2. Press Enter.

Expected Result: Target PO is isolated in the list.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 2. PO REVIEW & AUDIT
TC-OLO-004 | Line Item Data Accuracy
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: PO selected.
Steps:
  1. Compare PO Review screen quantities/SKUs against the original Restaurant PO or database record.

Expected Result: All line item data (SKU, Name, Unit Price, Total) matches perfectly.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 3. PO SPLITTING WORKSPACE (OP-05)
TC-OLO-005 | Initialize New Dispatch Cluster
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: POSplit screen (/operator/po/:poId/split).
Steps:
  1. Click "Initialize New Dispatch Node" (Plus button).
  2. Give the cluster a name (e.g. "Frozen Node").

Expected Result: A new empty cluster card appears in the workspace.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-OLO-006 | Segment Item into Cluster
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: Cluster exists; Unassigned items present.
Steps:
  1. Locate item in "Awaiting Routing" list.
  2. Click the specific Cluster Number assignment button (e.g. "1").

Expected Result: Item moves from unassigned list into the specific cluster card.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-OLO-007 | Toggle Fulfillment Mode: Direct vs Bid
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Click "Handshake.Bid" on a cluster.
  2. Observe UI change.
  3. Click "Handshake.Direct" on the same cluster.

Expected Result: Status badge changes; "Connect Supplier" button appears for Direct mode.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-OLO-008 | Connect Handshake Supplier (Direct)
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive/Security
Pre-condition: Cluster set to Direct mode.
Steps:
  1. Click "Connect Supplier".
  2. Select a supplier from the registry modal.
  3. Verify Trust Score is displayed.

Expected Result: Supplier node is successfully linked to the cluster.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 4. DISPATCH PROTOCOL
TC-OLO-009 | Dispatch Readiness Checklist
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Steps:
  1. Ensure all items are assigned.
  2. Ensure all Direct nodes have suppliers.
  3. Verify the footer checklist items are all GREEN.

Expected Result: Checklist reflects 100% readiness.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-OLO-010 | COMMIT & DISPATCH Execution
──────────────────────────────────────────────
Priority     : CRITICAL
Type         : Positive
Pre-condition: Full readiness checklist achieved.
Steps:
  1. Click "COMMIT & DISPATCH".
  2. Verify redirection to Inbox/Outbox.

Expected Result: System generates Sub-POs and dispatches notifications; Parent PO moves to "Processing" status.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

TC-OLO-011 | Reject Dispatch with Unassigned Items
──────────────────────────────────────────────
Priority     : HIGH
Type         : Negative
Pre-condition: One or more SKUs are still in "Awaiting Routing".
Steps:
  1. Click "COMMIT & DISPATCH".

Expected Result: Action is blocked; "Zero Unassigned Nodes" checklist item is NOT green; Error Tooltip shown.
Actual Result  : _________________________________
Status         : PASS / FAIL
Failure Reason : _________________________________

---

## 5. SUB-PO & LOGISTICS
TC-OLO-012 | Sub-PO Link Verification
──────────────────────────────────────────────
Priority     : HIGH
Type         : Positive
Pre-condition: PO split successful.
Steps:
  1. Navigate to /operator/po/:poId/sub-pos.
  2. Verify list of child POs created.

Expected Result: Each sub-PO is correctly linked to parent; items are allocated as per split logic.
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
