# Open Questions — Phase 1 Discovery (Bidding Engine)

## Q1 [RESOLVED — User]
**Observation:** The Intelligent Weighting logic requires data on *Bid Response Rate*, *Fulfillment Accuracy*, and *Product Quality*.
**Resolution:** User directed to **MOCK** these metrics for the current iteration.

## Q2 [RESOLVED — Inferred]
**Observation:** `BidCreation.tsx` line 85 sets the default deadline to `now + 3 days` if not specified.
**Resolution:** Use 3 days as the default window for "Time-to-Quote" in AUTOMATIC mode, unless overridden by the Operator.

## Q3 [RESOLVED — Assumption]
**Resolution:** Notifications for `BID_INVITATION` will target the `SUPPLIER_ADMIN` role by default.

## Q4 [RESOLVED — Assumption]
**Resolution:** "Weekly" frequency will be implemented as a rolling 7-day interval from the last bid launch for simplicity.
