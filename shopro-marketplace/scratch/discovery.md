# Discovery Summary — SEALED

## Seal status
- Questions raised: 4
- Resolved (doc): 0
- Resolved (inferred): 1
- Resolved (user/assumption): 3
- Open/unresolved: 0

## Operational Architecture
- **Modes**: AUTOMATIC, SEMI-AUTOMATIC, MANUAL.
- **Timing**: 3-day default deadline for "Time-to-Quote".
- **Weighting**: Mock performance scoring (BidRate 90%, Quality 4.5/5).
- **Automation**: Rolling intervals for repeat frequencies.
- **Notification**: REST integration with `shopro-pos-server` (Target: `SUPPLIER_ADMIN`).

## Entity Scoping (Phase 2 Preview)
- `BidInvitation`: Add `operationMode`, `repeatFrequency`, `nextRunDate`.
- `Quote`: Add `leadTime`, `items`.
- `QuoteItem`: Add `leadTime`, `offeredQuantity`.
- `BidItem`: Add `remainingQuantity` (Design only).
