# Guest Relations & Loyalty Deep Dive

Shopro's CRM is far more than a digital Rolodex; it is an intelligent engagement engine that builds guest profiles through behavioral data and enforces strict data integrity during maintenance.

## 1. Intelligent Loyalty Engine
The loyalty system uses a tiered architecture that automatically adjusts to guest behavior.

### Technical Implementation
- **Dynamic Tiering**: `LoyaltyServiceImpl.java` utilizes an `autoUpgradeTier` mechanism. After every purchase, the system checks the guest's `lifetimeSpend` against established `LoyaltyTier` thresholds. If a guest crosses a threshold, they are instantly upgraded, granting them access to a higher `pointMultiplier`.
- **Compound Calculation**: Points are calculated using a base `earningRate` (global), multiplied by the user's `tierMultiplier`, and then potentially scaled again by `BonusPointEvent` multipliers (e.g., "Triple Point Thursday").
- **Transactional Redemption**: Point redemption is governed by global constraints (`minimumRedemptionPoints`) and transactional integrity, ensuring a guest's balance can never fall below zero even during high-concurrency order events.

---

## 2. Forensic Profile Merging
Duplicate profiles are inevitable in hospitality. Shopro handles merges with a "gravity-wells" approach where data from a source profile is pulled into a target.

### Safeguards & Logic
- **Data Migration**: `CustomerServiceImpl.java` performs a deep merge:
    1. **Aggregates Quantities**: Sums points, spend, and visit counts.
    2. **Temporal Resolution**: Updates `lastVisitAt` to the most recent value across both profiles.
    3. **Relationship Re-parenting**: The system executes bulk updates across the `LoyaltyTransaction`, `OrderTicket`, and `GuestFeedback` repositories to point all historical records to the new target ID.
- **Frontend Guardrails**: The `MergeProfilesModal.tsx` forces a "Compare & Review" phase. A clear UI warning emphasizes that the source profile will be permanently deleted while its "DNA" (points and history) is absorbed by the target.

---

## 3. Personalization & Preference Mapping
The CRM captures guest nuances through specialized data structures:
- **Dietary Tagging**: A dedicated sub-module for tracking allergies and preferences (e.g., Vegan, Nut Allergy) that can be surfaced at the POS during ordering.
- **Occasion Tracking**: Captures birthdays and anniversaries with optional "Annual Reminder" flags to facilitate proactive marketing via the `NotificationEngine`.
- **Preference Notes**: Free-text fields for high-touch service details (e.g., "Prefers table 12", "Always orders sparkling water").
