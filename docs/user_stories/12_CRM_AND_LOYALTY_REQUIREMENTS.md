# Growth & CRM (Loyalty) Requirements

## 1. Overview
This document captures high-fidelity User Stories for the Customer Relationship Management (CRM) and Loyalty module, augmented with industry-leading features from top-tier platforms (Punchh, Thanx, SevenRooms). The goal is to move beyond simple point-based systems toward zero-friction identity, predictive marketing, and gamified guest engagement.

## 2. User Roles
*   **Server/Cashier:** Identifies guests, manages rewards, and provides personalized service based on guest ledgers.
*   **Guest:** Participates in loyalty programs, earns/redeems rewards via app, QR, or card-linking.
*   **Manager:** Configures membership tiers, launches automated AI campaigns, and handles service recovery.
*   **System (AI Engine):** Segment guests, predicts churn, and automates marketing triggers.

## 3. User Stories

### Epic 1: Zero-Friction Guest Identity & Profiling
**Goal:** Eliminate registration friction while building a 360-degree guest ledger.

**[US-1.1]: Omni-Channel Profile Search & Lookup**
- **As a** Cashier,
- **I want to** search for a guest by phone number, name, or QR code scan from the POS,
- **so that** I can accurately link their order to their profile without delaying the line.

*Acceptance Criteria:*
- ✅ **Happy Path:** Searching "555-0199" returns "John Doe". Attaching profile displays "VIP" tag and "Allergic: Nuts" note within 500ms.
- ✅ **Edge Case:** Multiple profiles for one name; system must display phone digits for disambiguation.
- ✅ **Failure/Error:** If no profile is found, the "Quick Create" modal must require ONLY Phone Number (name/email optional) to maximize enrollment.
- ✅ **Permission Gate:** N/A
- ✅ **Cross-Module Impact:** Attaching a guest must update the Floor Plan table icon to show "Loyal Guest" status.

**[US-1.2]: Card-Linked Loyalty (Automatic Recognition)**
- **As a** Guest,
- **I want to** be automatically identified and credited points when I pay with a previously linked credit card,
- **so that** I don't have to provide my phone number or scan an app every time I visit.

*Acceptance Criteria:*
- ✅ **Happy Path:** System uses an encrypted card token (via payment gateway) to lookup the guest profile. If match exists, "John Doe recognized" appears on POS screen.
- ✅ **Edge Case:** Expired card; system should prompt to link the new card to the existing account during checkout.
- ✅ **Failure/Error:** Payment gateway downtime; POS must fallback to manual phone number lookup.
- ✅ **Permission Gate:** N/A (Encryption handled by Gateway).
- ✅ **Cross-Module Impact:** Integrates with `Payment` module; loyalty logic must fire upon `PAYMENT_AUTHORIZED`.

---

### Epic 2: Intelligent Loyalty Tiers & Gamification
**Goal:** Drive higher LTV (Lifetime Value) through tiered status and behavioral rewards.

**[US-2.1]: Multi-Tier Membership Infrastructure**
- **As a** Manager,
- **I want to** define membership tiers (e.g., Bronze, Silver, Gold) with different point multipliers and exclusive perks,
- **so that** high-spending guests are incentivized to visit more frequently.

*Acceptance Criteria:*
- ✅ **Happy Path:** Gold members earn 1.5x points per $1. System automatically upgrades guests when rolling 12-month spend exceeds a threshold.
- ✅ **Edge Case:** Tier demotion; guests falling below spend must receive a "Maintenance Warning" SMS 30 days before tier drop.
- ✅ **Failure/Error:** Manager enters overlapping spend thresholds; system must block save with a validation error.
- ✅ **Permission Gate:** Manager PIN required to edit tier configurations.
- ✅ **Cross-Module Impact:** Pricing engine must detect guest tier to apply "Member-Only" discounts automatically.

**[US-2.2]: Gamified Engagement Challenges (Streaks/Badges)**
- **As a** System (AI Engine),
- **I want to** issue "Visit Streaks" or "Item Badges" (e.g., "The Burger Hunter" - order 5 different burgers),
- **so that** guests are psychologically incentivized to explore the menu and return.

*Acceptance Criteria:*
- ✅ **Happy Path:** Completing a streak awards a one-time "Bonus Reward" (e.g., 500 bonus points).
- ✅ **Edge Case:** Multiple concurrent streaks; guest sees progress bars in the mobile guest app.
- ✅ **Failure/Error:** Redundant streak logic; system must prevent a single purchase from triggering more than 2 distinct challenge completions.
- ✅ **Permission Gate:** N/A
- ✅ **Cross-Module Impact:** Requires real-time menu item classification to track specific categories (Burgers, Drinks).

---

### Epic 3: Predictive Marketing & Service Recovery
**Goal:** Automate retention and prevent guest churn using data.

**[US-3.1]: AI-Driven Churn Prediction (Win-Back Campaigns)**
- **As a** Manager,
- **I want to** automatically send a "We Miss You" SMS with a 20% discount to guests who haven't visited in 45 days,
- **so that** I can recover potentially lost revenue.

*Acceptance Criteria:*
- ✅ **Happy Path:** System daily scans for "at-risk" profiles. Re-engagement rate must be tracked (Did they visit within 7 days of SMS?).
- ✅ **Edge Case:** Holiday closures; AI must offset "last visit" calculation by local holiday dates.
- ✅ **Failure/Error:** Opt-out handling; system must NEVER send SMS to profiles marked `unsubscribed`.
- ✅ **Permission Gate:** Manager must define the SMS template and discount value once; automation thereafter is "System" role.
- ✅ **Cross-Module Impact:** Integrates with `Marketing` module and `POS` for coupon redemption tracking.

**[US-3.2]: Real-Time Service Recovery (Automated Apology)**
- **As an** Owner,
- **I want to** trigger an automated apology and a "Dessert on Us" voucher if a guest submits a feedback rating < 2 stars,
- **so that** I can mitigate negative reviews before they reach social media.

*Acceptance Criteria:*
- ✅ **Happy Path:** Negative rating fires SMS/Email within 60 seconds of feedback submission.
- ✅ **Edge Case:** Repeat negative feedback; system flags for manual Manager phone call instead of another automated coupon.
- ✅ **Failure/Error:** Rating submission without contact info; system ignores trigger (can't send coupon).
- ✅ **Permission Gate:** N/A (Automated).
- ✅ **Cross-Module Impact:** Requires integration with Epic 4 (Feedback).

---

### Epic 4: Reputation & Behavioral Insights
**Goal:** Close the loop between guest satisfaction and operational performance.

**[US-4.1]: Automated NPS & Post-Meal Sentiment Loop**
- **As a** Guest,
- **I want to** receive a friction-less 1-click rating request after my meal,
- **so that** I can share my experience without filling out long forms.

*Acceptance Criteria:*
- ✅ **Happy Path:** SMS link opens a mobile-optimized page with 5 stars and one text field.
- ✅ **Edge Case:** Takeout vs. Dine-in; system varies the delay (30 min for dine-in, 60 min for takeout).
- ✅ **Failure/Error:** Double submission; system must link feedback to `OrderTicket_UUID` to prevent spamming.
- ✅ **Permission Gate:** N/A
- ✅ **Cross-Module Impact:** Aggregated scores must be displayed on the Analytics "Staff Performance" dashboard.
