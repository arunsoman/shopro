# Phase 2 Entity Questions

1. **Category Values:** What are the standard categories for restaurants in the Shopro ecosystem?
   - **Answer (Infer):** From `RestaurantManagement.tsx`, categories like "Produce", "Premium", "Organic" are mentioned. I'll use a dynamic list from the backend if possible, or a standard set: [QSR, Fine Dining, Cafe, Cloud Kitchen].

2. **Validation Rules:** Any specific constraints (phone length, GSTIN format for India)?
   - **Answer (Domain):** Indian phone numbers are 10 digits. GSTIN is 15 chars. I'll include these in the Zod schema for safety.

3. **Status Transitions:** Who can change the status from PENDING to ACTIVE?
   - **Answer (System):** Operator Portal users (Operators) can verify restaurants. This widget is for them, so I'll include a "Verify" toggle.
