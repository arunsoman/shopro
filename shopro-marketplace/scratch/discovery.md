# Phase 1 Discovery: Restaurant Onboarding Widget

## Core Entity: `Restaurant`
- Table: `restaurant`
- Key Fields: `onboarding_status`, `verification_status`, `name`, `category`, `city`, `volume`, `trust_score`.

## Target Location: `RestaurantManagement.tsx`
- The widget will replace the static "Onboard Hub node" placeholder (lines 203-211).
- It will use a collapsible/expandable design as requested.

## API Integration:
- GET `/api/operator/restaurants` for the list.
- PATCH `/api/operator/restaurants/{id}/status` for status updates (already exists).
- NEW: POST `/api/operator/onboarding/restaurant` for new registration.
- NEW: PATCH `/api/operator/onboarding/restaurant/{id}` for editing details.

SEALED: Phase 1
