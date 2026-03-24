# UI Plan — Bidding Engine Enhancements

## Core UX Modules

### 1. Bid Creation Wizard (Extension)
- **Path**: `shopro-marketplace/src/pages/operator/BidCreation.tsx`
- **Updates**:
  - **Step 2 (Bid protocol)**: Add "Operational Mode" selector (AUTOMATIC, SEMI-AUTOMATIC, MANUAL).
  - **Step 2 (Bid protocol)**: Add "Repeat Frequency" configuration (NONE, DAILY, WEEKLY, MONTHLY).
- **Components**: 
  - `OperationalModeSelector`: Card-based radio group.
  - `FrequencyConfig`: Select + helper text for `nextRunDate`.

### 2. Weighted Evaluation Dashboard (New)
- **Path**: `shopro-marketplace/src/pages/operator/BidEvaluation.tsx`
- **Purpose**: Compare quotes with "Reliability Node" scoring.
- **Components**:
  - `QuoteComparisonTable`: Columns for Total Price, Lead Time, and Reliability Score.
  - `ReliabilityBadge`: Color-coded chip (Green 4.5+, Amber 3.5+, Red <3.5).
  - `WeightedAwardButton`: Single-click award in SEMI/MANUAL modes.

### 3. Quote Submission Modal (Update)
- **Path**: `shopro-marketplace/src/components/supplier/QuoteSubmissionModal.tsx`
- **Updates**:
  - Add `leadTime` field (Global and per-item).
  - Multi-item pricing grid with total calculation.

## Component Reuse
- `Card` → `src/components/ui/card.tsx`
- `Table` → `src/components/ui/table.tsx`
- `Badge` → `src/components/ui/badge.tsx`
- `SecureOverlay` → `src/components/SecureOverlay.tsx`

## Validation Strategy
- **Library**: `react-hook-form` + `zod`.
- **Logic**: 
  - If `operationMode === 'AUTOMATIC'`, `deadline` must be at least +24h.
  - `leadTime` must be positive integer.

## API Integration
- `POST /api/operator/bids`: Payload updated with `operationMode`, `repeatFrequency`.
- `POST /api/supplier/quotes`: Payload updated with `leadTime`, `items`.
- `GET /api/operator/bids/:id/comparison`: New endpoint for the dashboard.
